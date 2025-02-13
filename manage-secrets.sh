#!/bin/bash

# Exit on error
set -e

# AWS region
AWS_REGION="us-east-1"

# AWS Secret name
SECRET_NAME="mqttSecurity"

# List of expected secret keys
SECRETS=(
    "ca_password"
    "crt_subject"
    "csr_subject"
    "client_csr_subject"
    "ca_crt"
    "ca_key"
    "server_crt"
    "server_key"
)

# Base64 encoded secrets
BASE64_SECRETS=(
    "ca_crt"
    "ca_key"
    "server_crt"
    "server_key"
)

# Function to check if a string is in an array
contains() {
    local needle="$1"
    shift
    local haystack=("$@")
    printf '%s\n' "${haystack[@]}" | grep -q "^${needle}$"
}

# Function to check if a Docker secret exists
check_secret_exists() {
    docker secret inspect "mqtt_$1" >/dev/null 2>&1
}

# Function to create Docker secret
create_docker_secret() {
    local secret_name="$1"
    local secret_value="$2"
    
    # Create a temporary file to store the secret
    local temp_file=$(mktemp)
    echo -n "$secret_value" > "$temp_file"
    
    # Create Docker secret
    docker secret create "mqtt_$secret_name" "$temp_file" >/dev/null
    
    # Remove temporary file
    rm "$temp_file"
    
    echo "Created Docker secret: mqtt_$secret_name"
}

# Main script
echo "Checking and creating Docker secrets..."

# Get all secrets from AWS Secrets Manager
AWS_SECRET_JSON=$(aws secretsmanager get-secret-value \
    --secret-id "$SECRET_NAME" \
    --region "$AWS_REGION" \
    --query 'SecretString' \
    --output text)

if [ $? -ne 0 ]; then
    echo "Error: Failed to retrieve secrets from AWS Secrets Manager"
    exit 1
fi

# Process each secret
for SECRET_KEY in "${SECRETS[@]}"; do
    if ! check_secret_exists "$SECRET_KEY"; then
        echo "Docker secret mqtt_$SECRET_KEY doesn't exist, creating..."
        
        # Extract the secret value using jq
        SECRET_VALUE=$(echo "$AWS_SECRET_JSON" | jq -r ".$SECRET_KEY")
        
        if [ "$SECRET_VALUE" = "null" ]; then
            echo "Warning: Secret $SECRET_KEY not found in AWS Secrets Manager"
            continue
        fi
        
        # If it's a base64 encoded secret, decode it
        if contains "$SECRET_KEY" "${BASE64_SECRETS[@]}"; then
            SECRET_VALUE=$(echo "$SECRET_VALUE" | base64 -d)
        fi
        
        create_docker_secret "$SECRET_KEY" "$SECRET_VALUE"
    else
        echo "Docker secret mqtt_$SECRET_KEY already exists"
    fi
done

echo "Secret management completed"

# List all Docker secrets
echo -e "\nCurrent Docker secrets:"
docker secret ls
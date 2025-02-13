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

# Function to validate base64 string
is_valid_base64() {
    local input="$1"
    echo "$input" | base64 -d >/dev/null 2>&1
    return $?
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

# Function to process a single secret
process_secret() {
    local SECRET_KEY="$1"
    local SECRET_VALUE="$2"
    
    if ! check_secret_exists "$SECRET_KEY"; then
        echo "Docker secret mqtt_$SECRET_KEY doesn't exist, creating..."
        
        if [ -z "$SECRET_VALUE" ] || [ "$SECRET_VALUE" = "null" ]; then
            echo "Error: Secret $SECRET_KEY is empty or null in AWS Secrets Manager"
            return 1
        fi
        
        # If it's a base64 encoded secret, validate and decode it
        if contains "$SECRET_KEY" "${BASE64_SECRETS[@]}"; then
            if ! is_valid_base64 "$SECRET_VALUE"; then
                echo "Error: Invalid base64 encoding for secret $SECRET_KEY"
                echo "Please check the encoding in AWS Secrets Manager"
                return 1
            fi
            SECRET_VALUE=$(echo "$SECRET_VALUE" | base64 -d)
        fi
        
        create_docker_secret "$SECRET_KEY" "$SECRET_VALUE"
    else
        echo "Docker secret mqtt_$SECRET_KEY already exists, skipping..."
    fi
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

# Track any errors
HAS_ERRORS=0

# Process each secret
for SECRET_KEY in "${SECRETS[@]}"; do
    # Extract the secret value using jq
    SECRET_VALUE=$(echo "$AWS_SECRET_JSON" | jq -r ".$SECRET_KEY")
    
    if ! process_secret "$SECRET_KEY" "$SECRET_VALUE"; then
        HAS_ERRORS=1
        echo "Warning: Failed to process secret $SECRET_KEY"
        continue
    fi
done

if [ $HAS_ERRORS -eq 1 ]; then
    echo -e "\nWarning: Some secrets failed to process. Please check the errors above."
else
    echo -e "\nAll secrets processed successfully!"
fi

# List all Docker secrets
echo -e "\nCurrent Docker secrets:"
docker secret ls

# Return appropriate exit code
exit $HAS_ERRORS
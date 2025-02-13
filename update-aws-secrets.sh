#!/bin/bash

# Exit on error
set -e

# AWS region
AWS_REGION="us-east-1"
SECRET_NAME="mqttSecurity"

# Function to properly base64 encode a file
encode_file() {
    if [ -f "$1" ]; then
        # Use base64 without wrapping (-w 0) and remove any trailing newlines
        base64 -w 0 "$1" | tr -d '\n'
    else
        echo "Error: File $1 not found"
        return 1
    fi
}

# Get current secrets
echo "Retrieving current secrets from AWS Secrets Manager..."
CURRENT_SECRETS=$(aws secretsmanager get-secret-value \
    --secret-id "$SECRET_NAME" \
    --region "$AWS_REGION" \
    --query 'SecretString' \
    --output text)

# Create new JSON with updated base64 values
echo "Encoding certificate files..."
NEW_SECRETS=$(echo $CURRENT_SECRETS | jq \
    --arg ca_crt "$(encode_file "./mosquitto/certs/ca.crt")" \
    --arg ca_key "$(encode_file "./mosquitto/certs/ca.key")" \
    --arg server_crt "$(encode_file "./mosquitto/certs/server.crt")" \
    --arg server_key "$(encode_file "./mosquitto/certs/server.key")" \
    '. + {
        ca_crt: $ca_crt,
        ca_key: $ca_key,
        server_crt: $server_crt,
        server_key: $server_key
    }')

# Update AWS Secrets Manager
echo "Updating AWS Secrets Manager..."
aws secretsmanager update-secret \
    --secret-id "$SECRET_NAME" \
    --secret-string "$NEW_SECRETS" \
    --region "$AWS_REGION"

echo "Secrets updated successfully!"

# Verify the encoding
echo -e "\nVerifying base64 encoding of updated secrets..."
aws secretsmanager get-secret-value \
    --secret-id "$SECRET_NAME" \
    --region "$AWS_REGION" \
    --query 'SecretString' \
    --output text | jq -r '.ca_crt' | base64 -d > /dev/null 2>&1 && \
    echo "ca_crt: Valid base64 encoding" || echo "ca_crt: Invalid base64 encoding"

aws secretsmanager get-secret-value \
    --secret-id "$SECRET_NAME" \
    --region "$AWS_REGION" \
    --query 'SecretString' \
    --output text | jq -r '.ca_key' | base64 -d > /dev/null 2>&1 && \
    echo "ca_key: Valid base64 encoding" || echo "ca_key: Invalid base64 encoding"

aws secretsmanager get-secret-value \
    --secret-id "$SECRET_NAME" \
    --region "$AWS_REGION" \
    --query 'SecretString' \
    --output text | jq -r '.server_crt' | base64 -d > /dev/null 2>&1 && \
    echo "server_crt: Valid base64 encoding" || echo "server_crt: Invalid base64 encoding"

aws secretsmanager get-secret-value \
    --secret-id "$SECRET_NAME" \
    --region "$AWS_REGION" \
    --query 'SecretString' \
    --output text | jq -r '.server_key' | base64 -d > /dev/null 2>&1 && \
    echo "server_key: Valid base64 encoding" || echo "server_key: Invalid base64 encoding"
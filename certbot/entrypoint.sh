#!/bin/sh
# Entrypoint script that uses environment variables correctly

# Check if environment variables are set
if [ -z "$email" ] ; then
  echo "Error: email and hostname environment variables must be set"
  exit 1
fi

# Run certbot with the provided environment variables
certbot certonly --webroot -w /var/www/certbot --force-renewal --email "$email" -d "dopesilicon.com" --agree-tos
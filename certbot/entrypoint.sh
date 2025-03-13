#!/bin/sh
# Entrypoint script that uses environment variables correctly

# Check if environment variables are set
if [ -z "$email" ] ; then
  echo "Error: email and hostname environment variables must be set"
  exit 1
fi

# Run certbot with the provided environment variables
exec certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --force-renewal \
  --email "$email" \
  --domain "dopesilicon.com" \
  --agree-tos \
  --no-eff-email
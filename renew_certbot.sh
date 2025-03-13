#!/bin/bash

# Pull the latest certbot image from ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 182399716240.dkr.ecr.us-east-1.amazonaws.com

# Option 1: Use docker-compose
cd /home/ubuntu/iot-server
docker-compose -f docker-compose.certbot.yml run --rm certbot

# Option 2: Direct docker run command (if you prefer not to use compose)
# docker run --rm \
#   -v /home/ubuntu/iot-server/certbot/conf:/etc/letsencrypt \
#   -v /home/ubuntu/iot-server/certbot/www:/var/www/certbot \
#   182399716240.dkr.ecr.us-east-1.amazonaws.com/certbot:latest \
#   certonly --webroot -w /var/www/certbot --force-renewal --email your-email@example.com -d yourdomain.com --agree-tos

# (Optional) If renewal was successful, reload NGINX to use the updated certificate
docker service update --force iot-stack_nginx

# Use official Certbot image as base
FROM certbot/certbot:latest

# Set the maintainer label
LABEL maintainer="martin.mwiti.n@gmail.com"

# Create necessary directories for Let's Encrypt
RUN mkdir -p /etc/letsencrypt /var/www/certbot

# These will be provided at runtime
ENV email=""
ENV hostname=""

# Define the command for certificate renewal
# CMD ["sh", "-c", "certbot certonly --webroot -w /var/www/certbot --force-renewal --email $email -d $hostname --agree-tos"]
ENTRYPOINT ["sh", "-c", "certbot certonly --webroot -w /var/www/certbot --force-renewal --email $email -d $hostname --agree-tos"]

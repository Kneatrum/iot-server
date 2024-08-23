#!/bin/bash

echo "Installing docker..."
sudo yum install -y docker

echo "Starting docker..."
sudo service docker start


sudo usermod -a -G docker ec2-user

echo "Installing docker compose"
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose


sudo chmod +x /usr/local/bin/docker-compose

# Get the hostname IP address
HOST_URL=$(hostname -I)

# Navigate to the ./back-end/ directory (ensure this directory exists)
cd ./back-end/

# Create the .env file and save the hostname IP address in it
echo "HOST_URL=$HOST_URL" | sudo tee .env > /dev/null

# Create a temporary user and password with an organization and a bucket.
ADMIN_USERNAME=admin
ADMIN_PASSWORD=adminpassword
ORG_NAME=adminorg
BUCKET_NAME=adminbucket

echo "ADMIN_USERNAME=$ADMIN_USERNAME" | sudo tee -a .env > /dev/null
echo "ADMIN_PASSWORD=$ADMIN_PASSWORD" | sudo tee -a .env > /dev/null
echo "ORG_NAME=$ORG_NAME" | sudo tee -a .env > /dev/null
echo "BUCKET_NAME=$BUCKET_NAME" | sudo tee -a .env > /dev/null

# Go back to the root directory
cd ../

# Run the docker containers
sudo docker-compose up
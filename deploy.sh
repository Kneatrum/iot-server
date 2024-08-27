#!/bin/bash

echo "Installing docker..."
sudo yum install -y docker || { echo "Docker installation failed"; exit 1; }

echo "Starting docker..."
sudo service docker start || { echo "Failed to start Docker"; exit 1; }

sudo usermod -a -G docker ec2-user

echo "Installing docker compose..."
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose || { echo "Docker Compose download failed"; exit 1; }

sudo chmod +x /usr/local/bin/docker-compose

# Verify Docker Compose installation
docker-compose --version || { echo "Docker Compose installation verification failed"; exit 1; }

# Run the docker containers
sudo docker-compose up  || { echo "Failed to start Docker Compose"; exit 1; }
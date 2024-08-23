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

# Check if the .env file exists in the ./back-end/ directory
if [ -f "./back-end/.env" ]; then
    echo ".env file exists in the ./back-end/ directory."
else
    echo ".env file does not exist in the ./back-end/ directory."

    # Get the hostname IP address
    HOST_URL=$(hostname -I)

    # Navigate to the ./back-end/ directory (ensure this directory exists)
    cd ./back-end/ || { echo "Failed to change directory to ./back-end/"; exit 1; }

    # Create the .env file and save the hostname IP address in it
    echo "HOST_URL=$HOST_URL" | sudo tee .env > /dev/null

    # Defining constants for influxdb initialization
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=adminpassword
    ORG_NAME=adminorg
    BUCKET_NAME=adminbucket

    # Defining the constants for the service names and URLs
    INFLUXDB_HOST=http://Influxdb:8086
    FRONTEND_HOST=http://front-end:3001
    BACKEND_HOST=http://back-end:3000
    MQTT_HOST=mqtt://mosquitto:1883

    echo "ADMIN_USERNAME=$ADMIN_USERNAME" | sudo tee -a .env > /dev/null
    echo "ADMIN_PASSWORD=$ADMIN_PASSWORD" | sudo tee -a .env > /dev/null
    echo "ORG_NAME=$ORG_NAME" | sudo tee -a .env > /dev/null
    echo "BUCKET_NAME=$BUCKET_NAME" | sudo tee -a .env > /dev/null

    echo "INFLUXDB_HOST=$INFLUXDB_HOST" | sudo tee -a .env > /dev/null
    echo "FRONTEND_HOST=$FRONTEND_HOST" | sudo tee -a .env > /dev/null
    echo "BACKEND_HOST=$BACKEND_HOST" | sudo tee -a .env > /dev/null
    echo "MQTT_HOST=$MQTT_HOST" | sudo tee -a .env > /dev/null

    # Go back to the root directory
    cd ../ || { echo "Failed to change directory back to root"; exit 1; }
fi

# Run the docker containers
sudo docker-compose up  || { echo "Failed to start Docker Compose"; exit 1; }
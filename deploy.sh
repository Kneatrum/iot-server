#!/bin/bash

echo "Installing docker..."
sudo yum install -y docker

echo "Starting docker..."
sudo service docker start


sudo usermod -a -G docker ec2-user

echo "Installing docker compose"
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose


sudo chmod +x /usr/local/bin/docker-compose

sudo docker-compose up
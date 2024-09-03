# AWS Secrets Manager with Docker and EC2

## Project Overview

This project demonstrates how to set up and use AWS Secrets Manager within a Docker container running on an EC2 instance. The application utilizes the AWS SDK for JavaScript to securely manage and retrieve secrets.

## Features

- **AWS Secrets Manager Integration**: Utilizes the AWS SDK for JavaScript to interact with AWS Secrets Manager.
- **Docker Container**: Configures and runs a Node.js application within a Docker container.
- **EC2 Instance Deployment**: Deploys the Docker container on an AWS EC2 instance.
- **IMDSv2 Configuration**: Configures the EC2 instance to use Instance Metadata Service version 2 (IMDSv2) for enhanced security.

## Setup Instructions

1. **Create and Configure AWS Secrets Manager Secret**: Store your secrets in AWS Secrets Manager.
2. **Docker Setup**:
   - Create a Dockerfile to build the Node.js application.
   - Configure Docker Compose for the application.
3. **Deploy on EC2**:
   - Launch an EC2 instance.
   - Install Docker and Docker Compose on the instance.
   - Deploy the Docker container with the Node.js application.
4. **Configure IMDSv2**:
   - Update the EC2 instance metadata options to use IMDSv2.

## Usage

1. **Build and Run Docker Container**:
   ```bash
   docker-compose build
   docker-compose up

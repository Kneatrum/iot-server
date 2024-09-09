#!/bin/bash

# Function to get the PID of the process using port 3000
get_pid_on_port() {
    lsof -t -i:3000
}

# Ensure that InfluxDB is up
status=$(sudo systemctl is-active influxdb)

if [ "$status" == "active" ]; then
    echo "InfluxDB is running."
    sleep 1
else
    echo "InfluxDB is not running. Status: $status"
    echo "Attempting to start InfluxDB..."
    sudo systemctl start influxdb
    if [ $? -eq 0 ]; then
        echo "InfluxDB started successfully."
        sleep 1
    else
        echo "Failed to start InfluxDB."
        exit 1
    fi
fi

# Check if Mosquitto is running
status=$(sudo systemctl is-active mosquitto)

if [ "$status" == "active" ]; then
    echo "Mosquitto broker is running."
    sleep 1
else
    echo "Mosquitto broker is not running. Status: $status"
    echo "Attempting to start Mosquitto broker..."
    sudo systemctl start mosquitto
    if [ $? -eq 0 ]; then
        echo "Mosquitto broker started successfully."
        sleep 1
    else
        echo "Failed to start Mosquitto broker."
        exit 1
    fi
fi

# Check if Nginx is running
status=$(sudo systemctl is-active nginx)

if [ "$status" == "active" ]; then
    echo "Nginx is running."
    sleep 1
else
    echo "Nginx is not running. Status: $status"
    echo "Attempting to start Nginx..."
    sudo systemctl start nginx
    if [ $? -eq 0 ]; then
        echo "Nginx started successfully."
        sleep 1
    else
        echo "Failed to start Nginx."
        exit 1
    fi
fi

# Navigate to the back-end directory
echo "Inside back-end"
sleep 1
cd back-end || { echo "Failed to change directory to back-end"; exit 1; }

# Check if something is running on port 3000
if lsof -i:3000 >/dev/null 2>&1; then
    echo "Port 3000 is in use."
    pid=$(get_pid_on_port)
    echo "Process with PID $pid is using port 3000."

    # Prompt user to kill the process
    read -p "Would you like to kill the process using port 3000? (y/n): " response
    if [ "$response" == "y" ]; then
        echo "Killing process $pid..."
        sudo kill -9 "$pid"
        if [ $? -eq 0 ]; then
            echo "Process $pid killed successfully."
        else
            echo "Failed to kill process $pid."
            exit 1
        fi
    else
        echo "Exiting script as process will not be killed."
        exit 1
    fi
fi

echo "Port 3000 is free. Starting the back end..."
echo "Running npm run dev"
npm run dev &
backend_pid=$!

# Wait for the server to start (example check for port 3000)
echo "Waiting for the back end to be ready..."
while ! nc -z localhost 3000; do
    sleep 1
done

echo "The back end is up and running."

# Navigate back to the root of the project.
echo "Back to the root directory"
sleep 1
cd ..

# Navigate to the front-end project.
echo "Inside the front-end"
sleep 1
cd front-end || { echo "Failed to change directory to front-end"; exit 1; }

# Build front end
echo "Running the <npm run build> command"
sleep 1
npm run build
if [ $? -eq 0 ]; then
    echo "Build process successful."
    sleep 5
else
    echo "Building the front end was not successful."
    exit 1
fi

# Copy build files to NGINX
echo "Moving build files"
sleep 5
sudo rsync -av --delete ./build/ ../../../../var/www/html/

# Restart nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx
sleep 2

# Check the status of Nginx
status=$(sudo systemctl is-active nginx)
if [ "$status" == "active" ]; then
    echo "Nginx is running."
    sleep 5
else
    echo "Nginx is not running. Status: $status"
    exit 1
fi

#!/bin/bash

<< comment
This script installs the following on an Ubuntu environment.
- Influxdb
- Mosquitto MQTT Broker
- Nginx web server
comment

echo "_____________________________Setting up Influxdb________________________________________________"
echo "Adding the InfluxData key to verify downloads and add the repository"
sleep 0.5

curl --silent --location -O \
https://repos.influxdata.com/influxdata-archive.key
echo "943666881a1b8d9b849b74caebf02d3465d6beb716510d86a39f6c8e8dac7515  influxdata-archive.key" \
| sha256sum --check - && cat influxdata-archive.key \
| gpg --dearmor \
| sudo tee /etc/apt/trusted.gpg.d/influxdata-archive.gpg > /dev/null \
&& echo 'deb [signed-by=/etc/apt/trusted.gpg.d/influxdata-archive.gpg] https://repos.influxdata.com/debian stable main' \
| sudo tee /etc/apt/sources.list.d/influxdata.list

echo "Installing influxdb"
sleep 0.5
sudo apt-get update && sudo apt-get install influxdb2 -y

echo "Starting influxdb"
sleep 0.5
sudo service influxdb start


echo "____________________________________Installing Mosquitto Broker________________________________"
sleep 0.5
version=$(lsb_release -rs)
version_major=${version%%.*}

if [ "$version_major" -gt 18 ]; then
    sudo apt update -y && sudo apt install mosquitto mosquitto-clients -y
    status=$(sudo systemctl is-active mosquitto)
    if [ "$status" == "active" ]; then
        echo "Mosquitto is running."
    else
        echo "Mosquitto is not running. Status: $status"
        echo "Starting Mosquitto.."
        sudo systemctl start mosquitto
        sudo systemctl enable mosquitto
        echo "Done"
    fi
else
    echo "The Ubuntu version is 18 or lower: $version"
fi

echo "_______________________________Installing Nginx________________________________________________"
sudo apt update
sudo apt install nginx -y

echo "Done installing nginx"



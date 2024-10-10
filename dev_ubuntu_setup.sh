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

echo "Installing Postgres database"
sudo apt install postgresql -y

PG_CONF_FILE="/etc/postgresql/14/main/postgresql.conf"
LISTEN_ADDRESS="0.0.0.0"  # Set this to the IP address or IP addresses you want

# Check if the file exists
if [[ ! -f "$PG_CONF_FILE" ]]; then
  echo "Error: Configuration file $PG_CONF_FILE does not exist."
  exit 1
fi

# Use sed to uncomment and set listen_addresses
# The `^` anchors the search to the beginning of the line, while `s` substitutes the text
sed -i "/^#listen_addresses =.*/s/^#//; s/listen_addresses = .*/listen_addresses = '$LISTEN_ADDRESS'/" "$PG_CONF_FILE"

# Inform the user of the change
echo "The listen_addresses parameter has been updated in $PG_CONF_FILE to '$LISTEN_ADDRESS'."



# Prompt user for the new password
read -sp "Enter the new password for the postgres user: " POSTGRES_PASSWORD
echo

# Run the command to set the password using heredoc
sudo -u postgres psql postgres <<EOF
ALTER USER postgres WITH PASSWORD '${POSTGRES_PASSWORD}';
EOF

# Check if the command was successful
if [ $? -eq 0 ]; then
    echo "Password for the postgres user has been successfully changed."
else
    echo "Failed to change the password."
fi

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



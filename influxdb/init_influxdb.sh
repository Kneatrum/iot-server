#!/bin/bash


# Access the environment variables
USERNAME=${ADMIN_USERNAME}
PASSWORD=${ADMIN_PASSWORD}
ORG=${ORG_NAME}
BUCKET=${BUCKET_NAME}


# Wait for InfluxDB to start
until curl -s http://influxdb:8086/health | grep "ready"; do
    echo "Waiting for InfluxDB to start..."
    sleep 1
done


influx setup \
    --username "$USERNAME" \
    --password "$PASSWORD" \
    --org "$ORG" \
    --bucket "$BUCKET" \
    --retention 0 \
    --force


# influx write \
#     --bucket "$BUCKET" \
#     --org "$ORG" \
#     --precision s \
#     "temperature,device=device_1 value=25"
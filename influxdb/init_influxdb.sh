#!/bin/sh

set -a
. ./back-end/.env
set +a

sleep 10

influx setup --skip-verify --bucket fitbit --org kneatrum --username martin --password martin1234 --token "$API_TOKEN"  --force 

# Add measurements
measurements="sleep,idling,walking,jogging,biking,heart,steps,temperature"

for measurement in ${measurements//,/ }
do
    influx write --bucket fitbit --org kneatrum --precision s --record $measurement
done
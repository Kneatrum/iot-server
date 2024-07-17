# Use the official InfluxDB 2 image
FROM influxdb:2

# Set working directory
WORKDIR /influxdb

ENV ADMIN_USERNAME=martin
ENV ADMIN_PASSWORD=martinpass
ENV ORG_NAME=kneatrum
ENV BUCKET_NAME=fitbit

# Copy the initialization script
COPY config.json config.json
COPY init_influxdb.sh /docker-entrypoint-initdb.d/init_influxdb.sh

# Expose the InfluxDB port
EXPOSE 8086

# Command to run the InfluxDB service
# Start InfluxDB and run the initialization script
CMD ["sh", "-c", "influxd run & /docker-entrypoint-initdb.d/init_influxdb.sh && tail -f /dev/null"]
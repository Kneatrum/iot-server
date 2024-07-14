# Use the official InfluxDB image as a base
FROM influxdb:latest

# Set working directory
WORKDIR /influxdb

# Set environment variables
ENV INFLUXDB_DB=fitnessdb
ENV INFLUXDB_ADMIN_USER=martin
ENV INFLUXDB_ADMIN_PASSWORD=martin1234

ENV INFLUXDB_API_TOKEN_FILE=/run/secrets/influxdb_api_token

# Expose the InfluxDB port
EXPOSE 8086

# Copy the initialization script
COPY init_influxdb.sh /docker-entrypoint-initdb.d/init_influxdb.sh

# Set execution permissions for the script
RUN chmod +x /docker-entrypoint-initdb.d/init_influxdb.sh

# Start InfluxDB and run the initialization script
CMD ["sh", "-c", "influxd run & sleep 10 && /docker-entrypoint-initdb.d/init_influxdb.sh && tail -f /dev/null"]


# docker run -d -p 8086:8086 --name influxdb-container -v data:/var/lib/influxdb influxdb



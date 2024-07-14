# Use the official Eclipse Mosquitto image as a base
FROM eclipse-mosquitto:latest

# Set working directory
WORKDIR /mosquitto

# Copy configuration files
COPY config /mosquitto/config
COPY data /mosquitto/data
COPY log /mosquitto/log

# Expose the necessary ports
EXPOSE 1883
EXPOSE 9001

# Run Mosquitto broker
CMD ["mosquitto", "-c", "/mosquitto/config/mosquitto.conf"]

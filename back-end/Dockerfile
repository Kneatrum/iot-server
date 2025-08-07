# Base image with a specific Node.js version
FROM node:20.13.0-alpine


# Set the working directory
WORKDIR /back-end

# Copy only package.json and package-lock.json first for efficient caching
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy the rest of the application code
COPY ./auth ./auth
COPY ./databases ./databases
COPY ./exchange_rates ./exchange_rates
COPY ./mpesa_countries ./mpesa_countries
COPY ./mpesa_helpers ./mpesa_helpers
COPY ./mqtt ./mqtt
COPY ./openxchangerates ./openxchangerates
COPY ./router ./router
COPY ./schedules ./schedules
COPY ./secrets ./secrets
COPY ./sessionInspector ./sessionInspector
COPY ./.env ./.env
COPY ./constants.js ./constants.js
COPY ./deviceRegistry.js ./deviceRegistry.js
COPY ./expressServer.js ./expressServer.js
COPY ./index.js ./index.js
# COPY ./.env.development ./.env.development



# Expose the application port
EXPOSE 3000

# Use a more direct way to run the app
CMD ["sh", "-c", \
"if [ \"$NODE_ENV\" = \"development\" ]; then npm run dev; \
elif [ \"$NODE_ENV\" = \"production\" ]; then npm run start; \
else echo \"Unknown NODE_ENV=$NODE_ENV\"; exit 1; fi"]

# Base image with a specific Node.js version
FROM node:20.13.0-alpine

# Set the working directory
WORKDIR /back-end

# Copy only package.json and package-lock.json first for efficient caching
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy the rest of the application code
COPY ./database ./database
COPY ./mqtt ./mqtt
COPY ./router ./router
COPY ./constants.js ./constants.js
COPY ./index.js ./index.js
COPY ./.env ./.env
COPY ./secrets ./secrets



# Expose the application port
EXPOSE 3000

# Use a more direct way to run the app
CMD ["node", "index.js"]

# Use a minimal base image
FROM alpine:latest

# Install Node.js and NPM
RUN apk add --no-cache nodejs npm

# Set a working directory (optional)
WORKDIR /test

# Copy package.json and package-lock.json if available
COPY package*.json ./

# Install dependencies
RUN npm install

COPY index.js ./

# Start an interactive shell
CMD ["sh"]

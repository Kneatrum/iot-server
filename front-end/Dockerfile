# Use a multi-stage build to reduce the final image size
FROM node:20.13.0-alpine AS builder

# Set the working directory
WORKDIR /front-end

# Copy only the package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY ./public ./public
COPY ./src ./src
COPY .env .env

# Build the React app
RUN npm run build

# Production stage to copy the build output
FROM nginx:stable-alpine

# Set the working directory
WORKDIR /front-end

# Copy the build output from the previous stage
COPY --from=builder /front-end/build /usr/share/nginx/html

# Expose the port Nginx is configured to listen on
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]

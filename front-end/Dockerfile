# Build stage for React app
FROM node:20.13.0-alpine AS builder

ENV NODE_ENV=production
ENV DISABLE_ESLINT_PLUGIN=true
ENV GENERATE_SOURCEMAP=false

WORKDIR /front-end

# Copy package files
COPY front-end/package*.json ./

# Install dependencies
RUN npm ci --only=production \
    && npm cache clean --force

# Copy source files
COPY ./ ./

# Build the app
RUN npm run build

# Final nginx stage
FROM nginx:stable-alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built React app from builder stage
COPY --from=builder /front-end/build /usr/share/nginx/html

# Verify the files are copied
RUN ls -la /usr/share/nginx/html/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
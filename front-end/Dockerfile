FROM node:20.13.0-alpine AS builder

# Set environment variables
ENV NODE_ENV=production
ENV DISABLE_ESLINT_PLUGIN=true
ENV GENERATE_SOURCEMAP=false

WORKDIR /front-end

# Copy package files
COPY package*.json ./

# Install dependencies with a single layer and clean up in the same step
RUN npm ci --only=production \
    && npm cache clean --force \
    && rm -rf /root/.npm/_cacache

# Copy only necessary files
COPY . .

# Build the app
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /front-end/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# Use a small Node image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package.json and lockfile first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Vite app
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Cloud Run will set $PORT; default to 8080 if not set
ENV PORT=8080

# Expose the port (for documentation)
EXPOSE 8080

# Serve the built app from dist/
CMD ["serve", "-s", "dist", "-l", "8080"]

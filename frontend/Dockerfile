# Use Node.js to build the static files
FROM node:16-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code and build the app
COPY . .
RUN npm run build

# Output: Static files in /app/build

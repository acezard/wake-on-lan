# Base image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Build arguments
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# Copy package.json and lock file
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all application files
COPY . .

# Expose the application port
EXPOSE 8080

# Default command (overridden by docker-compose)
CMD ["npm", "run", "start"]

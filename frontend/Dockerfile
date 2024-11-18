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

# Copy the rest of the frontend app
COPY . .

# Expose port for development server
EXPOSE 3000

# Default command (overridden by docker-compose)
CMD ["npm", "run", "start"]

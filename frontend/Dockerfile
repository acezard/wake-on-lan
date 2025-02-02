# Base image
FROM node:22-alpine

RUN npm install -g npm@11.1.0

# Set the working directory
WORKDIR /app

# Build arguments and environment variables
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# Copy package.json and package-lock.json first to leverage cache
COPY package.json package-lock.json ./

# Install dependencies using npm ci for reproducible installs.
# In production, install only production dependencies.
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --omit=dev && npm cache clean --force; \
    else \
      npm ci && npm cache clean --force; \
    fi

# Copy the rest of the frontend app source code
COPY . .

# Expose port for the development server
EXPOSE 3000

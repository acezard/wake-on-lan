FROM node:22-alpine

RUN npm install -g npm@11.1.0

WORKDIR /app

# Set environment variables; NODE_ENV defaults to development
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# Copy dependency files first for caching
COPY package.json package-lock.json ./

# Use npm ci for a clean, reproducible install.
# If NODE_ENV is production, install only production dependencies.
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --omit=dev && npm cache clean --force; \
    else \
      npm ci && npm cache clean --force; \
    fi

# Copy the rest of the application code
COPY . ./

EXPOSE 8080

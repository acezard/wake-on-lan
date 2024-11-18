#!/bin/bash
set -e  # Exit on any error

log() {
  echo "$(date +"%Y-%m-%d %H:%M:%S") - $1"
}

ENV=${1:-dev}  # Default to 'dev' if no argument is provided
# Default DETACHED to 'false' for dev, 'true' for prod
if [ "$ENV" == "prod" ]; then
  DETACHED=${2:-true}
else
  DETACHED=${2:-false}
fi

log "Script started with ENV=$ENV and DETACHED=$DETACHED"

if [ "$ENV" == "dev" ]; then
  log "🐳 Starting in development mode..."
  
  log "🐳 Stopping any running containers..."
  NODE_ENV=development docker-compose down --remove-orphans
  
  log "🐳 Building development environment (this may take a while)..."
  NODE_ENV=development docker-compose build
  
  if [ "$DETACHED" == "true" ]; then
    log "🐳 Starting services in development mode (detached)..."
    NODE_ENV=development exec docker-compose up -d
  else
    log "🐳 Starting services in development mode (attached)..."
    NODE_ENV=development exec docker-compose up
  fi

elif [ "$ENV" == "prod" ]; then
  log "🐳 Starting in production mode..."
  
  log "🐳 Stopping any running containers..."
  NODE_ENV=production docker-compose down --remove-orphans
  
  log "🐳 Building production environment with no cache (this may take a while)..."
  NODE_ENV=production docker-compose build --no-cache
  
  if [ "$DETACHED" == "true" ]; then
    log "🐳 Starting services in production mode (detached)..."
    NODE_ENV=production exec docker-compose up -d
  else
    log "🐳 Starting services in production mode (attached)..."
    NODE_ENV=production exec docker-compose up
  fi

else
  log "❌ Unknown environment: $ENV"
  log "Usage: $0 [dev|prod] [true|false (for detached mode)]"
  exit 1
fi

log "✅ Script completed successfully."

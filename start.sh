#!/bin/bash
set -e  # Exit on any error

log() {
  echo "$(date +"%Y-%m-%d %H:%M:%S") - 🐢 $1"
}

# Parse arguments
ENV=dev  # Default environment
detached=false
debug=false

for arg in "$@"; do
  case $arg in
    dev|prod|debug)  # Recognize 'debug' as a valid environment
      ENV=$arg
      ;;
    true|false)
      detached=$arg
      ;;
    --debug)
      debug=true
      ;;
    *)
      log "❌ Unknown argument: $arg"
      log "Usage: $0 [dev|prod|debug] [true|false (for detached mode)] [--debug]"
      exit 1
      ;;
  esac
done

# Set correct environment variables
if [ "$ENV" == "prod" ]; then
  DETACHED=${detached:-true}
  export NODE_ENV=production
elif [ "$ENV" == "debug" ]; then
  DETACHED=${detached:-false}
  export NODE_ENV=development
  export LOG_LEVEL=debug
else
  DETACHED=${detached:-false}
  export NODE_ENV=development
fi

if [ "$debug" == "true" ]; then
  export LOG_LEVEL=debug
fi

log "Script started with ENV=$ENV, DETACHED=$DETACHED, DEBUG=$debug"

cleanup() {
  log "Cleaning up stopped containers, networks, builder cache, and unused volumes..."
  docker container prune -f
  docker network prune -f
  docker builder prune -f
  docker volume prune -f
}

log "Stopping any running containers..."
docker-compose down --remove-orphans --volumes

cleanup

log "Building $ENV environment (this may take a while)..."
docker-compose build $( [ "$ENV" == "prod" ] && echo "--no-cache" )

if [ "$DETACHED" == "true" ]; then
  log "Starting services in $ENV mode (detached)..."
  exec env NODE_ENV=$NODE_ENV LOG_LEVEL=$LOG_LEVEL docker-compose up -d
else
  log "Starting services in $ENV mode (attached)..."
  exec env NODE_ENV=$NODE_ENV LOG_LEVEL=$LOG_LEVEL docker-compose up
fi

log "✅ Script completed successfully."

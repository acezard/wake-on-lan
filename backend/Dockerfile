FROM node:16-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy backend source
COPY . .

# Run the build script before starting the app
CMD ["sh", "-c", "npm run build && npm start"]

FROM node:16-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy backend source
COPY . .

CMD ["npm", "start"]

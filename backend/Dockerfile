FROM node:22-alpine

# Install necessary packages
RUN apk add --no-cache arp-scan

WORKDIR /app

ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV
ENV DISPLAY=:99

COPY package.json package-lock.json ./
RUN npm install

COPY . ./

EXPOSE 80

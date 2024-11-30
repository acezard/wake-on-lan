FROM node:22-alpine

# Install necessary packages
RUN apk add --no-cache freerdp xvfb

WORKDIR /app

ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV
ENV DISPLAY=:99

COPY package.json package-lock.json ./
RUN npm install

COPY . ./

EXPOSE 8080

CMD sh -c "Xvfb :99 -screen 0 1024x768x24"

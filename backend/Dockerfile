# FROM ghcr.io/puppeteer/puppeteer:21.5.1
# FROM node:14-slim
FROM node:lts-alpine

RUN apk update && apk add --no-cache nmap && \
   echo @edge https://dl-cdn.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
   echo @edge https://dl-cdn.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
   apk update && \
   apk add --no-cache \
   chromium \
   harfbuzz \
   "freetype>2.8" \
   ttf-freefont \
   nss

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true\
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
CMD [ "node", "index.js" ]
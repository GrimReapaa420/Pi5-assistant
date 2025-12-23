ARG BUILD_FROM=ghcr.io/home-assistant/aarch64-base:latest
FROM ${BUILD_FROM}

RUN apk add --no-cache \
    nodejs \
    npm \
    i2c-tools \
    spi-tools

WORKDIR /app

COPY package.json ./
RUN npm install

COPY client ./client
COPY server ./server
COPY shared ./shared
COPY script ./script
COPY tsconfig.json vite.config.ts drizzle.config.ts ./

RUN npm run build

COPY run.sh /
RUN chmod a+x /run.sh

EXPOSE 8099

CMD [ "/run.sh" ]

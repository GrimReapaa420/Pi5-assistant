ARG BUILD_FROM
FROM ${BUILD_FROM}

RUN apk add --no-cache \
    nodejs \
    npm \
    python3 \
    py3-pip \
    i2c-tools \
    spi-tools

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

COPY run.sh /
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]

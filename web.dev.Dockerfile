# To be run in /app

FROM node:20-bookworm

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY package*.json /home/node/app/
RUN npm ci

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "/home/node/app/docker-entrypoint.dev.sh"]

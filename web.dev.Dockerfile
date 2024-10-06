# To be run in /app

FROM node:22-alpine

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY package.json /home/node/app
RUN npm install

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "/home/node/app/docker-entrypoint.dev.sh"]

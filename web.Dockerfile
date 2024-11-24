# To be run in app

# build 
FROM node:20-bookworm
WORKDIR /build

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY . /build
RUN npm install
RUN npm run build

# run
FROM node:20-alpine

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --from=0 --chown=node:node /build/.next /home/node/app/.next
COPY --from=0 --chown=node:node /build/public /home/node/app/public
COPY --from=0 --chown=node:node /build/package*.json /home/node/app/
COPY --from=0 --chown=node:node /build/next.config.mjs /home/node/app/
COPY --from=0 --chown=node:node /build/next-env.d.ts /home/node/app/
COPY --from=0 --chown=node:node /build/postcss.config.mjs /home/node/app/
COPY --from=0 --chown=node:node /build/tsconfig.json /home/node/app/
COPY --from=0 --chown=node:node /build/tailwind.config.ts /home/node/app/
COPY --from=0 --chown=node:node /build/docker-entrypoint.sh /home/node/app/

RUN npm install --only=production
RUN chmod +x /home/node/app/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "/home/node/app/docker-entrypoint.sh"]

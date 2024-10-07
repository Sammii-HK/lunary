
FROM node:18-alpine

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
RUN yarn

COPY ./public /app/public
COPY ./src /app/src
COPY ./utils /app/utils
COPY next.config.mjs /app/next.config.mjs
COPY postcss.config.mjs /app/postcss.config.mjs
COPY tailwind.config.ts /app/tailwind.config.ts
COPY tsconfig.json /app/tsconfig.json

CMD yarn build && yarn start
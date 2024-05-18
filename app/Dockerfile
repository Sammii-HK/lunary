
FROM node:18-alpine

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
RUN npm install

COPY ./public /app/public
COPY ./src /app/src
COPY ./utils /app/utils
COPY next-env.d.ts /app/next-env.d.ts
COPY next.config.mjs /app/next.config.mjs
COPY postcss.config.mjs /app/postcss.config.mjs
COPY tailwind.config.ts /app/tailwind.config.ts
COPY tsconfig.json /app/tsconfig.json

CMD npm run build && npm start
FROM node:latest

WORKDIR /usr/src/stone/api

COPY . .
COPY ./.env ./.env

RUN npm install --no-found --loglevel=error --no-optional --quiet

RUN npm run test

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
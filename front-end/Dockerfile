FROM node:20.13.0-alpine

WORKDIR /front-end

COPY ./package.json ./package.json

RUN npm install

COPY ./public ./public
COPY ./src ./src
COPY .env/ ./env

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]

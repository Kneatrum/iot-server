FROM node:20.13.0-alpine

WORKDIR /back-end

COPY package*.json ./

RUN npm install --production

COPY ./database ./database
COPY ./mqtt ./mqtt
COPY ./router ./router
COPY ./constants.js ./constants.js
COPY ./index.js ./index.js
COPY ./config.json ./config.json

EXPOSE 3000

CMD ["npm", "start"]

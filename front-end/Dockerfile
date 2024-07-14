FROM node:20.13.0-alpine

WORKDIR /fitbit-front-end

COPY ./package.json ./package.json

RUN npm install

COPY ./public ./public
COPY ./src ./src

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]

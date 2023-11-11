FROM node:20-alpine

RUN apk add --no-cache tzdata

ENV TZ="Europe/Amsterdam"

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "run", "start"]

FROM node:18

RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY package.json .
COPY server.js .

RUN mkdir hls

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]

FROM node:18

RUN apt update && apt install -y ffmpeg

WORKDIR /app

COPY package.json .
COPY server.js .

RUN mkdir hls

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]

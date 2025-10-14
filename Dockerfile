FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production

COPY server.js ./
COPY services/ ./services/
COPY public/ ./public/

EXPOSE 3000

CMD ["node", "server.js"]

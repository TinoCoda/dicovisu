FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/

RUN npm install
RUN npm install --prefix ./frontend --production=false

COPY . .

RUN npm run build --prefix ./frontend

EXPOSE 5000

CMD ["node", "backend/server.js"]

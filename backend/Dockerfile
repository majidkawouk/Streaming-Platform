FROM node:20-bookworm

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .


EXPOSE 3000
EXPOSE 10000-10100/udp

CMD ["sh", "-c", "npm run migration:run && npm start"]
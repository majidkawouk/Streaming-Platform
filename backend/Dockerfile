# Use Node LTS
FROM node:20-bookworm

# Install build essentials for Mediasoup
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

# Mediasoup needs a large range of UDP ports
EXPOSE 3000
EXPOSE 10000-10100/udp

CMD ["npm", "run", "start"]
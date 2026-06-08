# LCGVAP API — production image
FROM node:20-alpine

WORKDIR /app

# wget is used by docker-compose healthchecks
RUN apk add --no-cache wget

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY database ./database

RUN mkdir -p uploads logs

# Run as root so bind-mounted uploads/logs volumes remain writable in Compose.
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "src/server.js"]

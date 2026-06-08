# --- build SPA (Vite resolves import.meta.env at build time)
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:3001
ARG VITE_SYSTEM_NAME=LCGVAP
ARG VITE_SYSTEM_FULL_NAME=Liberian Cyprus Graduates Veteran Alumina Platform

ENV VITE_API_URL=$VITE_API_URL \
    VITE_SYSTEM_NAME=$VITE_SYSTEM_NAME \
    VITE_SYSTEM_FULL_NAME=$VITE_SYSTEM_FULL_NAME

RUN npm run build

# --- serve static bundle (nginx official image substitutes ${PORT} at startup)
FROM nginx:alpine

ENV PORT=80

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.docker.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

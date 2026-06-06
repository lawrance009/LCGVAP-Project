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

# --- serve static bundle
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.docker.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

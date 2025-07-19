# Stage 1: Build with Bun
FROM oven/bun:1.1.13-alpine as build

WORKDIR /app

COPY package.json tsconfig.json vite.config.ts ./
RUN bun install

COPY . .
RUN bun run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

ENV DOMAIN=localhost

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

EXPOSE 80


CMD ["/bin/sh", "-c", "envsubst '$DOMAIN' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
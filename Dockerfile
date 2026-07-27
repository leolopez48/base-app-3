# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24
ARG ALPINE_VERSION=3.22

FROM node:${NODE_VERSION}-alpine AS frontend

WORKDIR /build/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY frontend/ ./

ARG VITE_CLIENT_ID=""
ARG VITE_ISSUER_LOGIN="https://login.codesecuresolutions.com"
ARG VITE_AUTHORIZE_URL="https://login.codesecuresolutions.com/oauth/authorize"
ARG VITE_TOKEN_ENDPOINT="https://login.codesecuresolutions.com/oauth/token"
ARG VITE_USER_API_ENDPOINT="https://login.codesecuresolutions.com/api/user"
ARG VITE_REDIRECT_URI="http://localhost:8080/callback"
ARG VITE_API_GATEWAY_URL=""
ARG VITE_BACKEND_URL=""

ENV VITE_CLIENT_ID=${VITE_CLIENT_ID} \
    VITE_ISSUER_LOGIN=${VITE_ISSUER_LOGIN} \
    VITE_AUTHORIZE_URL=${VITE_AUTHORIZE_URL} \
    VITE_TOKEN_ENDPOINT=${VITE_TOKEN_ENDPOINT} \
    VITE_USER_API_ENDPOINT=${VITE_USER_API_ENDPOINT} \
    VITE_REDIRECT_URI=${VITE_REDIRECT_URI} \
    VITE_API_GATEWAY_URL=${VITE_API_GATEWAY_URL} \
    VITE_BACKEND_URL=${VITE_BACKEND_URL}

RUN npm run build

FROM alpine:${ALPINE_VERSION} AS application

LABEL org.opencontainers.image.source="https://github.com/leolopez48/base-app-3" \
    org.opencontainers.image.description="Base App 3 - Vue, Laravel, Nginx and PHP-FPM" \
    org.opencontainers.image.licenses="MIT"

RUN apk add --no-cache \
    curl \
    imagemagick \
    nginx \
    php83 \
    php83-bcmath \
    php83-cli \
    php83-ctype \
    php83-curl \
    php83-dom \
    php83-fileinfo \
    php83-fpm \
    php83-iconv \
    php83-intl \
    php83-mbstring \
    php83-opcache \
    php83-openssl \
    php83-pcntl \
    php83-pdo \
    php83-pdo_mysql \
    php83-pdo_sqlite \
    php83-pecl-imagick \
    php83-pecl-redis \
    php83-phar \
    php83-session \
    php83-simplexml \
    php83-tokenizer \
    php83-xml \
    php83-xmlreader \
    php83-xmlwriter \
    php83-zip \
    supervisor \
    tzdata \
    && ln -sf /usr/bin/php83 /usr/bin/php \
    && mkdir -p /run/nginx /var/log/supervisor /var/www/html

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html

COPY backend/composer.json backend/composer.lock ./
RUN --mount=type=cache,target=/tmp/composer-cache \
    COMPOSER_CACHE_DIR=/tmp/composer-cache \
    composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader \
    --prefer-dist

COPY backend/ ./
RUN composer dump-autoload \
    --classmap-authoritative \
    --no-dev \
    --no-interaction \
    && ln -sfn ../storage/app/public public/storage

COPY --from=frontend /build/frontend/dist/ ./public/
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/http.d/default.conf
COPY docker/fpm-pool.conf /etc/php83/php-fpm.d/www.conf
COPY docker/php.ini /etc/php83/conf.d/99-base-app.ini
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint

RUN chmod +x /usr/local/bin/docker-entrypoint \
    && mkdir -p \
    bootstrap/cache \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/testing \
    storage/framework/views \
    storage/logs \
    && chown -R nginx:nginx bootstrap/cache storage

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl --fail --silent http://127.0.0.1/fpm-ping || exit 1

ENTRYPOINT ["docker-entrypoint"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

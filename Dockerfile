# syntax=docker/dockerfile:1.7

# =====================================================================
# Stage 1 — Frontend builder
#   Compiles the Vue.js single-page application into static assets
#   served later by Nginx from the `public/` directory.
# =====================================================================
ARG NODE_VERSION=24
ARG ALPINE_VERSION=3.22

FROM node:${NODE_VERSION}-alpine AS frontend

WORKDIR /build

# Install JS dependencies first to take advantage of Docker layer caching:
# this layer is reused as long as package.json / package-lock.json don't change.
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# Vite loads frontend/.env automatically and embeds its VITE_* values.
COPY frontend/ ./
RUN npm run build

# =====================================================================
# Stage 2 — Runtime image
#   Single container running Nginx (web server) + PHP-FPM (Laravel)
#   under Supervisor. Designed to be the only process the host sees.
# =====================================================================
FROM alpine:${ALPINE_VERSION} AS application

# Install system + PHP runtime in a single layer:
#   * nginx / supervisor: web server and process supervisor
#   * php83 + extensions: required by Laravel (curl, mbstring, pdo, etc.)
#   * imagemagick / pecl-imagick / pecl-redis: image + cache backends
#   * curl / tzdata: healthcheck and timezone data
#   * `ln -sf` exposes a plain `php` binary alongside `php83`
#   * `/run/nginx` is needed for the Nginx PID file
RUN apk add --no-cache \
    curl imagemagick nginx supervisor tzdata \
    php83 php83-bcmath php83-cli php83-ctype php83-curl php83-dom \
    php83-fileinfo php83-fpm php83-iconv php83-intl php83-mbstring \
    php83-opcache php83-openssl php83-pcntl php83-pdo php83-pdo_mysql \
    php83-pdo_sqlite php83-pecl-imagick php83-pecl-redis php83-phar \
    php83-session php83-simplexml php83-tokenizer php83-xml \
    php83-xmlreader php83-xmlwriter php83-zip \
    && ln -sf /usr/bin/php83 /usr/bin/php \
    && mkdir -p /run/nginx /var/log/supervisor

# Composer is pulled from its own official image (avoids installing PHP twice).
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies (generates `vendor/`) with a persistent cache.
# `--no-scripts` skips Laravel post-install hooks that would require a full
# application context; the authoritative autoloader is generated afterwards.
COPY backend/composer.json backend/composer.lock ./
RUN --mount=type=cache,target=/tmp/composer-cache \
    COMPOSER_CACHE_DIR=/tmp/composer-cache \
    composer install --no-dev --no-interaction --no-progress \
    --no-scripts --optimize-autoloader --prefer-dist

# Copy backend source, build a classmap-authoritative autoloader (faster
# requests, fails loudly on missing classes), and expose `public/storage`.
COPY backend/ ./
RUN composer dump-autoload --classmap-authoritative --no-dev --no-interaction \
    && ln -sfn ../storage/app/public public/storage

# Bundle the built SPA, web server, PHP, supervisor, and entrypoint configs.
COPY --from=frontend /build/dist/                 ./public/
COPY docker/nginx.conf                            /etc/nginx/nginx.conf
COPY docker/default.conf                          /etc/nginx/http.d/default.conf
COPY docker/fpm-pool.conf                         /etc/php83/php-fpm.d/www.conf
COPY docker/php.ini                               /etc/php83/conf.d/99-base-app.ini
COPY docker/supervisord.conf                      /etc/supervisord.conf
COPY docker/entrypoint.sh                         /usr/local/bin/docker-entrypoint

# Prepare Laravel's writable directories and hand ownership to Nginx
# (PHP-FPM and Nginx both run as the `nginx` user in this image).
RUN chmod +x /usr/local/bin/docker-entrypoint \
    && mkdir -p bootstrap/cache \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/testing \
    storage/framework/views \
    storage/logs \
    && chown -R nginx:nginx bootstrap/cache storage

EXPOSE 80

# Reuse the existing /fpm-ping endpoint exposed by PHP-FPM for liveness.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl --fail --silent http://127.0.0.1/fpm-ping || exit 1

ENTRYPOINT ["docker-entrypoint"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

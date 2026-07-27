#!/bin/sh
set -eu

mkdir -p \
    bootstrap/cache \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/testing \
    storage/framework/views \
    storage/logs

chown -R nginx:nginx bootstrap/cache storage

if [ ! -e public/storage ]; then
    ln -s ../storage/app/public public/storage
fi

exec "$@"

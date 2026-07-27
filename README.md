# Base App 3

Aplicación base Vue/Vite + Laravel empaquetada con la misma arquitectura de
contenedor usada por Vielman:

- Node 22 Alpine compila el frontend.
- Alpine 3.19 ejecuta PHP 8.3-FPM, Nginx y Supervisor.
- Nginx entrega la SPA y enruta `/api` hacia Laravel.
- El contenedor expone el puerto `80`.
- El healthcheck está disponible en `/fpm-ping`.

## Construcción local

```bash
cp .env.docker.example .env
# Define APP_KEY y las variables necesarias.
docker compose build
docker compose up -d
```

La aplicación queda disponible en `http://localhost:8080`. Cuando
`VITE_BACKEND_URL` está vacío, el frontend usa `/api` en el mismo dominio.

## Dokploy

Configura el despliegue con:

- Docker Context Path: `.`
- Dockerfile Path: `/Dockerfile`
- Puerto interno: `80`
- Healthcheck: `/fpm-ping`

Las variables `VITE_*` son argumentos de construcción. Las variables de
Laravel (`APP_*`, `DB_*`, `CACHE_DRIVER`, `QUEUE_CONNECTION` y
`SESSION_DRIVER`) son variables de ejecución.

## Registro de imágenes

El workflow `Docker` valida la imagen en cada pull request y cambio a `main`.
Un tag `v*` o una ejecución manual publica imágenes `linux/amd64` y
`linux/arm64` en:

```text
registry.codesecuresolutions.com/base-app-3
```

El repositorio debe tener los secretos `REGISTRY_USERNAME` y
`REGISTRY_PASSWORD`. Los argumentos públicos del frontend se configuran como
GitHub Actions Variables con sus nombres `VITE_*`.

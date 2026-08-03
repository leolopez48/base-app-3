# Base App 3

Aplicación base Vue/Vite + Laravel empaquetada con la misma arquitectura de
contenedor usada por Vielman:

- Node 24 Alpine compila Vue 3.5 con Vite 8.
- Alpine 3.22 ejecuta Laravel 13 sobre PHP 8.3-FPM, Nginx y Supervisor.
- Nginx entrega la SPA y enruta `/api` hacia Laravel.
- El contenedor expone el puerto `80`.
- El healthcheck está disponible en `/fpm-ping`.

## Construcción local

```bash
docker compose build
docker compose up -d
```

Laravel toma su configuración de `backend/.env`. Durante la construcción,
Vite carga `frontend/.env` y embebe sus variables `VITE_*` en el bundle.
Cuando `VITE_BACKEND_URL` está vacío, el frontend usa `/api` en el mismo
dominio.

`frontend/.env` se versiona porque solo contiene configuración pública. No se
deben guardar secretos, tokens, contraseñas ni claves privadas en variables
`VITE_*`: Vite las publica en el JavaScript que recibe el navegador.

## Dokploy

Configura el despliegue con:

- Docker Context Path: `.`
- Dockerfile Path: `/Dockerfile`
- Puerto interno: `80`
- Healthcheck: `/fpm-ping`

Las variables de Laravel (`APP_*`, `DB_*`, `CACHE_DRIVER`,
`QUEUE_CONNECTION` y `SESSION_DRIVER`) se cargan en tiempo de ejecución.

## Registro de imágenes

El workflow `Docker` valida la imagen en cada pull request y cambio a `main`.
Un tag `v*` o una ejecución manual publica imágenes `linux/amd64` y
`linux/arm64` en:

```text
registry.codesecuresolutions.com/base-app-3
```

El repositorio debe tener los secretos `REGISTRY_USERNAME` y
`REGISTRY_PASSWORD`.

# Innovatech Chile – Monorepo (Backend + Frontend + Infra)

## Descripción

Proyecto de referencia para **Innovatech Chile**: backend **Node.js/Express**, frontend **Vite**, base **PostgreSQL 15**, orquestación con **Docker Compose**, publicación en **Docker Hub** y despliegue automático **GitHub Actions → EC2**.

## Contenido del repositorio

| Carpeta / archivo       | Rol |
|-------------------------|-----|
| `backend/`              | Servicio API (Dockerfile, código Node.js) |
| `frontend/`             | SPA construida con Vite + Nginx (Dockerfile) |
| `docker-compose.yml`    | Levantamiento local/múltiples servicios |
| `.env.example`          | Plantilla de variables (copiar a `.env`) |
| `.github/workflows/`    | CI/CD Backend y Frontend (rama `deploy`) |
| `scripts/`              | Utilidades (`publish-dockerhub.ps1`, setup EC2) |

## Requisitos

- Docker Desktop (o Docker Engine + plugin Compose)
- Git

## Arranque local rápido

```bash
git clone https://github.com/tuusuario/innovatech-monorepo.git
cd innovatech-monorepo
cp .env.example .env
docker compose up --build
```

- **Frontend:** http://localhost  
- **Backend:** http://localhost:3000 (`GET /health`)  
- **PostgreSQL:** `localhost:5432` (solo útil desde el host/dev; las credenciales coinciden con `.env`)

## Documentación por servicio

- [backend/README.md](backend/README.md) — API REST, variables, CI/CD backend  
- [frontend/README.md](frontend/README.md) — SPA Vite/Nginx, `VITE_API_URL`, CI/CD frontend  

## Seguridad

No subir **`.env`** al repositorio (está en `.gitignore`). Usar valores reales sólo en entorno local o en **Secrets** de GitHub/AWS.

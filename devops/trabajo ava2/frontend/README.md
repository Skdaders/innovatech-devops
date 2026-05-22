# Innovatech Chile – Frontend

## Descripción

Este proyecto consiste en la implementación de una arquitectura basada en contenedores utilizando Docker y Docker Compose.


La aplicación está compuesta por:
- Frontend
- Backend
- Base de datos

Además, se implementó automatización CI/CD utilizando GitHub Actions y despliegue en AWS EC2.

## Tecnologías utilizadas

- Docker
- Docker Compose
- Node.js
- Vite / React
- GitHub Actions
- AWS EC2
- Docker Hub

## Arquitectura

Frontend → Backend → Base de datos

## Ejecución local

### Construir y levantar contenedores


### Requisitos

- Docker Desktop instalado  
- Git  

### Pasos

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/tuusuario/innovatech-monorepo.git
   cd innovatech-monorepo
   ```

2. Crear ".env"" en la raíz a partir de ".env.example" y revisar "VITE_API_URL":

   ```bash
   cp .env.example .env
   ```

3. Levantar servicios:

   ```bash
   docker compose up --build
   ```

4. Abrir en el navegador **http://localhost** (puerto 80).

### Solo esta carpeta (imagen Docker)

bash
docker build --build-arg VITE_API_URL=http://localhost:3000 -t innovatech-frontend:local .
docker run --rm -p 8080:80 innovatech-frontend:local
```

(Luego entrá a `http://localhost:8080`.)

Para desarrollo con **hot reload**, podés usar `npm install` y `npm run dev` (Vite); el `Dockerfile` está orientado al **build de producción**.

## Pipeline CI/CD

Workflow: `.github/workflows/deploy-frontend.yml`. Se ejecuta ante **push a la rama `deploy`** cuando cambian archivos bajo `frontend/`.

**Flujo:** build (con variable `VITE_API_URL`) → push a Docker Hub (`innovatech-frontend:latest`) → deploy por SSH en EC2 (contenedor exponiendo puerto **80**).

En GitHub Actions debés configurar el secret **`VITE_API_URL`** con la URL pública/base del API vista desde el navegador en producción.

## Variables relevantes

| Variable        | Cuándo aplica                         | Descripción                                      |
|----------------|-----------------------------------------|--------------------------------------------------|
| `VITE_API_URL` | Build (`docker compose`, CI, `docker build`) | Base URL del API para el bundle del cliente     |

Las variables del backend (`DB_*`) no aplican al contenedor front; siguen configuradas para el servicio backend en Compose o en la EC2 del API.

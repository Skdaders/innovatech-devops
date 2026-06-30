# Innovatech Chile – Backend Service

## Descripción

API REST del sistema de gestión de Innovatech Chile, construida con **Node.js** y diseñada para ejecutarse en **Docker**. En este monorepo, el código del backend vive en `backend/` y se construye desde el `Dockerfile` de esta carpeta.

## Tecnologías

- Node.js 20  
- PostgreSQL 15  
- Docker + Docker Compose  
- GitHub Actions (CI/CD)  
- AWS EC2  

## Cómo levantar localmente

En este proyecto, **PostgreSQL y el backend** se orquestan con `docker-compose.yml` en la **raíz del repositorio** (no dentro de esta carpeta).

### Requisitos

- Docker Desktop instalado  
- Git  

### Pasos

1. Clonar el repositorio (monorepo):

   ```bash
   git clone https://github.com/tuusuario/innovatech-monorepo.git
   cd innovatech-monorepo
   ```

2. Crear el archivo `.env` en la **raíz** del proyecto a partir de `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Editá los valores (`DB_*`, etc.) si lo necesitás.

3. Levantar todos los servicios (base de datos, backend y opcionalmente frontend):

   ```bash
   docker compose up --build
   ```

4. Acceder al backend en **http://localhost:3000**

   Ejemplo de comprobación: **GET** `http://localhost:3000/health`.

### Solo esta carpeta (sin Compose de la raíz)

Si exponés esta carpeta como **repositorio independiente**, construí la imagen y pasá las variables por `docker run` o tu propio `docker-compose`, apuntando `DB_*` a una instancia PostgreSQL accesible.

```bash
docker build -t innovatech-backend:local .
docker run --rm -p 3000:3000 \
  -e PORT=3000 \
  -e DB_HOST=tu-host \
  -e DB_PORT=5432 \
  -e DB_USER=tu-usuario \
  -e DB_PASSWORD=tu-password \
  -e DB_NAME=tu-bd \
  innovatech-backend:local
```

## Pipeline CI/CD

El workflow del backend está en `.github/workflows/deploy-backend.yml`. Se ejecuta ante **push a la rama `deploy`** cuando cambian archivos bajo `backend/` (o ese workflow).

**Flujo:** build de la imagen → push a **Docker Hub** (`innovatech-backend:latest`) → despliegue por **SSH** en EC2.

Configuración de secrets: ver documentación del repositorio o la sección Actions en GitHub.

## Variables de entorno requeridas

| Variable      | Descripción                                   |
|--------------|------------------------------------------------|
| `DB_HOST`    | Host de la base de datos                      |
| `DB_PORT`    | Puerto PostgreSQL (habitual `5432`)           |
| `DB_USER`    | Usuario de la BD                               |
| `DB_PASSWORD`| Contraseña de la BD                            |
| `DB_NAME`    | Nombre de la base de datos                    |
| `PORT`       | Puerto HTTP del proceso Node (ej. `3000`)      |
 
 

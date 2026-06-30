#Imagen  para construir la aplicación
FROM node:20-alpine AS builder

#Carpeta  de trabajo
WORKDIR /app


#Copia archivos de dependencias
COPY package*.json ./

#Instala dependencias necesarias
RUN if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi


COPY . .

#Segunda etapa para producción

FROM node:20-alpine AS production

#Usuario sin Administrador  
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

#Directorio principal
WORKDIR /app

#Copia dependencias desde la etapa builder
COPY --from=builder /app/node_modules ./node_modules
#Copia el proyecto
COPY --from=builder /app .

#Ejecuta la aplicación con usuario seguro
USER appuser
#Puerto utilizado
EXPOSE 3000
#Comando para iniciar
CMD ["node", "index.js"]

# Usa Node.js para construir el frontend
FROM node:20-alpine AS builder

# Variable para la URL de la API
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Carpeta del proyecto
WORKDIR /app

#Copia dependencias
COPY package*.json ./

#Instala paquetes necesarios 
RUN if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

#Copia archivos del proyecto
COPY . .

#Se genera la version final del prontend 
RUN npm run build

#Aplica ngix para produccion
FROM nginx:alpine AS production

#usuario seguro 
RUN adduser -S nginxuser

# Copia archivos compilados
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

#puerto
EXPOSE 80
#Inicio
CMD ["nginx", "-g", "daemon off;"]

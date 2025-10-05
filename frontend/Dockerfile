# Etapa 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build para producción (usa environment.production.ts)
RUN npm run build -- --configuration production

# Etapa 2: Nginx
FROM nginx:alpine

# Copiar build
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copiar configuración nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
# Usamos node en su versión ligera
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de npm
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Crear build de producción
RUN npm run build

# Instalar serve globalmente
RUN npm install -g serve

# Exponer puerto 
EXPOSE 80

# Iniciar serve en el puerto 80
CMD ["serve", "-s", "dist", "-l", "80"]
# 1. Imagen base oficial de Node.js con Puppeteer compatible
FROM node:20-slim

# 2. Instala dependencias del sistema necesarias para Puppeteer + Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libgbm1 \
    libgtk-3-0 \
    chromium && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Establecer variable de entorno para Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 3. Crea y define el directorio de trabajo
WORKDIR /app

# 4. Copia los archivos del backend al contenedor
COPY package*.json ./
COPY . .

# 5. Instala las dependencias de Node.js
RUN npm install

# 6. Expone el puerto que usa tu backend
EXPOSE 3000

# 7. Comando para iniciar la app
CMD ["npm", "start"]

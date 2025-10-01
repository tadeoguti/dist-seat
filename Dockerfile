# Imagen base oficial de Node.js 22.15.0
FROM node:22.15.0-bullseye

# -------------------------------
# Variables de entorno para Puppeteer
# -------------------------------
ENV NODE_ENV=production \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PUPPETEER_DISABLE_SANDBOX=true \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# -------------------------------
# Instalar dependencias del sistema necesarias para Puppeteer y canvas/sharp
# -------------------------------
RUN apt-get update && apt-get install -y \
    chromium \
    iputils-ping \
    fonts-liberation \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxshmfence1 \
    libgtk-3-0 \
    curl \
    wget \
    ca-certificates \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# -------------------------------
# Crear directorio de la app y copiar archivos
# -------------------------------
WORKDIR /usr/src/app
COPY package*.json ./
COPY .env ./

# Instalar dependencias Node
RUN npm install --production

# Copiar el resto del proyecto
COPY . .

# -------------------------------
# Volumen para guardar reportes
# -------------------------------
VOLUME ["/usr/src/app/Resultados"]

# -------------------------------
# Comando por defecto
# -------------------------------
CMD ["node", "src/seat-LotesSitemap-Puppeter.js"]

# SEAT Validator (dist-seat)

## Descripción

Automatización de validación de sitios SEAT utilizando Puppeteer. Este proyecto permite auditar y validar diversos sitios web mediante el análisis de sitemaps, validación de componentes en versión de escritorio y móvil, comparación de imágenes y generación de reportes en Excel.

## Características Principales

- **Validación de Sitemaps y Lotes**: Analiza múltiples URLs de distribuidoras extraídas de sitemaps (`src/seat-LotesSitemap-Puppeter.js`).
- **Validación Móvil**: Realiza auditorías simulando dispositivos móviles (`src/seat-RevisionMobile-Puppeteer.js`).
- **Comparación de Imágenes**: Emplea `resemblejs` y `sharp` para analizar y comparar capturas de pantalla de los componentes.
- **Generación de Reportes**: Exporta los resultados de las validaciones en archivos de Excel mediante `exceljs`.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (recomendado v22.15.0 o superior)

## Instalación

1. Clona el repositorio e ingresa al directorio del proyecto:

   ```bash
   git clone https://github.com/tadeoguti/dist-seat.git
   cd dist-seat
   ```

2. Instala las dependencias de Node:

   ```bash
   npm install
   ```

3. Configura el archivo `.env`. Para tener la ip del servidor del sitio a revisar y credenciales para acceder al sitio reportes netcar.

## Uso (Local)

El proyecto cuenta con varios scripts configurados en el `package.json`:

- **Validación de distribuidoras (Desktop / Sitemaps)**:

  ```bash
  npm start
  # o alternativamente
  npm run validar:distribuidoras
  ```

- **Validación en dispositivos móviles**:
  ```bash
  npm run validar:mobile
  ```

Los reportes generados se guardarán automáticamente en la carpeta `Resultados/` en la raíz del proyecto.

## Estructura del Proyecto

```text
dist-seat/
├── package.json                # Dependencias y scripts de NPM
├── src/                        # Scripts principales de ejecución
│   ├── seat-LotesSitemap-Puppeter.js
│   └── seat-RevisionMobile-Puppeteer.js
├── utils/                      # Módulos y herramientas auxiliares
│   ├── common/                 # Funciones comunes
│   ├── CompararImgs/           # Lógica para comparar capturas (sharp, resemble)
│   ├── files/                  # Manejo de archivos
│   ├── network/                # Herramientas de red y ping
│   ├── Puppeteer/              # Helpers específicos para Puppeteer
│   └── ReportesExcel/          # Generación de reportes de salida
└── Resultados/                 # Directorio donde se almacenan los reportes generados
```

## Tecnologías Utilizadas

- **[Puppeteer](https://pptr.dev/)**: Automatización de navegadores e interacción con el DOM.
- **[ExcelJS](https://github.com/exceljs/exceljs)**: Creación de reportes tabulares avanzados en XLSX.
- **[Resemble.js](https://github.com/rsmbl/Resemble.js) & [Sharp](https://sharp.pixelplumbing.com/)**: Procesamiento y comparación de imágenes.

## Para la ejecución en modo visible o no visible

El modo visible lo controla la funciones driverPuppeteer y emularPuppeteer.

- driverPuppeteer(true/false)
  - driverPuppeteer(true); -> modo visible
  - driverPuppeteer(false); -> modo no visible

- emularPuppeteer(nombreDispositivo, headless, maxPages)
  - nombreDispositivo -> "iPhone 15","Pixel 5","iPhone X","iPad Pro"
  - headless -> true = invisible, false = visible
  - maxPages -> Número máximo de pestañas (ej: 10)

En el archivo src/seat-LotesSitemap-Puppeter.js se tiene las siguientes variables que controlan el modo visible o no visible.

- browserDist -> Obtener distribuidoras a revisar
- homeBrowser -> Obtener home de la distribuidora a revisar
- browser -> Procesar sitemaps

En el archivo src/seat-RevisionMobile-Puppeteer.js se tiene las siguientes variables que controlan el modo visible o no visible.

- browserDist -> Obtener distribuidoras a revisar
- browserBase -> Procesar sitio base a comparar
- browserSitio -> Procesar sitios de las distribuidoras para comparar con el sitio base

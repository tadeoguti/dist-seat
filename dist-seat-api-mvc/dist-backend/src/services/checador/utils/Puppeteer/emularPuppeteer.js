const puppeteer = require("puppeteer");
const { KnownDevices } = puppeteer;
const fs = require("fs");
const path = require("path");

/**
 * Inicia Puppeteer emulando un dispositivo y creando varias pestañas (pages).
 * @param {string} nombreDispositivo - Nombre exacto del dispositivo (ej: "iPhone X", "Pixel 5", "iPad Pro")
 * @param {boolean} headless - true = invisible, false = visible
 * @param {number} maxPages - número máximo de pestañas (ej: 10)
 * @returns {Promise<{ browser: puppeteer.Browser, pages: puppeteer.Page[], deviceData?: object }>}
 */
async function emularPuppeteer(nombreDispositivo, headless = true, maxPages = 1) {
    const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
        headless: headless,        // true = sin ventana, false = visible
        defaultViewport: null, // para usar el viewport completo de la pantalla
        protocolTimeout: 120000,    // (120s = 2 minutos)
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // recomendado para contenedores
        ]
    });
    const device = KnownDevices[nombreDispositivo];
    const pages = [];

    for (let i = 0; i < maxPages; i++) {
        const page = await browser.newPage();
        page.setDefaultTimeout(120000);
        if (device) {
            await page.emulate(device);
        }
        pages.push(page);
    }

    if (device) {
        console.log(`📱 Dispositivo emulado: ${device.name}`);
        console.log(`   Ancho: ${device.viewport.width}px`);
        console.log(`   Alto: ${device.viewport.height}px`);
        console.log(`   Pixel ratio: ${device.viewport.deviceScaleFactor}`);
    } else {
        console.warn(`⚠️ Dispositivo "${nombreDispositivo}" no encontrado. Se abre viewport por defecto.`);
    }
    return {
        browser,
        pages,
        deviceData: device
            ? {
                name: device.name,
                ancho: device.viewport.width,
                alto: device.viewport.height
            }
            : null
    };
}
/**
 * Lista todos los dispositivos disponibles en Puppeteer
 */
async function listarDispositivos() {
    const nombres = Object.keys(KnownDevices);
    console.log(`📱 Dispositivos disponibles (${nombres.length}):\n`);

    let contenido = `📱 Dispositivos disponibles (${nombres.length}):\n\n`;

    nombres.forEach((nombre, i) => {
        const linea = `${i + 1}. ${nombre}`;
        console.log(linea);
        contenido += linea + "\n";
    });
    // Guardar en un archivo .txt
    const filePath = path.join(__dirname, "..", "..", "dispositivos.txt");
    fs.writeFileSync(filePath, contenido, "utf8");

    console.log(`\n✅ Archivo creado en: ${filePath}`);
}

module.exports = { emularPuppeteer, listarDispositivos };
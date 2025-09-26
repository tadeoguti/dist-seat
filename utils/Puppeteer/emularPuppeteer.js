const puppeteer = require("puppeteer");
const { KnownDevices } = puppeteer;
const fs = require("fs");
const path = require("path");

/**
 * Inicia Puppeteer emulando un dispositivo.
 * @param {string} nombreDispositivo - Nombre exacto del dispositivo (ej: "iPhone X", "Pixel 5", "iPad Pro")
 * @param {boolean} headless - true = invisible, false = visible
 * @returns {Promise<{ browser: puppeteer.Browser, page: puppeteer.Page, deviceData?: object }>}
 */
async function emularPuppeteer(nombreDispositivo,headless = true) {
    const browser = await puppeteer.launch({
        headless: headless, // true si no quieres ver la ventana - false para hacer visible la emulación
        defaultViewport: null
    });
    const page = await browser.newPage();

    const device = KnownDevices[nombreDispositivo];

    if (device) {
        await page.emulate(device);
        console.log(`📱 Dispositivo emulado: ${device.name}`);
        console.log(`   Ancho: ${device.viewport.width}px`);
        console.log(`   Alto: ${device.viewport.height}px`);
        console.log(`   Pixel ratio: ${device.viewport.deviceScaleFactor}`);
    } else {
        console.warn(`⚠️ Dispositivo "${nombreDispositivo}" no encontrado. Se abre viewport por defecto.`);
    }

    return { 
        browser, 
        page,
        deviceData: device 
            ? {
                name:device.name,
                ancho:device.viewport.width,
                alto:device.viewport.height
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

module.exports = {emularPuppeteer ,listarDispositivos } ;
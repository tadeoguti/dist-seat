// confPuppeteer.js
const puppeteer = require('puppeteer');

/**
 * Crea y devuelve una instancia de Browser (navegador) de Puppeteer.
 * Por defecto usa Chromium.
 * @param {boolean} headless - true para modo headless, false para visible (defecto: true).
 * @param {{ width: number, height: number }} windowSize - El tamaño de la ventana (defecto: { width: 1920, height: 1080 }).
 * @returns {Promise<puppeteer.Browser>}
 */
async function driverPuppeteer(headless = true, windowSize = { width: 1920, height: 1080 }) {
    let browser;
    try {
        // === ✅ Crear la instancia del Browser ===
        browser = await puppeteer.launch({
            headless: headless, // Controla el modo headless
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
            args: [
                "--no-sandbox", 
                "--disable-setuid-sandbox",
                `--window-size=${windowSize.width},${windowSize.height}` 
            ]
        });

        // En Puppeteer, el tamaño de la ventana se establece en 'args' de launch.
        // Si necesitas ajustar el 'viewport' (el área visible dentro de la ventana)
        // en páginas específicas, lo harías luego con page.setViewport().

        console.log(`Browser de Puppeteer creado en modo ${headless ? 'headless' : 'visible'}.`);
        console.log(`Ventana configurada a ${windowSize.width}x${windowSize.height}.`);

        // Devolvemos el objeto 'browser'. Para interactuar con una URL,
        // necesitarás abrir una nueva página: 'const page = await browser.newPage();'
        return browser;
        
    } catch (error) {
        console.error("Error al crear el Browser de Puppeteer:", error);
        // Si ocurrió un error y el navegador se abrió parcialmente, asegúrate de cerrarlo.
        if (browser) {
            await browser.close();
        }
        throw error;
    }
}

module.exports = driverPuppeteer;
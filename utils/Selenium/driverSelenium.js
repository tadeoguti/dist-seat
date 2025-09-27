// confFirefox.js
const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

/**
 * Crea y devuelve una instancia de WebDriver para Firefox.
 * @param {boolean} headless - true para modo headless, false para visible.
 * @returns {Promise<WebDriver>}
 */
async function driverSelenium(headless = true, windowSize = { width: 1920, height: 1080 }) {
    try {
        let options = new firefox.Options();

        if (headless) {
            options.addArguments("-headless");
        }

        const driver = await new Builder()
            //.forBrowser("firefox")
            //.setFirefoxOptions(options)
            .forBrowser("chrome")
            .setChromeOptions(options)
            .build();
        // === ✅ Establecer tamaño de la ventana ===
        await driver.manage().window().setRect({
            width: windowSize.width,
            height: windowSize.height
        });

        console.log(`WebDriver creado en modo ${headless ? 'headless' : 'visible'}.`);
        console.log(`Ventana configurada a ${windowSize.width}x${windowSize.height}.`);

        return driver;
    
        
    } catch (error) {
        console.error("Error al crear el WebDriver de Firefox:", error);
        throw error;
        
    }
    
}
module.exports = driverSelenium;

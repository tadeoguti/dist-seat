/**
 * Inyecta un hook en la página para capturar errores y warnings de consola.
 * Debe ejecutarse antes de cargar la página.
 * @param {WebDriver} driver - Instancia de Selenium WebDriver
 */
async function capturarErroresConsolaSelenium(driver) {
    await driver.executeScript(() => {
        window.__capturedConsoleErrors = [];
        
        const originalError = console.error;
        console.error = function (...args) {
            window.__capturedConsoleErrors.push(args.join(' '));
            originalError.apply(console, args);
        };

        const originalWarn = console.warn;
        console.warn = function (...args) {
            window.__capturedConsoleErrors.push('WARN: ' + args.join(' '));
            originalWarn.apply(console, args);
        };
    });
}
module.exports = capturarErroresConsolaSelenium;
/**
 * Verifica el estado HTTP de la página actual usando fetch con tiempo de espera.
 * @param {WebDriver} driver - Instancia de Selenium WebDriver.
 * @param {number} timeoutMs - Tiempo máximo de espera en milisegundos (por defecto 5000 ms).
 * @returns {Promise<{status: number, message: string}>}
 */
async function getPageStatusSelenium(driver, timeoutMs = 5000) {
    try {
        return await driver.executeAsyncScript(function(timeout, callback) {
        const controller = new AbortController();
        const signal = controller.signal;

        // Cancelar fetch si excede el tiempo
        const timer = setTimeout(() => controller.abort(), timeout);

        fetch(location.href, { method: 'GET', signal })
        .then(response => {
            clearTimeout(timer);
            const msg = response.ok
            ? `Sitio disponible (status ${response.status})`
            : `Sitio respondió con error (status ${response.status})`;
            callback({ status: response.status, message: msg });
        })
        .catch((error) => {
            clearTimeout(timer);
            const isAbort = error.name === 'AbortError';
            callback({
            status: 0,
            message: isAbort
                ? `Tiempo de espera excedido (${timeout} ms)`
                : `Error de red o sitio caído: ${error.message}`
            });
        });
    }, timeoutMs); // Pasamos el timeout como argumento al navegador
    } catch (e) {
        return {
        status: 0,
        message: `Error al ejecutar el script en el navegador: ${e.message}`
        };
    }
}

module.exports = getPageStatusSelenium;
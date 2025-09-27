/**
 * Verifica el estado HTTP de la página actual usando fetch con tiempo de espera.
 * @param {puppeteer.Page} page - Instancia de una página de Puppeteer.
 * @param {number} timeoutMs - Tiempo máximo de espera en milisegundos (por defecto 5000 ms).
 * @returns {Promise<{status: number, message: string}>}
 */
async function getPageStatusPuppeteer(page, timeoutMs = 5000) {
    try {
        // Ejecutar fetch en el contexto del navegador, con AbortController
        const result = await page.evaluate(async ({ timeout }) => {
            const controller = new AbortController();
            const signal = controller.signal;

            // Configurar timeout para abortar la petición
            const timer = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(window.location.href, {
                    method: 'GET',
                    signal
                });

                clearTimeout(timer);

                const msg = response.ok
                    ? `Sitio disponible (status ${response.status})`
                    : `Sitio respondió con error (status ${response.status})`;

                return { status: response.status, message: msg };
            } catch (error) {
                clearTimeout(timer);

                if (error.name === 'AbortError') {
                    return {
                        status: 0,
                        message: `Tiempo de espera excedido (${timeout} ms)`
                    };
                }

                return {
                    status: 0,
                    message: `Error de red o sitio caído: ${error.message}`
                };
            }
        }, { timeout: timeoutMs }); // Pasamos el valor de timeout al navegador

        return result;
    } catch (e) {
        // Este catch es para errores fuera del evaluate (raro, pero puede pasar)
        return {
            status: 0,
            message: `Error al ejecutar el script en el navegador: ${e.message}`
        };
    }
}

module.exports = getPageStatusPuppeteer;
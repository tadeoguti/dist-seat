// Asegúrate de tener node-fetch si usas una versión de Node < 18
// const fetch = require('node-fetch');

/**
 * Valida el DOM de la página actual para detectar problemas de carga usando Puppeteer.
 * @param {import('puppeteer').Page} page - Instancia de la página de Puppeteer.
 * @param {string[]} capturedConsoleErrors - Un array con los errores de consola capturados previamente.
 * @returns {Promise<{ok: boolean, errores: {tipo: string, detalle: string}[]}>}
 */
async function validarDOMPuppeteer(page, capturedConsoleErrors = []) {
    const errores = [];

    try {
        // 1. Imágenes rotas con detalle
        // CAMBIO: Se usa page.evaluate() en lugar de driver.executeScript()
        const imagenesRotas = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('img'))
                .filter(img =>
                    img.src && img.src.trim() !== '' &&
                    (!img.complete || img.naturalWidth === 0)
                )
                .map(img => ({
                    src: img.src || '(sin src)',
                    alt: img.alt || '(sin alt)'
                }));
        });
        if (imagenesRotas.length > 0) {
            imagenesRotas.forEach(img => {
                errores.push({
                    tipo: 'Imagen_rota',
                    detalle: `SRC: ${img.src} | ALT: ${img.alt}`
                });
            });
        }

        // 2. Texto visible
        const textoVisible = await page.evaluate(() => {
            const bodyText = document.body.innerText.trim();
            return bodyText.length > 0;
        });
        if (!textoVisible) {
            errores.push({
                tipo: 'Texto',
                detalle: 'No hay texto visible en la página.'
            });
        }

        // 3. Enlaces sin destino válido 
        const enlacesSinHref = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .filter(a => {
                    const sinHref = !a.href || a.href.trim() === '#' || a.href.trim() === '';
                    const tieneOnclick = !!a.getAttribute('onclick');
                    return sinHref && !tieneOnclick;
                })
                .map(a => a.outerHTML);
        });
        if (enlacesSinHref.length > 0) {
            enlacesSinHref.forEach(link => {
                errores.push({
                    tipo: 'Enlace_invalido',
                    detalle: link
                });
            });
        }

        // 4. Errores graves en consola
        // CAMBIO: Los errores de consola se reciben como parámetro, ya que se capturan con un listener.
        if (capturedConsoleErrors.length > 0) {
            capturedConsoleErrors.forEach(msg => {
                errores.push({
                    tipo: 'Error_consola',
                    detalle: msg
                });
            });
        }

        // 5. Validar título
        // CAMBIO: Se usa page.title() en lugar de driver.getTitle()
        const titulo = await page.title();
        if (!titulo || titulo.trim() === '') {
            errores.push({
                tipo: 'Titulo',
                detalle: 'Título de la página vacío'
            });
        }

        // 6. Validar meta description
        const metaDescription = await page.evaluate(() => {
            const meta = document.querySelector('meta[name="description"]');
            return meta ? meta.content : '';
        });
        if (!metaDescription || metaDescription.trim() === '') {
            errores.push({
                tipo: 'Etiqueta_Meta',
                detalle: 'Meta description ausente o vacía'
            });
        }
        
        // --- 7. Valida Enlaces externos inválidos (ESTA PARTE NO CAMBIA) ---
        // La lógica de fetch se ejecuta en Node.js, no en el navegador, por lo que sigue funcionando igual.
        const enlacesExternos = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href]'))
                .map(a => a.href)
                .filter(href => href.startsWith('http'));
        });

        async function procesarEnLotes(items, tamañoLote, callback) {
            // ... (Esta función auxiliar no necesita cambios)
            let resultados = [];
            for (let i = 0; i < items.length; i += tamañoLote) {
                const lote = Array.isArray(items.slice(i, i + tamañoLote)) ? items.slice(i, i + tamañoLote) : [];
                if (lote.length === 0) continue;
                const resultadosLote = await Promise.allSettled(lote.map(callback));
                if (Array.isArray(resultadosLote)) {
                    resultados = resultados.concat(resultadosLote);
                }
            }
            return resultados;
        }

        async function validarEnlace(url) {
            // ... (Esta función auxiliar no necesita cambios)
            try {
                const res = await fetch(url, { method: 'GET', redirect: 'follow' });
                if (!res.ok) {
                    return { tipo: 'Enlace_externo_invalido', detalle: `${url} (status: ${res.status})` };
                }
            } catch (err) {
                return { tipo: 'Enlace_externo_invalido', detalle: `${url} - Error: ${err.message}` };
            }
            return null;
        }
        
        const resultados = await procesarEnLotes(enlacesExternos, 10, validarEnlace);
        resultados
            .filter(r => r.status === "fulfilled" && r.value)
            .forEach(r => errores.push(r.value));

    } catch (err) {
        errores.push({
            tipo: 'Error_general',
            detalle: `Error al validar el DOM: ${err.message}`
        });
    }

    return {
        ok: errores.length === 0,
        errores
    };
}

module.exports = validarDOMPuppeteer;
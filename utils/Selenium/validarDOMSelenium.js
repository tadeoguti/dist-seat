//const fetch = require('node-fetch');
/**
 * Valida el DOM de la página actual para detectar problemas de carga.
 * @param {WebDriver} driver - Instancia de Selenium WebDriver.
 * @returns {Promise<{ok: boolean, errores: string[]}>}
 */
async function validarDOMSelenium(driver) {
    const errores = [];

    try {
        // 1. Imágenes rotas con detalle
        const imagenesRotas = await driver.executeScript(() => {
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
        const textoVisible = await driver.executeScript(() => {
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
        const enlacesSinHref = await driver.executeScript(() => {
            return Array.from(document.querySelectorAll('a'))
                //.filter(a => !a.href ||  a.href.trim() === '')
                .filter(a => {
                    // 1. href vacío o #
                    const sinHref = !a.href || a.href.trim() === '#' || a.href.trim() === '';
                    // 2. no tenga onclick
                    const tieneOnclick = !!a.getAttribute('onclick');
                    // Solo marcar como inválido si no tiene href válido y no tiene onclick
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
        // Validar errores capturados
        try {
            const erroresConsola = await driver.executeScript(() => window.__capturedConsoleErrors || []);
            erroresConsola.forEach(msg => {
                errores.push({
                    tipo: 'Error_consola',
                    detalle: msg
                });
            });
            
        } catch (err) {
            errores.push({
                tipo: 'Error_consola',
                detalle: `No se pudieron obtener errores de consola: ${err.message}`
            });
        }
        const erroresConsola = await driver.executeScript(() => window.__capturedConsoleErrors || []);
        if (erroresConsola.length > 0) {
            erroresConsola.forEach(err => {
                errores.push({
                    tipo: "Error_consola",
                    detalle: err
                });
            });
        }

        // 5. Validar título
        const titulo = await driver.getTitle();
        if (!titulo || titulo.trim() === '') {
            errores.push({
                tipo: 'Titulo',
                detalle: 'Título de la página vacío'
            });
        }

        // 6. Validar meta description
        const metaDescription = await driver.executeScript(() => {
            const meta = document.querySelector('meta[name="description"]');
            return meta ? meta.content : '';
        });
        if (!metaDescription || metaDescription.trim() === '') {
            errores.push({
                tipo: 'Etiqueta_Meta',
                detalle: 'Meta description ausente o vacía'
            });
        }

        // --- 7. Valida Enlaces externos inválidos usando node-fetch ---
        const enlacesExternos = await driver.executeScript(() => {
            return Array.from(document.querySelectorAll('a[href]'))
                .map(a => a.href)
                .filter(href => href.startsWith('http'));
        });
        // Función auxiliar para procesar en lotes de forma segura
        async function procesarEnLotes(items, tamañoLote, callback) {
            let resultados = [];
            
            for (let i = 0; i < items.length; i += tamañoLote) {
                const lote = Array.isArray(items.slice(i, i + tamañoLote))
                    ? items.slice(i, i + tamañoLote)
                    : []; // asegurar que lote sea un array
                
                // Validar que el lote no esté vacío
                if (lote.length === 0) continue;
                
                const resultadosLote = await Promise.allSettled(
                    lote.map(callback)
                );

                // Asegurarse de que resultadosLote sea un array antes de concatenar
                if (Array.isArray(resultadosLote)) {
                    resultados = resultados.concat(resultadosLote);
                }
            }
            
            return resultados;
        }
        // Callback de validación de enlace
        async function validarEnlace(url) {
            try {
                const res = await fetch(url, { method: 'GET', redirect: 'follow' });
                if (!res.ok) {
                    return {
                        tipo: 'Enlace_externo_invalido',
                        detalle: `${url} (status: ${res.status})`
                    };
                }
            } catch (err) {
                return {
                    tipo: 'Enlace_externo_invalido',
                    detalle: `${url} - Error: ${err.message}`
                };
            }
            return null; // válido
        }
        // Procesar enlaces por lotes de 10
        const resultados = await procesarEnLotes(enlacesExternos, 10, validarEnlace);

        // Filtrar y agregar solo errores
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

module.exports =  validarDOMSelenium;

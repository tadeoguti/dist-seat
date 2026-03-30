const delay = require('../common/delay');
const sharp = require("sharp");
const fs = require("fs");

/**
 * Toma una captura de pantalla del <body> respetando las dimensiones emuladas.
 * Si la altura supera el límite seguro, se hace captura por bloques.
 * @param {import('puppeteer').Page} page - Página de Puppeteer.
 * @param {string} rutaArchivo - Ruta donde guardar la captura final.
 */
async function capturaCompletaPuppeter(page, rutaArchivo) {
    try {
        // Obtener viewport emulado
        const viewport = page.viewport();
        const viewportWidth = viewport.width;
        const viewportHeight = viewport.height;

        //console.log(`Ancho del Dispositivo: ${viewportWidth}px`);
        //console.log(`Alto del Dispositivo: ${viewportHeight}px`);
        try { await page.waitForSelector("header", { timeout: 3000 }); } catch { }
        try { await page.waitForSelector(".crm", { timeout: 3000 }); } catch { }
        // Ocultar elementos
        await ocultarElementos(page);
        await delay(1000);
        // Esperar que termine de cargar contenido diferido
        await page.evaluate(async () => {
            await new Promise(resolve => {
                const distancia = 300;
                const intervalo = setInterval(() => {
                    const scrollEl = document.scrollingElement;
                    scrollEl.scrollBy(0, distancia);
                    if (scrollEl.scrollTop + window.innerHeight >= scrollEl.scrollHeight) {
                        clearInterval(intervalo);
                        resolve();
                    }
                }, 200);
            });
        });

        await page.evaluate(async () => {
            const el = document.querySelector("#parallax-world-of-ugg");
            if (el) {
                el.scrollIntoView(); // desplaza la sección al viewport
            }
        });
        const el2 = await page.$(".parallax-two");
        if (el2) {
            await el2.scrollIntoViewIfNeeded();
        }
        // Esperar imágenes pendientes
        await delay(2000);

        // Medir altura total del body
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        console.log(`📏 Altura total de la página: ${bodyHeight}px`);

        const MAX_SAFE_HEIGHT = 16000; // límite seguro de Chromium

        // Si el body es muy alto, captura por bloques
        if (bodyHeight > MAX_SAFE_HEIGHT) {
            console.log(`⚠️ Altura supera el límite seguro (${MAX_SAFE_HEIGHT}px), se usará captura por bloques`);
            await capturarPorBloques(page, rutaArchivo, viewportWidth, viewportHeight, bodyHeight);
        } else {
            console.log("Captura simple, respetando el ancho del dispositivo...");
            // Captura simple respetando ancho del viewport
            await page.setViewport({ width: viewportWidth, height: Math.min(viewportHeight, bodyHeight) });
            await ocultarElementos(page); // volver a ocultar
            await delay(1000);             // pequeño delay para asegurar estilos aplicados
            await page.screenshot({
                path: rutaArchivo,
                clip: { x: 0, y: 0, width: viewportWidth, height: bodyHeight }
            });
            console.log(`📸 Captura completa guardada en: ${rutaArchivo}`);
        }
        return {
            anchoDevice: viewportWidth,
            altoDevice: bodyHeight
        }
    } catch (error) {
        console.error("❌ Error al tomar captura de pantalla completa:", error);
    }
}

/**
 * Captura el body por bloques respetando ancho de viewport.
 */
async function capturarPorBloques(page, rutaArchivo, viewportWidth, viewportHeight, bodyHeight) {
    let scroll = 0;
    const screenshots = [];

    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    while (scroll < bodyHeight) {
        try { await page.waitForSelector("header", { timeout: 3000 }); } catch { }
        try { await page.waitForSelector(".crm", { timeout: 3000 }); } catch { }
        await ocultarElementos(page);
        await delay(500);
        const clipHeight = Math.min(viewportHeight, bodyHeight - scroll);
        const tempPath = rutaArchivo.replace(".png", `_part_${scroll}.png`);

        await page.screenshot({
            path: tempPath,
            clip: { x: 0, y: scroll, width: viewportWidth, height: clipHeight }
        });
        screenshots.push({ path: tempPath, height: clipHeight });
        console.log(`📌 Capturado bloque: ${scroll}px - ${scroll + clipHeight}px`);
        scroll += viewportHeight;
        await sleep(200);
    }

    // Unir bloques con Sharp
    let offset = 0;
    const compositeImgs = screenshots.map(s => {
        const img = { input: s.path, top: offset, left: 0 };
        offset += s.height;
        return img;
    });

    await sharp({
        create: { width: viewportWidth, height: bodyHeight, channels: 3, background: { r: 255, g: 255, b: 255 } }
    }).composite(compositeImgs).toFile(rutaArchivo);

    // Limpiar temporales
    screenshots.forEach(f => fs.unlinkSync(f.path));
    console.log(`📸 Captura completa por bloques guardada en: ${rutaArchivo}`);
}

/**
 * Oculta header, footer, .crm, etc.
 */
async function ocultarElementos(page) {
    await page.evaluate(() => {

        const hideSelectors = [
            "header", "footer", ".crm", "#MenuInterior",
            ".hcupra", ".cookie-policy-container",
            ".ChatXS_Icon", ".legalesauc", ".container-fluid", ".menuInterior"
        ];
        hideSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                el.style.setProperty("display", "none", "important");
            })
        });
        // Reset body y html
        document.body.style.margin = "0";
        document.body.style.padding = "0";
        document.body.style.overflow = "visible";

        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.documentElement.style.overflow = "visible";

        // Reset de main o section
        const main = document.querySelector("main, section");
        if (main) {
            main.style.marginTop = "0";
            main.style.paddingTop = "0";
            main.style.marginBottom = "0";
            main.style.paddingBottom = "0";
        }
    });
}

module.exports = capturaCompletaPuppeter;

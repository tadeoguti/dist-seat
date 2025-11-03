// src/validateHomeRedirectPuppeteer.js
const { URL } = require("url");
const fetch = require("node-fetch");

/**
 * Valida si el sitio redirige correctamente entre versión con y sin www.
 *
 * @param {import("puppeteer").Page} page - Instancia de Puppeteer Page.
 * @param {string} baseUrl - URL base del sitio (ej. "https://example.com").
 * @returns {Promise<{
 *   sameRedirect: boolean,
 *   urlWithoutWWW: string|null,
 *   urlWithWWW: string|null,
 *   finalUrlWithoutWWW: string|null,
 *   finalUrlWithWWW: string|null,
 *   error: string|null
 * }>}
 */
async function validarHomeRedirectPuppeteer(page, baseUrl) {
    let result;
    try {
        result = {
            sameRedirect: false,
            urlWithoutWWW: null,
            urlWithWWW: null,
            finalUrlWithoutWWW: null,
            finalUrlWithWWW: null,
            error: null
        };
        const urlWithoutWWW = new URL(baseUrl);
        const urlWithWWW = new URL(baseUrl);

        // Agregar o quitar el www según corresponda
        if (!urlWithWWW.hostname.startsWith("www.")) {
            urlWithWWW.hostname = "www." + urlWithWWW.hostname;
        }
        if (urlWithoutWWW.hostname.startsWith("www.")) {
            urlWithoutWWW.hostname = urlWithoutWWW.hostname.replace(/^www\./, "");
        }

        result.urlWithoutWWW = urlWithoutWWW.href;
        result.urlWithWWW = urlWithWWW.href;

        // 🔹 Validar accesibilidad antes de usar Puppeteer
        const reachableWithout = await checkUrlReachable(urlWithoutWWW.href);
        const reachableWith = await checkUrlReachable(urlWithWWW.href);

        if (!reachableWithout || !reachableWith) {
            console.log("⚠️  Validando Home con y sin (www.) -> Alguna versión no es accesible:");
            console.log(`- ${urlWithoutWWW.href}: ${reachableWithout ? "Accesible" : "No accesible"}`);
            console.log(`- ${urlWithWWW.href}: ${reachableWith ? "Accesible" : "No accesible"}`);

            result.finalUrlWithoutWWW = reachableWithout ? urlWithoutWWW.href : "No accesible";
            result.finalUrlWithWWW = reachableWith ? urlWithWWW.href : "No accesible";
            result.error = "Alguna versión no es accesible";
            result.sameRedirect = false;

            return result;
        }

        // Si ambas son accesibles, abrir con Puppeteer
        // Visitar la versión sin www
        await page.goto(urlWithoutWWW.href, { waitUntil: "domcontentloaded" });
        const finalUrlWithoutWWW = page.url();
        result.finalUrlWithoutWWW = finalUrlWithoutWWW;

        // Visitar la versión con www
        await page.goto(urlWithWWW.href, { waitUntil: "domcontentloaded" });
        const finalUrlWithWWW = page.url();
        result.finalUrlWithWWW = finalUrlWithWWW;

        // Comparar resultados
        const sameRedirect = finalUrlWithoutWWW === finalUrlWithWWW;
        result.sameRedirect = sameRedirect;

        console.log("Validación redirección Home:");
        console.log(`- URL sin www: ${urlWithoutWWW.href} → ${finalUrlWithoutWWW}`);
        console.log(`- URL con www: ${urlWithWWW.href} → ${finalUrlWithWWW}`);
        console.log(
            sameRedirect
                ? "✅ - Ambas versiones redirigen al mismo destino."
                : "⚠️ - Las versiones con y sin www no redirigen igual."
        );
    } catch (err) {
        // console.error(`❌ Error validando redirección Home: ${error.message}`);
        // return false;
        console.error(`❌ Error validando redirección Home: ${err}`);
        result.error = err.message;
    }
    return result;
}

/**
 * Verifica si una URL responde con código HTTP 200–399.
 */
async function checkUrlReachable(url) {
    try {
        const res = await fetch(url, {
            method: "GET",
            redirect: "follow",
            timeout: 5000,
            headers: { "User-Agent": "Mozilla/5.0" },
        });
        return res.status >= 200 && res.status < 400;
    } catch (e) {
        return false;
    }
}


module.exports = validarHomeRedirectPuppeteer;

// src/validateHomeRedirect.js
const { Builder } = require("selenium-webdriver");
const { URL } = require("url");
//const fetch = require('node-fetch');

/**
 * Valida si el sitio redirige correctamente entre versión con y sin www.
 *
 * @param {import("selenium-webdriver").WebDriver} driver - Instancia de Selenium WebDriver.
 * @param {string} baseUrl - URL base del sitio (ej. "https://example.com").
 * @returns {Promise<{
 *   sameRedirect: boolean,
 *   urlWithoutWWW: string|null,
 *   urlWithWWW: string|null,
 *   finalUrlWithoutWWW: string|null,
 *   finalUrlWithWWW: string|null,
 *   error: string|null
 * }>} - Objeto con los resultados de la validación.
 */
async function validateHomeRedirectSelenium(driver,baseUrl) {
    let result = {
        sameRedirect: false,
        urlWithoutWWW: null,
        urlWithWWW: null,
        finalUrlWithoutWWW: null,
        finalUrlWithWWW: null,
        error: null
    };
    try {
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

        // 🔹 Validar accesibilidad antes de usar Selenium
        const reachableWithout = await checkUrlReachable(urlWithoutWWW.href);
        const reachableWith = await checkUrlReachable(urlWithWWW.href);

        if (!reachableWithout || !reachableWith) {
            console.log("⚠️  Validando Home con y sin (www.) -> Alguna versión no es accesible:");
            console.log(`- ${urlWithoutWWW.href}: ${reachableWithout ? "Accesible" : "No accesible"}`);
            console.log(`- ${urlWithWWW.href}: ${reachableWith ? "Accesible" : "No accesible"}`);
            // Guardar detalle en el objeto de resultado para el reporte
            result.finalUrlWithoutWWW = reachableWithout ? urlWithoutWWW.href : "No accesible";
            result.finalUrlWithWWW = reachableWith ? urlWithWWW.href : "No accesible";
            result.error = "Alguna versión no es accesible";
            result.sameRedirect = false;

            // Retornar el objeto completo, no solo false
            return result;
        }

        // Si ambas son accesibles, ahora sí abrir con Selenium
        // Visitar la versión sin www
        await driver.get(urlWithoutWWW.href);
        const finalUrlWithoutWWW = await driver.getCurrentUrl();
        result.finalUrlWithoutWWW = finalUrlWithoutWWW;

        // Visitar la versión con www
        await driver.get(urlWithWWW.href);
        const finalUrlWithWWW = await driver.getCurrentUrl();
        result.finalUrlWithWWW = finalUrlWithWWW;

        // Comparar resultados
        const sameRedirect = finalUrlWithoutWWW === finalUrlWithWWW;
        result.sameRedirect = sameRedirect;

        console.log("Validación redirección Home:");
        console.log(`- URL sin www: ${urlWithoutWWW.href} → ${finalUrlWithoutWWW}`);
        console.log(`- URL con www: ${urlWithWWW.href} → ${finalUrlWithWWW}`);
        console.log(sameRedirect
        ? "✅ -Ambas versiones redirigen al mismo destino."
        : "⚠️ -Las versiones con y sin www no redirigen igual."
        );
        
        //return sameRedirect;
    } catch (err) {
        console.error(`❌ Error validando redirección Home: ${err}`);
        //return false;
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
            method: 'GET',
            redirect: 'follow',  // sigue redirecciones
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return res.ok; // true si status 200–299
    } catch (e) {
        return false;
    }
}

module.exports = validateHomeRedirectSelenium;

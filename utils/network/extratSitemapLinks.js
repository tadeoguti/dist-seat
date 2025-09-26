// src/extractSitemapLinks.js

//const fetch = require('node-fetch'); 
const { XMLParser } = require('fast-xml-parser');
const https = require("https");

// const fs = require('fs/promises'); // Esta línea se puede eliminar si no se usa para guardar archivos

/**
 * Extrae todos los enlaces (URLs) de un sitemap XML dado.
 * Además valida si el certificado SSL es válido.
 * @param {string} url La URL completa del sitemap a extraer.
  * @returns {Promise<{uniqueUrls: string[], duplicatedUrls: string[], sslStatus: text}>} Una promesa que resuelve con dos arrays de strings (Enlaces unicos y duplicados) y el indicador si el certificado es valido o no(boolean),
 * o un array vacío si no se encuentran enlaces o hay un error.
 */
async function extractSitemapLinks(url) {
    // 1. Validar que la URL no esté vacía
    if (!url) {
        console.error("❌ Error: Se requiere una URL para extraer el sitemap.");
        //return [];
        return { uniqueUrls: [], duplicatedUrls: [], sslStatus: "Caducado o inválido" };
    }

    let sslStatus = "Caducado o inválido";

    try {
        
        
        // --- 🔑 Validar certificado SSL ---
        await new Promise((resolve) => {
            const req = https.get(url, {rejectUnauthorized: true}, res =>{
                res.resume(); // descartamos el cuerpo, solo queremos la conexión
                sslStatus = "Válido"
                resolve();
            });
            req.on("error", err => {
                sslStatus = "Caducado o inválido";
                resolve(); // no lanzamos reject porque queremos continuar
            });
        });
        // --- Agente HTTPS que ignora certificados inválidos para poder seguir leyendo el sitemap ---
        //const response = await fetch(url, {agent}); 
        const response = await fetch(url, {
            agent: parsedUrl => {
                if (parsedUrl.protocol === 'http:') {
                    return new (require('http').Agent)({
                        keepAlive: true
                    });
                } else {
                    return new https.Agent({
                        rejectUnauthorized: false, // ignorar certificados
                        keepAlive: true
                    });
                }
            }
        });
        
        // Verifica si la respuesta HTTP fue exitosa (código 2xx)
        if (!response.ok) {
            // Lanza un error si la respuesta no es exitosa (ej. 404, 500)
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }

        const xmlContent = await response.text(); // fetch.response.text() para obtener el cuerpo como texto

        // Configurar el parser para que extraiga el texto de <loc>
        const options = {
            ignoreAttributes: true, // No nos interesan los atributos de las etiquetas
            textNodeName: "text" // Nombre de la propiedad para el texto dentro de la etiqueta
        };
        // --- Parsear XML ---
        const parser = new XMLParser(options);
        const jsonObj = parser.parse(xmlContent);
        
        // Los sitemaps tienen la estructura <urlset><url><loc>...</loc></url></urlset>
        // Si hay un solo <url>, jsonObj.urlset.url será un objeto, si hay muchos, será un array.
        let urls = [];
        if (jsonObj && jsonObj.urlset && jsonObj.urlset.url) {
            if (Array.isArray(jsonObj.urlset.url)) {
                // Aquí usamos item.loc.text porque 'textNodeName: "text"' hace que el valor de <loc>
                // esté en la propiedad 'text' de un objeto llamado 'loc'.
                urls = jsonObj.urlset.url.map(item => item.loc); 
            } else {
                // Si solo hay una URL, también accedemos a item.loc.text
                urls.push(jsonObj.urlset.url.loc);
            }
        }
        
        if (urls.length === 0) {
            console.warn(`No se encontraron URLs en el sitemap de: ${url}`); 
            return { uniqueUrls: [], duplicatedUrls: [] , sslStatus};
        }
        
        // --- Detección de urls duplicados ---
        const uniqueUrls = []; // Array donde guardaremos las URLs que no están repetidas
        const seenUrls = new Set(); // Un "Set" para llevar un registro rápido de las URLs que ya hemos visto
        const duplicatedUrls = []; // Array donde guardaremos las URLs que encontramos repetidas

        for (const urlItem of urls) {
            if (seenUrls.has(urlItem)) {
                duplicatedUrls.push(urlItem); // Ya la vimos, es un duplicado
            } else {
                seenUrls.add(urlItem);
                uniqueUrls.push(urlItem); // Es única hasta ahora
            }
        }

        console.log(`🗺️ - Validando Sitemap: ${url}`);
        console.log(`🔒 Certificado SSL del Sitemap: ${sslStatus}`);
        console.log(`✅ ¡Éxito! Se encontraron ${uniqueUrls.length} enlaces únicos en ${url}.`);

        if (duplicatedUrls.length > 0) {
            console.warn(`⚠️ Se encontraron ${duplicatedUrls.length} URL(s) duplicada(s) en el sitemap de: ${url}.`);
            console.warn("   URLs duplicadas:", duplicatedUrls); // Descomenta si quieres verlas en consola aquí
        }
        
        // Retorna un objeto con ambos arrays
        return { uniqueUrls, duplicatedUrls , sslStatus };

    } catch (error) {
        console.error(`❌ Ocurrió un error al extraer los enlaces del sitemap (${url}):`);
        // Manejo de errores más específico para fetch
        if (error.name === 'FetchError') { // Para errores de red, DNS, etc.
            console.error(`Error de red o FetchError: ${error}`);
        } else if (error.message.startsWith('Error HTTP')) { // Para errores HTTP que lanzamos arriba
            console.error(`Error de servidor: ${error}`);
        } else {
            console.error(`Mensaje: ${error}`);
        }
        //return []; // Siempre retorna un array vacío en caso de error
        return { uniqueUrls: [], duplicatedUrls: [] , sslStatus:"Caducado o inválido" };
    }
}

// Exportar la función para que main.cjs pueda importarla directamente
module.exports = extractSitemapLinks;
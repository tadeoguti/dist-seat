// getSafeFileNameFromUrl.js
/**
 * Convierte la parte del path de una URL a un nombre de archivo seguro.
 * Quita acentos, espacios extra y caracteres no válidos.
 * @param {string} url
 * @returns {string} nombre de archivo seguro basado solo en el path
 */
function getSafeFileNameFromUrl(url) {
    try {
        const urlObj = new URL(url);
        let urlPath = urlObj.pathname;

        if (urlPath === '/' || urlPath === '') {
            urlPath = 'home';
        }

        // Decodifica caracteres como %C3%B3 → ó
        urlPath = decodeURIComponent(urlPath);

        // 🔹 Normaliza y elimina acentos
        urlPath = urlPath.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        urlPath = urlPath.toLowerCase();

        // Reemplaza / por _ y quita caracteres no válidos para Windows
        const safeName = urlPath
            .replace(/[:\/\\?<>*"|]/g, '_')  // reemplaza caracteres prohibidos por _
            .replace(/\s+/g, '_')            // reemplaza espacios por _
            .replace(/_+/g, '_')             // quita repeticiones de _
            .replace(/^_+|_+$/g, '');        // quita _ iniciales/finales

        return safeName || "home";
    } catch (e) {
        console.error('Error al convertir URL a nombre de archivo:', e);
        return 'invalid_url';
    }
}

module.exports = getSafeFileNameFromUrl;

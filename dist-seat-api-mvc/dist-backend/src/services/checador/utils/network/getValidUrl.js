/**
 * Convierte un string en una URL válida para navegadores.
 * Normaliza acentos (ej. LEÓN → LEON) y codifica correctamente.
 * @param {string} urlStr
 * @returns {string} URL segura sin acentos
 */
function getValidUrl(urlStr) {
    try {
        // 🔹 Quitar acentos/diacríticos
        let normalized = urlStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // 🔹 Codificar URL (para espacios u otros caracteres)
        return new URL(encodeURI(normalized)).toString();
    } catch (e) {
        console.error("❌ URL inválida:", urlStr, e);
        return null;
    }
}

module.exports = getValidUrl;

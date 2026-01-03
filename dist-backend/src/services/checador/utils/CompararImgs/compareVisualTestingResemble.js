const fs = require("fs");
const resemble = require("resemblejs");
const sharp = require("sharp");

/**
 * Compara dos imágenes y genera una imagen de diferencias usando Resemble.js
 * Solo agrega un mensaje si hay diferencia de dimensiones, no redimensiona.
 * @param {string} baseFile - Ruta de la imagen base
 * @param {string} compareFile - Ruta de la imagen a comparar
 * @param {string} pathFileDiff - Ruta donde se guardará la imagen de diferencias
 * @returns {Promise<{Similitud: string, Mensaje: string}>}
 */
async function compareVisualTestingResemble(baseFile, compareFile, pathFileDiff) {
    let tmpMensaje = "";

    try {
        if (!fs.existsSync(baseFile)) {
            return { Similitud: "0", Mensaje: "❌ La imagen base no existe." };
        }

        if (!fs.existsSync(compareFile)) {
            return { Similitud: "0", Mensaje: "❌ La imagen a comparar no existe." };
        }

        // --- Paso 1: Obtener dimensiones de las imágenes ---
        const baseMeta = await require("sharp")(baseFile).metadata();
        const compareMeta = await require("sharp")(compareFile).metadata();

        if (baseMeta.width !== compareMeta.width || baseMeta.height !== compareMeta.height) {
            tmpMensaje = `⚠️ Dimensiones diferentes detectadas: base ${baseMeta.width}x${baseMeta.height}px, comparación ${compareMeta.width}x${compareMeta.height}px.`;
        }

        // --- Paso 2: Leer imágenes ---
        const baseBuffer = fs.readFileSync(baseFile);
        const compareBuffer = fs.readFileSync(compareFile);

        // --- Paso 3: Comparar usando Resemble.js ---
        const diffResult = await new Promise((resolve) => {
            resemble(baseBuffer)
                .compareTo(compareBuffer)
                .ignoreAntialiasing()
                .onComplete(resolve);
        });

        const similarity = (100 - parseFloat(diffResult.misMatchPercentage)).toFixed(2);

        // --- Paso 4: Guardar imagen de diferencias solo si hay cambios ---
        if (similarity < 100) {
            const diffBuffer = diffResult.getBuffer();
            fs.writeFileSync(pathFileDiff, diffBuffer);
        } else {
            tmpMensaje += tmpMensaje ? " | ✅ Imágenes idénticas. No se genera archivo de diferencias." : "✅ Imágenes idénticas. No se genera archivo de diferencias.";
            if (fs.existsSync(pathFileDiff)) fs.unlinkSync(pathFileDiff);
        }

        console.log(`🔍 Resultado de comparación: ${similarity}% de similitud entre:\n${baseFile}\n${compareFile}`);

        return {
            Similitud: similarity,
            Mensaje: `Comparación realizada. Similitud: ${similarity}%. \n${tmpMensaje}`
        };

    } catch (error) {
        console.error("❌ Error en la comparación con Resemble.js:", error);
        return { Similitud: "0", Mensaje: "Error al comparar imágenes." };
    }
}

module.exports = compareVisualTestingResemble;

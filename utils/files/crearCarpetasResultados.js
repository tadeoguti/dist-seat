const folders = require("./folders");
const path = require("path");
/**
 * 
 * Crea una estructura de directorios necesaria para almacenar resultados y evidencias.
 *
 * Esta función crea carpetas anidadas para organizar:
 * - Datos generales de las distribuidoras (`dist`)
 * - Resultados del análisis (`Resultados`)
 * - Evidencias específicas por proyecto (ej. `Evidencias-LandingCupra`)
 * - Reportes generados
 * - Capturas del sitio base
 * @param {string} nombreProyecto 
 * @returns {Promise<Object>} - Objeto con las rutas de las carpetas creadas.
 * @property {string} list_Distri - Carpeta raíz para los json con los datos  de las distribuidoras.
 * @property {string} Results_DIR - Carpeta principal de resultados.
 * @property {string} script_DIR - Carpeta específica del script en ejecución.
 * @property {string} DIST_DIR - Carpeta específica de evidencias del proyecto/Script.
 * @property {string} REPORT_DIR - Carpeta para reportes del proyecto/Script.
 * @property {string} baseDir - Carpeta para capturas del sitio base.
 */

async function crearCarpetasResultados(nombreProyecto, carpetasOpcionales = []) {
    try {
        const __dirname = path.resolve();
        //const list_Distri = path.resolve(__dirname, "./dist");
        const Results_DIR = path.join(__dirname, "Resultados");
        const script_DIR = path.join(Results_DIR, nombreProyecto);
        const DIST_DIR = path.join(script_DIR, `Evidencias-${nombreProyecto}`);
        const baseDir = path.join(DIST_DIR, "Capturas_SitioBase");
        const REPORT_DIR = path.join(script_DIR, `Reporte-${nombreProyecto}`);

        const todasCarpetas = {Results_DIR, script_DIR, REPORT_DIR, DIST_DIR, baseDir};

        // 🔹 Siempre se crean estas dos
        await folders(Results_DIR);
        await folders(script_DIR);

        // 🔹 Crear solo las carpetas opcionales solicitadas
        for (const key of carpetasOpcionales) {
            if (todasCarpetas[key]) {
                await folders(todasCarpetas[key]);
            }
        }

        // 🔹 Siempre retorna las rutas de las carpertas creada.
        return {
            Results_DIR,
            script_DIR,
            REPORT_DIR,
            DIST_DIR,
            baseDir,
        };

    } catch (error) {
        console.error("❌ Error creando estructura de carpetas:", error);
    }
}

module.exports = crearCarpetasResultados;
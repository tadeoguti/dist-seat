const folders = require("./folders");
const path = require("path");
/**
 * Crea la estructura de carpetas estándar para almacenar resultados, reportes y evidencias
 * de un proyecto de automatización o testing.
 *
 * @async
 * @param {string} nameMarca - El nombre de la marca a validar del proyecto (usado como subcarpeta dentro de 'Resultados').
 * @param {string[]} [carpetasOpcionales=[]] - Un array de nombres clave de las carpetas opcionales a crear.
 * @param {string} rutaProyecto - La ruta base donde se creará la carpeta principal ('dist' y 'Resultados').
 * @returns {Promise<Object<string, string>|undefined>} Un objeto con las rutas absolutas de todas las carpetas clave creadas, o `undefined` si ocurre un error.
 * @throws {Error} Si 'rutaProyecto' no se proporciona.
 */

async function crearCarpetasResultados(nameMarca, carpetasOpcionales = [], rutaResultadosProyecto) {
    try {
        if (!rutaResultadosProyecto) {
            throw new Error("Se requiere 'Ruta de Resultados' para crear las carpetas necesarias.");
        }
        //const __dirname = path.resolve();
        const list_Distri = path.resolve(rutaResultadosProyecto, "dist");
        const Results_DIR = path.join(rutaResultadosProyecto, "Resultados");
        const script_DIR = path.join(Results_DIR, `${nameMarca}-ValidacionesPrincipales`);
        const DIST_DIR = path.join(script_DIR, `Evidencias`);
        const baseDir = path.join(DIST_DIR, "Capturas_SitioBase");
        const REPORT_DIR = path.join(script_DIR, `Reporte`);

        const todasCarpetas = {list_Distri, Results_DIR, script_DIR, REPORT_DIR, DIST_DIR, baseDir};

        // 🔹 Siempre se crean estas dos
        await folders(Results_DIR);
        await folders(script_DIR);
        await folders(list_Distri);

        // 🔹 Crear solo las carpetas opcionales solicitadas
        for (const key of carpetasOpcionales) {
            if (todasCarpetas[key]) {
                await folders(todasCarpetas[key]);
            }
        }

        // 🔹 Siempre retorna las rutas de las carpertas creada.
        return {
            list_Distri,
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
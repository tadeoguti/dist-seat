const inquirer = require('inquirer');

/**
 * Muestra un menú interactivo para seleccionar distribuidoras.
 * 
 * @param {Array} distribuidoras - Lista de distribuidoras cargadas del JSON
 * @returns {Promise<Array>} - Distribuidoras seleccionadas por el usuario
 */

async function seleccionarDistribuidoras(distribuidoras) {
    try {
        if (!Array.isArray(distribuidoras) || distribuidoras.length === 0) {
            console.warn("⚠️ No hay distribuidoras disponibles para seleccionar.");
            return [];
        }

        const choices = distribuidoras.map((dist, index) => ({
            name: `${index + 1}. ${dist.nameDist} (${dist.urlDist})`,
            value: index
        }));

        const { seleccion } = await inquirer.prompt([
            {
                type: "checkbox",
                name: "seleccion",
                message: 'Instrucciones:\n', 
                //message: "Selecciona las distribuidoras a revisar:",
                pageSize: 15, // cantidad visible antes de hacer scroll en consola
                //pageSize: distribuidoras.length,
                loop: false,
                //instruction: null, 
                
                choices: [
                    new inquirer.Separator(" = Lista de Distribuidoras = "),
                    ...choices,
                    new inquirer.Separator(),
                    { name: "Todas", value: "ALL" }
                ]
            }
        ]);

        if (seleccion.includes("ALL")) {
            return distribuidoras;
        }

        return seleccion.map(i => distribuidoras[i]);
    } catch (error) {
        console.error("Error al Seleccionar Distribuidoras: ", error);
    }
}
module.exports = seleccionarDistribuidoras;
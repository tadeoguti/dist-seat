// jobs/marcas.job.js
const cron = require("node-cron");
const { deleteAllMarcas, createMarca } = require('../repository/marcas.repository');
const { scrapeMarcas } = require('../services/marcaScraper.service');

// Ejecutar cada hora (minuto 0 de cada hora)
function iniciarMarcasJob() {
    //Para ejecutar cada 5 minutos 
    //cron.schedule("*/5 * * * *", async () => {

    // Ejecutar cada hora (minuto 0 de cada hora)
    cron.schedule("0 * * * *", async () => {
        console.log("⏰ Ejecutando scraping de marcas...");
        try {
            const marcas = await scrapeMarcas();
            // Limpia la tabla
            await deleteAllMarcas();
            // Inserta las nuevas marcas
            for (const m of marcas) {
                await createMarca(m.id, m.nombre);
            }
            console.log("✅ Marcas actualizadas en cache");
        } catch (err) {
            console.error("❌ Error en scraping de marcas:", err.message);
        }
    });
}

module.exports = { iniciarMarcasJob };
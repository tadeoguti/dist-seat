// jobs/marcas.job.js
const cron = require("node-cron");
const {
  findAllMarcas,
  createOrUpdateMarca,
} = require("../repository/marcas.repository");
const { scrapeMarcas } = require("../services/marcaScraper.service");
const { jobDistribuidoras } = require("./distribuidoras.job");

async function jobMarcas() {
  console.log("⏰ Ejecutando scraping de marcas...");
  try {
    const nuevasMarcas = await scrapeMarcas();
    if (!nuevasMarcas || nuevasMarcas.length === 0) {
      throw new Error("Scraping vacío: no se obtuvieron marcas");
    }
    const marcasActuales = await findAllMarcas();
    const idsNuevos = nuevasMarcas.map((m) => m.id);

    // 1. Insertar o actualizar marcas nuevas
    for (const m of nuevasMarcas) {
      await createOrUpdateMarca(m.id, m.nombre, true, new Date());
    }

    // 2. Marcar como inactivas las marcas que ya no están
    const marcasInactivas = marcasActuales.filter(
      (m) => !idsNuevos.includes(m.id),
    );
    for (const m of marcasInactivas) {
      await createOrUpdateMarca(m.id, m.nombre, false, m.ultima_actualizacion);
    }
    console.log(
      `✅ Marcas actualizadas: ${nuevasMarcas.length} activas, ${marcasInactivas.length} inactivadas`,
    );
    console.log("🚀 Iniciando scraping de distribuidoras por marca...");
    jobDistribuidoras();
  } catch (err) {
    console.error("❌ Error en scraping de marcas:", err.message);
    throw err;
  }
}

// Ejecutar cada hora automáticamente
function iniciarMarcasJob() {
  //Ejecutar todos los dias a las 3:30AM
  //cron.schedule("30 3 * * *", jobMarcas, {

  //6:15pm
  cron.schedule("11 19 * * *", jobMarcas, {
    timezone: "America/Mexico_City",
  });

  //Ejecutar todos los dias a las 10:00PM
  // cron.schedule("0 22 * * *", jobMarcas,{
  //     timezone: "America/Mexico_City"
  // });

  //cron.schedule("0 * * * *", jobMarcas); //cada hora

  //cron.schedule("*/2 * * * *", jobMarcas);//cada 2 minutos
}

module.exports = { iniciarMarcasJob, jobMarcas };

// src/jobs/distribuidoras.job.js
const cron = require("node-cron");
const {
  getMarcasActivas,
  actualizarUltimaActualizacion,
} = require("../repository/marcas.repository");
const {
  obtenerDistribuidorasPorMarca,
  insertarDistribuidorasPorMarca,
} = require("../repository/distribuidoras.repository");
const { registrarLogScraping } = require("../repository/logs.repository");
const {
  scrapeDistribuidorasPorMarca,
} = require("../services/distribuidoraScraper.service");

async function jobDistribuidoras() {
  console.log("⏰ Ejecutando job de scraping de distribuidoras...");

  const marcas = await getMarcasActivas();

  if (!marcas || marcas.length === 0) {
    console.warn("⚠️ No hay marcas activas para procesar.");
    return;
  }

  for (const marca of marcas) {
    let intento = 1;
    let exito = false;
    let distribuidoras = [];

    const distribuidorasPrevias = await obtenerDistribuidorasPorMarca(marca.id);
    const cantidadAnterior = distribuidorasPrevias.length;

    while (intento <= 3 && !exito) {
      try {
        console.log(
          `🔍 Scrapeando distribuidoras para marca: ${marca.nombre} (Intento ${intento})`,
        );
        distribuidoras = await scrapeDistribuidorasPorMarca(marca.nombre);
        const cantidadNueva = distribuidoras.length;

        // Validación de cantidad mínima
        if (cantidadNueva === 0) {
          throw new Error("Scraping vacío: no se obtuvieron distribuidoras");
        }

        if (cantidadAnterior > 0 && cantidadNueva < cantidadAnterior * 0.7) {
          throw new Error(
            `Scraping incompleto: se obtuvieron ${cantidadNueva} de ${cantidadAnterior} distribuidoras`,
          );
        }

        console.log(
          `💾 Guardando ${cantidadNueva} distribuidoras para ${marca.nombre}`,
        );

        // Guardar distribuidoras y actualizar marca
        await insertarDistribuidorasPorMarca(marca.id, distribuidoras);
        await actualizarUltimaActualizacion(marca.id);
        await registrarLogScraping(
          marca.id,
          "distribuidoras",
          "Scraping exitoso",
          intento,
          true,
        );

        console.log(
          `✅ ${cantidadNueva} distribuidoras guardadas para ${marca.nombre}`,
        );
        exito = true;
      } catch (error) {
        console.error(
          `❌ Error en scraping de ${marca.nombre}:`,
          error.message,
        );
        await registrarLogScraping(
          marca.id,
          "distribuidoras",
          error.message,
          intento,
          false,
        );

        if (intento < 3) {
          const RETRY_DELAY_MS =
            process.env.NODE_ENV === "production" ? 5 * 60 * 1000 : 10000;
          console.log(
            `🔁 Reintentando en ${RETRY_DELAY_MS / 1000} segundos...`,
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }

        intento++;
      }
    }
  }

  console.log("🏁 Job de distribuidoras finalizado.");
}

// Programar ejecución diaria a las 4:30 AM
function iniciarDistribuidorasJob() {
  cron.schedule("30 4 * * *", jobDistribuidoras, {
    timezone: "America/Mexico_City",
  });
}

module.exports = { iniciarDistribuidorasJob, jobDistribuidoras };

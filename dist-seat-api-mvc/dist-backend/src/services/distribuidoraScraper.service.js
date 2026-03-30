// src/services/distribuidoraScraper.service.js
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const getDistribuidoraPuppeteer = require("../services/checador/utils/Puppeteer/getDistribuidoraPuppeteer.js");
const STORAGE_PATH = path.resolve(process.cwd(), "storage", "dist");
const cleanfiles = require("../services/checador/utils/files/cleanfiles");

async function scrapeDistribuidorasPorMarca(nombreMarca) {
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    // Capturar logs del navegador (opcional para depuración)
    page.on("console", (msg) => {
      for (let i = 0; i < msg.args().length; ++i) {
        msg
          .args()
          [i].jsonValue()
          .then((val) => {
            console.log(`🧪 [Browser log]:`, val);
          });
      }
    });

    const jsonPath = await getDistribuidoraPuppeteer(
      page,
      nombreMarca,
      STORAGE_PATH,
    );

    // Leer y parsear el archivo JSON directamente para evitar caché
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const distribuidoras = JSON.parse(rawData);

    //Validar que sea un arreglo válido
    if (!Array.isArray(distribuidoras) || distribuidoras.length === 0) {
      throw new Error(
        `⚠️ El archivo JSON para ${nombreMarca} está vacío o mal formado.`,
      );
    }
    console.log(
      `📦 Distribuidoras extraídas para ${nombreMarca}: ${distribuidoras.length}`,
    );

    cleanfiles(STORAGE_PATH, `${nombreMarca}_`, `.json`, 3);
    return distribuidoras;
  } catch (error) {
    console.error(
      `❌ Error en scrapeDistribuidorasPorMarca(${nombreMarca}):`,
      error.message,
    );
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log("✅ Navegador cerrado correctamente.");
      } catch (closeError) {
        console.error("⚠️ Error al cerrar el navegador:", closeError.message);
      }
    }
  }
}

module.exports = { scrapeDistribuidorasPorMarca };

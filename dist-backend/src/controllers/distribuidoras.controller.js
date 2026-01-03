const fs = require("fs");
const path = require("path");
const driverPuppeteer = require("../services/checador/utils/Puppeteer/driverPuppeteer");
const getDistribuidoraPuppeteer = require("../services/checador/utils/Puppeteer/getDistribuidoraPuppeteer");
const cleanfiles = require("../services/checador/utils/files/cleanfiles");

const STORAGE_PATH = path.resolve(process.cwd(), "storage", "dist");

const obtenerDistribuidorasPorMarca = async (req, res) => {
  const { marca } = req.query;
  if (!marca) {
    return res.status(400).json({ error: "Debes enviar el parámetro 'marca'" });
  }

  try {
    // Asegurar que la carpeta storage/dist exista
    if (!fs.existsSync(STORAGE_PATH)) {
      fs.mkdirSync(STORAGE_PATH, { recursive: true });
    }

    // Lanzar Puppeteer
    const browser = await driverPuppeteer(true);
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Ejecutar tu función de extracción con Puppeteer
    const pathJson = await getDistribuidoraPuppeteer(page, marca, STORAGE_PATH);
    await browser.close();

    // Leer el archivo JSON generado
    let distribuidoras = JSON.parse(fs.readFileSync(pathJson, "utf-8"));

    // Limpiar archivos viejos, conservar solo los últimos 2
    const dirPathJson = path.dirname(pathJson);
    cleanfiles(dirPathJson, `${marca}_`, `.json`, 1);

    // Responder al frontend con el listado
    res.json(distribuidoras);
  } catch (error) {
    console.error("Error al obtener distribuidoras:", error);
    res.status(500).json({ error: "Error al obtener distribuidoras" });
  }
};

module.exports = { obtenerDistribuidorasPorMarca };
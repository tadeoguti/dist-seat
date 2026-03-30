// backend/src/controllers/distribuidoras.controller.js
const {
  scrapeDistribuidorasPorMarca,
} = require("../services/distribuidoraScraper.service");
const {
  obtenerDistribuidorasPorNombreMarca,
} = require("../repository/distribuidoras.repository");

const obtenerDistribuidorasPorMarcaAdmin = async (req, res) => {
  const { marca } = req.query;
  if (!marca) {
    return res.status(400).json({ error: "Debes enviar el parámetro 'marca'" });
  }

  try {
    const distribuidoras = await scrapeDistribuidorasPorMarca(marca);
    res.json(distribuidoras);
  } catch (error) {
    console.error("❌ Error al obtener distribuidoras:", error);
    res.status(500).json({ error: "Error al obtener distribuidoras" });
  }
};

const obtenerDistribuidorasPorMarca = async (req, res) => {
  const { marca } = req.query;
  if (!marca) {
    return res.status(400).json({ error: "Debes enviar el parámetro 'marca'" });
  }
  console.log(`📡 Obteniendo distribuidoras desde BD para marca: ${marca}`);

  try {
    const distribuidoras = await obtenerDistribuidorasPorNombreMarca(marca);
    //console.log(distribuidoras);
    res.json(distribuidoras);
  } catch (error) {
    console.error("❌ Error al obtener distribuidoras:", error);
    res.status(500).json({ error: "Error al obtener distribuidoras" });
  }
};

module.exports = {
  obtenerDistribuidorasPorMarca,
  obtenerDistribuidorasPorMarcaAdmin,
};

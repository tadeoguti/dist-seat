// src/controllers/marca.controller.js
// const { scrapeMarcas } = require("../services/marcaScraper.service");

// async function getMarcas(req, res) {
//   try {
//     const marcas = await scrapeMarcas();
//     res.json(marcas);
//   } catch (err) {
//     console.error("Error obteniendo marcas:", err);
//     res.status(500).json({ error: "Error interno al obtener marcas" });
//   }
// }

// module.exports = { getMarcas };
const { findAllMarcas } = require("../repository/marcas.repository");

async function getMarcas(req, res) {
  try {
    const marcas = await findAllMarcas(); // 👈 lee de la tabla cache
    res.json(marcas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener marcas" });
  }
}

module.exports = { getMarcas };
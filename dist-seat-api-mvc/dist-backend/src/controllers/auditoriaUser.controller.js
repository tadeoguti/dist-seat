// backend/src/controllers/auditoria.controller.js
const {
  obtenerAuditoriaUsuariosDesdeBD,
} = require("../repository/auditoriaUser.repository");

async function obtenerAuditoriaUsuarios(req, res) {
  try {
    const registros = await obtenerAuditoriaUsuariosDesdeBD();
    res.json(registros);
  } catch (error) {
    console.error("Error al obtener auditoría:", error.message);
    res.status(500).json({ message: "Error al obtener auditoría" });
  }
}

module.exports = { obtenerAuditoriaUsuarios };

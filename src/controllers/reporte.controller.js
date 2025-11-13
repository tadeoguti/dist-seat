// src/controllers/reporte.controller.js
const reporteService = require("../services/reporte.service");

async function createReporte(req, res) {
  try {
    const { marca, distribuidoras } = req.body;

    if (typeof marca !== 'string' || !marca.trim()) {
      return res.status(400).json({ error: 'La marca debe ser un string válido' });
    }

    if (!Array.isArray(distribuidoras) || distribuidoras.length === 0) {
      return res.status(400).json({ error: 'Debes enviar al menos una distribuidora' });
    }

    const reporte = await reporteService.createReporte(marca, distribuidoras);
    res.status(201).json(reporte);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// async function getUsers(req, res) {
//   try {
//     const users = await userService.getUsers();
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }

//module.exports = { createUser, getUsers };
module.exports = { createReporte };

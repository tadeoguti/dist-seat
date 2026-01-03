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

    const userId = req.usuario.id; 
    const reporte = await reporteService.createReporte(marca, distribuidoras, userId);
    res.status(201).json(reporte);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getMisReportes(req, res) {
  try {
    const userId = req.usuario.id; 
    const reportes = await reporteService.getReportesByUserId(userId);
    
    if (!reportes || reportes.length === 0) {
      return res.json({ message: "No tienes reportes disponibles", reportes: [] });
    }

    //res.json({ reportes });
    res.json(reportes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

module.exports = { createReporte, getMisReportes };
// src/repository/reporte.repository.js
const db = require("../db/mysql/connection");

async function createReporte(usuarioId, marca, distribuidoras, archivoUrl) {
  const [result] = await db.execute(
    "INSERT INTO reportes (usuario_id, marca, distribuidoras, archivo_url) VALUES (?, ?, ?, ?)",
    [usuarioId, marca, JSON.stringify(distribuidoras), archivoUrl]
  );
  return { id: result.insertId, usuarioId, marca, distribuidoras, archivoUrl };
}

async function getReportesByUserId(usuarioId) {
  const [rows] = await db.execute(
    "SELECT * FROM reportes WHERE usuario_id = ? ORDER BY creado_en DESC",
    [usuarioId]
  );
  return rows;
}

module.exports = { createReporte, getReportesByUserId };

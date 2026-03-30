// src/repository/reporte.repository.js
const { poolPromise, sql } = require("../db/sqlserver/connection");

async function createReporte(usuarioId, marca, distribuidoras, archivoUrl) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('usuarioId', sql.Int, usuarioId)
    .input('marca', sql.VarChar, marca)
    .input('distribuidoras', sql.NVarChar, JSON.stringify(distribuidoras))
    .input('archivoUrl', sql.VarChar, archivoUrl)
    .query(`
      INSERT INTO reportes (usuario_id, marca, distribuidoras, archivo_url)
      OUTPUT inserted.id
      VALUES (@usuarioId, @marca, @distribuidoras, @archivoUrl)
    `);
  return { id: result.recordset[0].id, usuarioId, marca, distribuidoras, archivoUrl };
}

async function getReportesByUserId(usuarioId) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('usuarioId', sql.Int, usuarioId)
    .query("SELECT * FROM reportes WHERE usuario_id = @usuarioId ORDER BY creado_en DESC");
  return result.recordset;
}

async function getTodosLosReportesConUsuarios() {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT 
    r.*, 
    u.username, 
    u.email 
    FROM reportes r 
    JOIN usuarios u 
    ON r.usuario_id = u.id 
    ORDER BY r.creado_en DESC 
  `);
  return result.recordset;
}

module.exports = {
  createReporte,
  getReportesByUserId,
  getTodosLosReportesConUsuarios,
};

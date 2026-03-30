// src/repository/logs.repository.js
const { poolPromise, sql } = require("../db/sqlserver/connection");

/**
 * Registra un intento de scraping en la tabla logs_scraping
 * @param {number} marcaId - ID de la marca
 * @param {string} tipo - Tipo de scraping (ej. 'distribuidoras')
 * @param {string} mensaje - Mensaje de error o éxito
 * @param {number} intento - Número de intento (1, 2, 3)
 * @param {boolean} exitoso - true si fue exitoso, false si falló
 */
async function registrarLogScraping(marcaId, tipo, mensaje, intento, exitoso) {
  const pool = await poolPromise;
  await pool.request()
    .input('marcaId', sql.Int, marcaId)
    .input('tipo', sql.VarChar, tipo)
    .input('mensaje', sql.NVarChar, mensaje)
    .input('intento', sql.Int, intento)
    .input('exitoso', sql.Bit, exitoso ? 1 : 0)
    .query(`
      INSERT INTO logs_scraping (marca_id, tipo, mensaje, intento, exitoso)
      VALUES (@marcaId, @tipo, @mensaje, @intento, @exitoso)
    `);
}

module.exports = {
  registrarLogScraping,
};

// src/repository/distribuidoras.repository.js
const { poolPromise, sql } = require("../db/sqlserver/connection");

/**
 * Obtiene las distribuidoras activas de una marca
 * @param {number} marcaId
 * @returns {Promise<Array>}
 */
async function obtenerDistribuidorasPorMarca(marcaId) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('marcaId', sql.Int, marcaId)
    .query("SELECT * FROM distribuidoras WHERE marca_id = @marcaId AND activa = 1");
  return result.recordset;
}

/**
 * Inserta o actualiza distribuidoras para una marca
 * Desactiva las anteriores y activa las nuevas
 * @param {number} marcaId
 * @param {Array} distribuidoras
 */
async function insertarDistribuidorasPorMarca(marcaId, distribuidoras) {
  const pool = await poolPromise;
  // Desactivar distribuidoras anteriores
  await pool.request()
    .input('marcaId', sql.Int, marcaId)
    .query("UPDATE distribuidoras SET activa = 0 WHERE marca_id = @marcaId");

  // Insertar nuevas distribuidoras
  for (const dist of distribuidoras) {
    await pool.request()
      .input('marcaId', sql.Int, marcaId)
      .input('idDist', sql.VarChar, dist.idDist)
      .input('nameDist', sql.VarChar, dist.nameDist)
      .input('urlDist', sql.VarChar, dist.urlDist)
      .query(`
        MERGE distribuidoras AS target
        USING (SELECT @marcaId AS marca_id, @idDist AS id_dist) AS source
        ON (target.marca_id = source.marca_id AND target.id_dist = source.id_dist)
        WHEN MATCHED THEN
          UPDATE SET nombre = @nameDist, url = @urlDist, activa = 1, fecha_registro = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (marca_id, id_dist, nombre, url, activa, fecha_registro)
          VALUES (@marcaId, @idDist, @nameDist, @urlDist, 1, GETDATE());
      `);
  }
}

/**
 * Obtiene las distribuidoras activas de una marca por nombre de marca
 * @param {string} nombreMarca
 * @returns {Promise<Array>}
 */
async function obtenerDistribuidorasPorNombreMarca(nombreMarca) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('nombreMarca', sql.VarChar, nombreMarca)
    .query(`
      SELECT d.*
      FROM distribuidoras d
      JOIN marcas m ON d.marca_id = m.id
      WHERE m.nombre = @nombreMarca AND d.activa = 1
    `);
  return result.recordset;
}

module.exports = {
  obtenerDistribuidorasPorMarca,
  insertarDistribuidorasPorMarca,
  obtenerDistribuidorasPorNombreMarca,
};

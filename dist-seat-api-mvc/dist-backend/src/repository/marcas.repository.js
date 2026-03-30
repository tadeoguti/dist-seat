// src/repository/marca.repository.js
const { poolPromise, sql } = require("../db/sqlserver/connection");

/**
 * Obtiene todas las marcas (activas e inactivas)
 */
async function findAllMarcas() {
  const pool = await poolPromise;
  const result = await pool.request().query("SELECT * FROM marcas");
  return result.recordset;
}

/**
 * Obtiene solo las marcas activas
 */
async function getMarcasActivas() {
  const pool = await poolPromise;
  const result = await pool.request().query(
    "SELECT id, nombre FROM marcas WHERE activa = 1",
  );
  return result.recordset;
}

/**
 * Crea o actualiza una marca con todos los campos relevantes
 * @param {number} id
 * @param {string} nombre
 * @param {boolean} activa
 * @param {string|null} ultimaActualizacion - formato 'YYYY-MM-DD HH:MM:SS' o null
 */
async function createOrUpdateMarca(
  id,
  nombre,
  activa = true,
  ultimaActualizacion = null,
) {
  const pool = await poolPromise;
  await pool.request()
    .input('id', sql.Int, id)
    .input('nombre', sql.VarChar, nombre)
    .input('activa', sql.Bit, activa ? 1 : 0)
    .input('ultimaActualizacion', sql.DateTime2, ultimaActualizacion)
    .query(`
      MERGE marcas AS target
      USING (SELECT @id AS id) AS source
      ON (target.id = source.id)
      WHEN MATCHED THEN
        UPDATE SET nombre = @nombre, activa = @activa, ultima_actualizacion = @ultimaActualizacion
      WHEN NOT MATCHED THEN
        INSERT (id, nombre, activa, ultima_actualizacion)
        VALUES (@id, @nombre, @activa, @ultimaActualizacion);
    `);
  return id;
}

/**
 * Borra todas las marcas (útil para recargar desde cero)
 */
async function deleteAllMarcas() {
  const pool = await poolPromise;
  await pool.request().query("DELETE FROM marcas");
}

/**
 * Actualiza la fecha de última actualización de una marca a NOW()
 * @param {number} marcaId
 */
async function actualizarUltimaActualizacion(marcaId) {
  const pool = await poolPromise;
  await pool.request()
    .input('marcaId', sql.Int, marcaId)
    .query("UPDATE marcas SET ultima_actualizacion = GETDATE() WHERE id = @marcaId");
}

module.exports = {
  findAllMarcas,
  getMarcasActivas,
  createOrUpdateMarca,
  deleteAllMarcas,
  actualizarUltimaActualizacion,
};

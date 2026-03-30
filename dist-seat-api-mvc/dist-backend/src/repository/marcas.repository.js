// src/repository/marca.repository.js
const db = require("../db/mysql/connection");

/**
 * Obtiene todas las marcas (activas e inactivas)
 */
async function findAllMarcas() {
  const [rows] = await db.execute("SELECT * FROM marcas");
  return rows;
}

/**
 * Obtiene solo las marcas activas
 */
async function getMarcasActivas() {
  const [rows] = await db.execute(
    "SELECT id, nombre FROM marcas WHERE activa = true",
  );
  return rows;
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
  const [result] = await db.execute(
    `INSERT INTO marcas (id, nombre, activa, ultima_actualizacion)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       nombre = VALUES(nombre),
       activa = VALUES(activa),
       ultima_actualizacion = VALUES(ultima_actualizacion)`,
    [id, nombre, activa, ultimaActualizacion],
  );
  return result.insertId || id;
}

/**
 * Borra todas las marcas (útil para recargar desde cero)
 */
async function deleteAllMarcas() {
  await db.execute("DELETE FROM marcas");
}

/**
 * Actualiza la fecha de última actualización de una marca a NOW()
 * @param {number} marcaId
 */
async function actualizarUltimaActualizacion(marcaId) {
  await db.execute(
    "UPDATE marcas SET ultima_actualizacion = NOW() WHERE id = ?",
    [marcaId],
  );
}

module.exports = {
  findAllMarcas,
  getMarcasActivas,
  createOrUpdateMarca,
  deleteAllMarcas,
  actualizarUltimaActualizacion,
};

// src/repository/distribuidoras.repository.js
const db = require("../db/mysql/connection");

/**
 * Obtiene las distribuidoras activas de una marca
 * @param {number} marcaId
 * @returns {Promise<Array>}
 */
async function obtenerDistribuidorasPorMarca(marcaId) {
  const [rows] = await db.query(
    "SELECT * FROM distribuidoras WHERE marca_id = ? AND activa = true",
    [marcaId],
  );
  return rows;
}

/**
 * Inserta o actualiza distribuidoras para una marca
 * Desactiva las anteriores y activa las nuevas
 * @param {number} marcaId
 * @param {Array} distribuidoras
 */
async function insertarDistribuidorasPorMarca(marcaId, distribuidoras) {
  // Desactivar distribuidoras anteriores
  await db.query(
    "UPDATE distribuidoras SET activa = false WHERE marca_id = ?",
    [marcaId],
  );

  // Insertar nuevas distribuidoras
  for (const dist of distribuidoras) {
    await db.query(
      `INSERT INTO distribuidoras (marca_id, id_dist, nombre, url, activa, fecha_registro)
       VALUES (?, ?, ?, ?, true, NOW())
       ON DUPLICATE KEY UPDATE
         nombre = VALUES(nombre),
         url = VALUES(url),
         activa = true,
         fecha_registro = NOW()`,
      [marcaId, dist.idDist, dist.nameDist, dist.urlDist],
    );
  }
}

/**
 * Obtiene las distribuidoras activas de una marca por nombre de marca
 * @param {string} nombreMarca
 * @returns {Promise<Array>}
 */
async function obtenerDistribuidorasPorNombreMarca(nombreMarca) {
  const [rows] = await db.query(
    `SELECT d.*
     FROM distribuidoras d
     JOIN marcas m ON d.marca_id = m.id
     WHERE m.nombre = ? AND d.activa = true`,
    [nombreMarca],
  );
  return rows;
}

module.exports = {
  obtenerDistribuidorasPorMarca,
  insertarDistribuidorasPorMarca,
  obtenerDistribuidorasPorNombreMarca,
};

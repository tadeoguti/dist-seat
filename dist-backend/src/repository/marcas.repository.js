// src/repository/marca.repository.js
const db = require('../db/mysql/connection');

// Obtener todas las marcas
async function findAllMarcas() {
    const [rows] = await db.execute('SELECT * FROM marcas');
    return rows;
}

// Guardar una nueva marca
async function createMarca(id, nombre) {
    const [result] = await db.execute(
        "INSERT INTO marcas (id, nombre) VALUES (?, ?)",
        [id, nombre]
    );
    return result.insertId;
}

// Borrar todas las marcas (para refrescar el cache)
async function deleteAllMarcas() {
    await db.execute('DELETE FROM marcas');
}

module.exports = { findAllMarcas, createMarca, deleteAllMarcas };

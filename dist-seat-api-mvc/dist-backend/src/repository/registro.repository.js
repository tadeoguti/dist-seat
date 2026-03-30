// src/repository/registro.repository.js
const db = require('../db/mysql/connection');

async function registrarAccion({ usuarioId, marca, distribuidora, action, payload }) {
    const [result] = await db.execute(
        `INSERT INTO registros (usuario_id, marca, distribuidora, action, payload)
     VALUES (?, ?, ?, ?, ?)`,
        [usuarioId, marca, distribuidora, action, JSON.stringify(payload)]
    );
    return result.insertId;
}

module.exports = { registrarAccion };

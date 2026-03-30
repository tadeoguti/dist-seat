// src/repository/registro.repository.js
const { poolPromise, sql } = require('../db/sqlserver/connection');

async function registrarAccion({ usuarioId, marca, distribuidora, action, payload }) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('usuarioId', sql.Int, usuarioId)
        .input('marca', sql.VarChar, marca)
        .input('distribuidora', sql.VarChar, distribuidora)
        .input('action', sql.VarChar, action)
        .input('payload', sql.NVarChar, JSON.stringify(payload))
        .query(`
            INSERT INTO registros (usuario_id, marca, distribuidora, action, payload)
            OUTPUT inserted.id
            VALUES (@usuarioId, @marca, @distribuidora, @action, @payload)
        `);
    return result.recordset[0].id;
}

module.exports = { registrarAccion };

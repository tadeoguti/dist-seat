// backend/src/repository/auditoriaUser.repository.js
const { poolPromise, sql } = require("../db/sqlserver/connection");

async function registrarAuditoriaUsuario({
  usuarioId,
  adminId = null,
  accion,
  payload_anterior = null,
  payload_nuevo = null,
}) {
  const query = `
    INSERT INTO auditoria_usuarios (usuario_id, admin_id, accion, payload_anterior, payload_nuevo)
    VALUES (@usuarioId, @adminId, @accion, @payload_anterior, @payload_nuevo)
  `;
  const pool = await poolPromise;
  await pool.request()
    .input('usuarioId', sql.Int, usuarioId)
    .input('adminId', sql.Int, adminId)
    .input('accion', sql.VarChar, accion)
    .input('payload_anterior', sql.NVarChar, payload_anterior ? JSON.stringify(payload_anterior) : null)
    .input('payload_nuevo', sql.NVarChar, payload_nuevo ? JSON.stringify(payload_nuevo) : null)
    .query(query);
}

async function obtenerAuditoriaUsuariosDesdeBD() {
  const pool = await poolPromise;
  const result = await pool.request().query(
    ` SELECT 
    a.id, 
    a.usuario_id,
    u.username AS usuario_afectado, 
    a.admin_id, 
    admin.username AS realizado_por, 
    a.accion, 
    a.payload_anterior, 
    a.payload_nuevo, 
    a.fecha 
    FROM auditoria_usuarios a 
    JOIN usuarios u ON a.usuario_id = u.id 
    LEFT JOIN usuarios admin ON a.admin_id = admin.id 
    ORDER BY a.fecha DESC `
  );
  return result.recordset;
}

module.exports = { registrarAuditoriaUsuario, obtenerAuditoriaUsuariosDesdeBD };

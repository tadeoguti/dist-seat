// backend/src/repository/auditoriaUser.repository.js
const db = require("../db/mysql/connection");

async function registrarAuditoriaUsuario({
  usuarioId,
  adminId = null,
  accion,
  payload_anterior = null,
  payload_nuevo = null,
}) {
  const query = `
    INSERT INTO auditoria_usuarios (usuario_id, admin_id, accion, payload_anterior, payload_nuevo)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [
    usuarioId,
    adminId,
    accion,
    payload_anterior ? JSON.stringify(payload_anterior) : null,
    payload_nuevo ? JSON.stringify(payload_nuevo) : null,
  ];

  await db.query(query, values);
}

async function obtenerAuditoriaUsuariosDesdeBD() {
  const [rows] = await db.query(
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
    ORDER BY a.fecha DESC `,
  );
  return rows;
}

module.exports = { registrarAuditoriaUsuario, obtenerAuditoriaUsuariosDesdeBD };

//backend/src/repository/user.repository.js
const db = require("../db/mysql/connection");

async function findUserByEmail(email) {
  const [rows] = await db.execute("SELECT * FROM usuarios WHERE email = ?", [
    email,
  ]);
  return rows[0];
}

async function createUser(
  username,
  email,
  passwordHash,
  roleId,
  activo = true,
) {
  const [result] = await db.execute(
    "INSERT INTO usuarios (username, email, password_hash, role_id,activo) VALUES (?, ?, ?, ?, ?)",
    [username, email, passwordHash, roleId, activo],
  );
  return result.insertId;
}

async function obtenerUsuariosDesdeBD() {
  const [rows] = await db.execute(
    "SELECT id, username, email, role_id, activo FROM usuarios",
  );
  return rows;
}

async function actualizarUsuarioEnBD(id, campos) {
  const columnas = [];
  const valores = [];
  if (campos.username) {
    columnas.push("username = ?");
    valores.push(campos.username);
  }
  if (campos.email) {
    columnas.push("email = ?");
    valores.push(campos.email);
  }
  if (campos.passwordHash) {
    columnas.push("password_hash = ?");
    valores.push(campos.passwordHash);
  }
  if (campos.roleId) {
    columnas.push("role_id = ?");
    valores.push(campos.roleId);
  }
  if (columnas.length === 0) return false;
  valores.push(id);
  const sql = `UPDATE usuarios SET ${columnas.join(", ")} WHERE id = ?`;
  const [result] = await db.execute(sql, valores);
  return result.affectedRows > 0;
}
async function desactivarUsuarioEnBD(id) {
  const [result] = await db.execute(
    "UPDATE usuarios SET activo = 0 WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
}

async function activarUsuarioEnBD(id) {
  const [result] = await db.execute(
    "UPDATE usuarios SET activo = 1 WHERE id = ?",
    [id],
  );
  return result.affectedRows > 0;
}

async function findUserById(id) {
  const [rows] = await db.query("SELECT * FROM usuarios WHERE id = ?", [id]);
  return rows[0];
}

module.exports = {
  findUserById,
  findUserByEmail,
  createUser,
  obtenerUsuariosDesdeBD,
  actualizarUsuarioEnBD,
  desactivarUsuarioEnBD,
  activarUsuarioEnBD,
};

//backend/src/repository/user.repository.js
const { poolPromise, sql } = require("../db/sqlserver/connection");

async function findUserByEmail(email) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('email', sql.VarChar, email)
    .query("SELECT * FROM usuarios WHERE email = @email");
  return result.recordset[0];
}

async function createUser(
  username,
  email,
  passwordHash,
  roleId,
  activo = true,
) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('username', sql.VarChar, username)
    .input('email', sql.VarChar, email)
    .input('passwordHash', sql.VarChar, passwordHash)
    .input('roleId', sql.Int, roleId)
    .input('activo', sql.Bit, activo ? 1 : 0)
    .query(`
      INSERT INTO usuarios (username, email, password_hash, role_id, activo) 
      OUTPUT inserted.id
      VALUES (@username, @email, @passwordHash, @roleId, @activo)
    `);
  return result.recordset[0].id;
}

async function obtenerUsuariosDesdeBD() {
  const pool = await poolPromise;
  const result = await pool.request().query(
    "SELECT id, username, email, role_id, activo FROM usuarios",
  );
  return result.recordset;
}

async function actualizarUsuarioEnBD(id, campos) {
  if (Object.keys(campos).length === 0) return false;
  const pool = await poolPromise;
  const request = pool.request();
  
  const setClauses = [];
  if (campos.username) {
    setClauses.push("username = @username");
    request.input('username', sql.VarChar, campos.username);
  }
  if (campos.email) {
    setClauses.push("email = @email");
    request.input('email', sql.VarChar, campos.email);
  }
  if (campos.passwordHash) {
    setClauses.push("password_hash = @passwordHash");
    request.input('passwordHash', sql.VarChar, campos.passwordHash);
  }
  if (campos.roleId) {
    setClauses.push("role_id = @roleId");
    request.input('roleId', sql.Int, campos.roleId);
  }
  if (setClauses.length === 0) return false;
  
  request.input('id', sql.Int, id);
  const sqlQuery = `UPDATE usuarios SET ${setClauses.join(", ")} WHERE id = @id`;
  const result = await request.query(sqlQuery);
  return result.rowsAffected[0] > 0;
}

async function desactivarUsuarioEnBD(id) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query("UPDATE usuarios SET activo = 0 WHERE id = @id");
  return result.rowsAffected[0] > 0;
}

async function activarUsuarioEnBD(id) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query("UPDATE usuarios SET activo = 1 WHERE id = @id");
  return result.rowsAffected[0] > 0;
}

async function findUserById(id) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query("SELECT * FROM usuarios WHERE id = @id");
  return result.recordset[0];
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

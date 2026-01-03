const db = require('../db/mysql/connection');

async function findUserByEmail(email) {
  const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0];
}

async function createUser(username, email, passwordHash, roleId) {
  const [result] = await db.execute(
    'INSERT INTO usuarios (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
    [username, email, passwordHash, roleId]
  );
  return result.insertId;
}

module.exports = { findUserByEmail, createUser };

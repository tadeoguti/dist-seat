// src/repository/roles.repository.js
const { poolPromise, sql } = require("../db/sqlserver/connection");

// Obtener todos los roles
const obtenerRolesDesdeBD = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT id, name, description FROM roles");
    return result.recordset;
  } catch (error) {
    console.error("Error al obtener roles:", error);
    throw error;
  }
};

// Buscar un rol por su ID
const findRoleById = async (id) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT id, name, description FROM roles WHERE id = @id");

    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error(`Error al buscar rol con ID ${id}:`, error);
    throw error;
  }
};

// Buscar un rol por su nombre
const findRoleByName = async (name) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("name", sql.VarChar(50), name)
      .query("SELECT id, name, description FROM roles WHERE name = @name");

    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error(`Error al buscar rol por nombre ${name}:`, error);
    throw error;
  }
};

module.exports = {
  obtenerRolesDesdeBD,
  findRoleById,
  findRoleByName
};

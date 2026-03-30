const bcrypt = require("bcryptjs");
const { poolPromise, sql } = require("./connection");

async function runSeed() {
  try {
    const pool = await poolPromise;
    
    // Insertar roles usando MERGE en vez de INSERT IGNORE
    await pool.request()
      .input('name', sql.VarChar, 'admin')
      .input('desc', sql.NVarChar, 'Administrador del sistema')
      .query(`
        MERGE roles AS target
        USING (SELECT @name AS name) AS source
        ON (target.name = source.name)
        WHEN NOT MATCHED THEN
          INSERT (name, description) VALUES (@name, @desc);
      `);

    await pool.request()
        .input('name', sql.VarChar, 'user')
        .input('desc', sql.NVarChar, 'Usuario estándar')
        .query(`
          MERGE roles AS target
          USING (SELECT @name AS name) AS source
          ON (target.name = source.name)
          WHEN NOT MATCHED THEN
            INSERT (name, description) VALUES (@name, @desc);
        `);

    // Insertar admin default
    const result = await pool.request().query("SELECT id FROM roles WHERE name = 'admin'");
    const adminRoleId = result.recordset[0] ? result.recordset[0].id : 1;

    const passwordHash = await bcrypt.hash("admin123", 10);
    
    await pool.request()
      .input('username', sql.VarChar, 'admin')
      .input('email', sql.VarChar, 'admin@example.com')
      .input('passwordHash', sql.VarChar, passwordHash)
      .input('roleId', sql.Int, adminRoleId)
      .query(`
        MERGE usuarios AS target
        USING (SELECT @email AS email) AS source
        ON (target.email = source.email)
        WHEN NOT MATCHED THEN
          INSERT (username, email, password_hash, role_id) VALUES (@username, @email, @passwordHash, @roleId);
      `);

    console.log("Seed ejecutado correctamente ✅");
    process.exit(0);
  } catch (error) {
    console.error("Error ejecutando seed ❌", error);
    process.exit(1);
  }
}

runSeed();

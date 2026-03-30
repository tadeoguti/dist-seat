const bcrypt = require("bcryptjs");
const db = require("./connection");

async function runSeed() {
  try {
    // Insertar roles (ignora si ya existen)
    await db.execute(
      "INSERT IGNORE INTO roles (name, description) VALUES (?, ?)",
      ["admin", "Administrador del sistema"]
    );
    await db.execute(
      "INSERT IGNORE INTO roles (name, description) VALUES (?, ?)",
      ["user", "Usuario estándar"]
    );

    // Crear usuario admin con contraseña encriptada
    const passwordHash = await bcrypt.hash("admin123", 10);
    await db.execute(
      "INSERT IGNORE INTO usuarios (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)",
      ["admin", "admin@example.com", passwordHash, 1]
    );

    console.log("Seed ejecutado correctamente ✅");
    process.exit(0);
  } catch (error) {
    console.error("Error ejecutando seed ❌", error);
    process.exit(1);
  }
}

runSeed();

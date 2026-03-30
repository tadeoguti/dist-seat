// middlewares/verificarAdmin.middlewares.js
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "tu_clave_secreta";

function verificarAdmin(req, res, next) {
  try {
    if (!req.usuario || req.usuario.roleId !== 1) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: solo administradores" });
    }
    next(); // Continúa con la siguiente función
  } catch (error) {
    console.error("Error al verificar tipo rol:", error.message);
    return res.status(401).json({ message: "Token inválido o expirado..." });
  }
}

module.exports = { verificarAdmin };

// src/middlewares/auth.middlewares.js
const jwt = require("jsonwebtoken");
const { registrarAccion } = require("../repository/registro.repository");
const SECRET_KEY = process.env.SECRET_KEY || "tu_clave_secreta";

async function verificarToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token no proporcionado" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    //console.log("Token decodificado:", decoded);
    // Validar que el token tenga los campos esperados
    if (!decoded.id || !decoded.email) {
      return res
        .status(401)
        .json({ error: "Token inválido: datos incompletos" });
    }
    //console.log("Token decodificado:", decoded);
    req.usuario = decoded;

    // (Opcional) Registrar acceso a ruta protegida
    await registrarAccion({
      usuarioId: decoded.id,
      marca: null,
      distribuidora: null,
      action: "acceso_ruta_protegida",
      payload: { ruta: req.originalUrl, metodo: req.method },
    });

    next();
  } catch (err) {
    console.error("❌ Error al verificar token:", err.message);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

module.exports = { verificarToken };

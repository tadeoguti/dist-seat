const bcrypt = require("bcrypt");
const userRepository = require("../repository/user.repository");
const { generarToken } = require("../helpers/auth.helpers");
const { loginService } = require("../services/auth.service");
const { registrarAccion } = require("../repository/registro.repository");
const {
  registrarAuditoriaUsuario,
} = require("../repository/auditoriaUser.repository");

//registro de usuario
async function register(req, res) {
  try {
    const { username, email, password, roleId } = req.body;

    // Validar contraseña
    if (!password || password.trim().length < 8) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Guardar en DB
    const userId = await userRepository.createUser(
      username,
      email,
      passwordHash,
      roleId,
    );

    // Registrar acción
    await registrarAccion({
      usuarioId: userId,
      marca: null,
      distribuidora: null,
      action: "registro",
      payload: { username, email, roleId },
    });

    await registrarAuditoriaUsuario({
      usuarioId: userId,
      adminId: req.usuario?.id || null,
      accion: "registro",
      payload_anterior: null,
      payload_nuevo: { username, email, roleId },
    });

    res.status(201).json({ message: "Usuario creado", userId });
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    res
      .status(500)
      .json({ error: "Error al registrar usuario", details: error.message });
  }
}

//Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userRepository.findUserByEmail(email);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Comparar contraseña
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ error: "Credenciales inválidas" });

    // ✅ Validar si el usuario está activo
    if (!user.activo) {
      return res
        .status(403)
        .json({ error: "Tu cuenta está inactiva. Contacta al administrador." });
    }

    // Generar JWT usando tu Helper
    const token = generarToken({
      id: user.id,
      email: user.email,
      roleId: user.role_id,
    });

    // Registrar acción
    await registrarAccion({
      usuarioId: user.id,
      marca: null,
      distribuidora: null,
      action: "login",
      payload: { email },
    });

    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id: user.id,
        name: user.username,
        mail: user.email,
        roleId: user.role_id,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al iniciar sesión", details: error.message });
  }
};

module.exports = { register, login };

// src/controllers/usuarios.controller.js
const bcrypt = require("bcryptjs");
const {
  findUserById,
  obtenerUsuariosDesdeBD,
  actualizarUsuarioEnBD,
  desactivarUsuarioEnBD,
  activarUsuarioEnBD,
} = require("../repository/user.repository");
const {
  registrarAuditoriaUsuario,
} = require("../repository/auditoriaUser.repository");

// Obtener todos los usuarios
async function obtenerUsuarios(req, res) {
  try {
    const usuarios = await obtenerUsuariosDesdeBD();
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
}

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, roleId } = req.body;
  try {
    // Obtener estado anterior del usuario
    const usuarioAntes = await findUserById(id);
    if (!usuarioAntes) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const campos = { username, email, roleId };

    // Validar y encriptar contraseña solo si se proporciona y es válida
    if (password && password.trim() !== "") {
      if (password.trim().length < 8) {
        return res.status(400).json({
          error: "La nueva contraseña debe tener al menos 8 caracteres",
        });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      campos.passwordHash = passwordHash;
    }

    const actualizado = await actualizarUsuarioEnBD(id, campos);
    if (!actualizado) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado o sin cambios" });
    }
    //console.log("🛠️ Editando usuario con ID:", id);

    // Registrar auditoría
    await registrarAuditoriaUsuario({
      usuarioId: parseInt(id),
      adminId: req.usuario?.id || null,
      accion: "Actualización",
      payload_anterior: {
        username: usuarioAntes.username,
        email: usuarioAntes.email,
        roleId: usuarioAntes.roleId,
      },
      payload_nuevo: { username, email, roleId },
    });
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error.message);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};
// Desactivar usuario
const desactivarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuarioAntes = await findUserById(id);
    if (!usuarioAntes) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const desactivado = await desactivarUsuarioEnBD(id);
    if (!desactivado) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await registrarAuditoriaUsuario({
      usuarioId: parseInt(id),
      adminId: req.usuario?.id || null,
      accion: "desactivar",
      payload_anterior: { activo: usuarioAntes.activo },
      payload_nuevo: { activo: false },
    });

    res.json({ message: "Usuario desactivado correctamente" });
  } catch (error) {
    console.error("Error al desactivar usuario:", error.message);
    res.status(500).json({ message: "Error al desactivar usuario" });
  }
};

const activarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuarioAntes = await findUserById(id);
    if (!usuarioAntes) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const activado = await activarUsuarioEnBD(id);
    if (!activado) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await registrarAuditoriaUsuario({
      usuarioId: parseInt(id),
      adminId: req.usuario?.id || null,
      accion: "activar",
      payload_anterior: { activo: usuarioAntes.activo },
      payload_nuevo: { activo: true },
    });

    res.json({ message: "Usuario activado correctamente" });
  } catch (error) {
    console.error("Error al activar usuario:", error.message);
    res.status(500).json({ message: "Error al activar usuario" });
  }
};

module.exports = {
  obtenerUsuarios,
  actualizarUsuario,
  desactivarUsuario,
  activarUsuario,
};

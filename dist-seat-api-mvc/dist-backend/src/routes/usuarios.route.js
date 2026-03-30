// backend/src/routes/usuarios.route.js
const express = require("express");
const router = express.Router();
const { verificarAdmin } = require("../middlewares/verificarAdmin.middlewares");
const { verificarToken } = require("../middlewares/auth.middlewares");
const {
  obtenerUsuarios,
  actualizarUsuario,
  desactivarUsuario,
  activarUsuario,
} = require("../controllers/usuarios.controller");

// Ruta protegida
router.get("/", verificarToken, verificarAdmin, obtenerUsuarios);
router.put("/:id", verificarToken, verificarAdmin, actualizarUsuario);
router.patch(
  "/:id/desactivar",
  verificarToken,
  verificarAdmin,
  desactivarUsuario,
);
router.patch("/:id/activar", verificarToken, verificarAdmin, activarUsuario);

module.exports = router;

const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middlewares/auth.middlewares");
const { verificarAdmin } = require("../middlewares/verificarAdmin.middlewares");
const {
  obtenerAuditoriaUsuarios,
} = require("../controllers/auditoriaUser.controller");

router.get("/", verificarToken, verificarAdmin, obtenerAuditoriaUsuarios);

module.exports = router;

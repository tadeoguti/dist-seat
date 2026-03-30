// src/routes/marca.routes.js
const express = require("express");
const {
  getMarcas,
  getMarcasAll,
  upsertMarca,
} = require("../controllers/marca.controller");
const { verificarToken } = require("../middlewares/auth.middlewares");
const { verificarAdmin } = require("../middlewares/verificarAdmin.middlewares");
const router = express.Router();

router.get("/", verificarToken, getMarcas); // Público
router.get("/admin/marcas", verificarToken, verificarAdmin, getMarcasAll); // Solo admin
router.post("/admin/marcas", verificarToken, verificarAdmin, upsertMarca); // Crear o actualizar marca

module.exports = router;

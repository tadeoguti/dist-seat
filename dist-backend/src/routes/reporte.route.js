// src/routes/reporte.route.js
const express = require("express");
const { createReporte, getMisReportes } = require("../controllers/reporte.controller");
const { verificarToken } = require("../middlewares/auth.middlewares");
const router = express.Router();

router.post("/", verificarToken, createReporte);
router.get("/mis-reportes", verificarToken, getMisReportes);
//router.get("/", reporteController.getReportes);

module.exports = router;

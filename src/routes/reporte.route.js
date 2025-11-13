// src/routes/reporte.routes.js
const express = require("express");
const { createReporte } = require("../controllers/reporte.controller");
const { verificarToken } = require("../middlewares/auth.middlewares");
const router = express.Router();

router.post("/", verificarToken, createReporte);
//router.get("/", reporteController.getReportes);

module.exports = router;

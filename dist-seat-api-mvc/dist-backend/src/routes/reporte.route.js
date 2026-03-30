// src/routes/reporte.route.js
const express = require("express");
const { createReporte, getMisReportes, /*progresoReporte,*/ cancelarProcesoHandler } = require("../controllers/reporte.controller");
const { verificarToken } = require("../middlewares/auth.middlewares");

const router = express.Router();

router.post("/", verificarToken, createReporte);
router.get("/mis-reportes", verificarToken, getMisReportes);
//router.get("/progreso-reporte", progresoReporte);
router.post("/cancelar/:sessionId", verificarToken, cancelarProcesoHandler);


module.exports = router;

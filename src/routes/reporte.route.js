// src/routes/user.routes.js
const express = require("express");
const router = express.Router();
const {createReporte} = require("../controllers/reporte.controller");

router.post("/name", createReporte);
//router.get("/", reporteController.getReportes);

module.exports = router;

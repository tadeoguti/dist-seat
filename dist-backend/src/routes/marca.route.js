// src/routes/marca.routes.js
const express = require("express");
const { getMarcas } = require("../controllers/marca.controller");
const { verificarToken } = require("../middlewares/auth.middlewares");
const router = express.Router();

router.get("/", verificarToken, getMarcas);

module.exports = router;
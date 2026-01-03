const express = require("express");
const { obtenerDistribuidorasPorMarca } = require("../controllers/distribuidoras.controller");
const { verificarToken } = require("../middlewares/auth.middlewares");
const router = express.Router();

router.get("/", verificarToken, obtenerDistribuidorasPorMarca);

module.exports = router;

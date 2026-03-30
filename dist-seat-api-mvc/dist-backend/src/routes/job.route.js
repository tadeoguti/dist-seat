const express = require("express");
const router = express.Router();
const { jobMarcas } = require("../jobs/marcas.job");
const { verificarToken } = require("../middlewares/auth.middlewares");

router.post("/ejecutar-marcas", verificarToken, async (req, res) => {
    try {
        await jobMarcas();
        res.json({ message: "✅ Job de marcas ejecutado manualmente" });
    } catch (error) {
        res.status(500).json({ message: "❌ Error al ejecutar job de marcas", error: error.message });
    }
});

module.exports = router;

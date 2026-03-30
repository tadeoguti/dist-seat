// src/controllers/marca.controller.js
const {
  findAllMarcas,
  getMarcasActivas,
  createOrUpdateMarca,
} = require("../repository/marcas.repository");

// Para usuarios normales: solo marcas activas
async function getMarcas(req, res) {
  try {
    const marcas = await getMarcasActivas();
    res.json(marcas);
  } catch (err) {
    console.error("Error al obtener marcas activas:", err);
    res.status(500).json({ error: "Error al obtener marcas activas" });
  }
}

// Para administradores: todas las marcas (activas e inactivas)
async function getMarcasAll(req, res) {
  try {
    const marcas = await findAllMarcas();
    res.json(marcas);
  } catch (err) {
    console.error("Error al obtener todas las marcas:", err);
    res.status(500).json({ error: "Error al obtener todas las marcas" });
  }
}

// (Opcional) Crear o actualizar una marca desde el panel de administración
async function upsertMarca(req, res) {
  try {
    const { id, nombre, activa } = req.body;
    if (!id || !nombre) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    await createOrUpdateMarca(id, nombre, activa ?? true, new Date());
    res.status(200).json({ mensaje: "Marca guardada correctamente" });
  } catch (err) {
    console.error("Error al guardar marca:", err);
    res.status(500).json({ error: "Error al guardar marca" });
  }
}

module.exports = {
  getMarcas,
  getMarcasAll,
  upsertMarca,
};

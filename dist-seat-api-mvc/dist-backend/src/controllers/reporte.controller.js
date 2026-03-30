// backend/src/controllers/reporte.controller.js
const reporteService = require("../services/reporte.service");
const { registrarAccion } = require("../repository/registro.repository");
const {
  ejecutarValidacionPorSesion,
} = require("../services/procesoValidacion.service");
const { cancelarProceso } = require("../utils/processManager");

async function createReporte(req, res) {
  try {
    const sessionId = req.headers["x-session-id"];
    const { marca, distribuidoras } = req.body;

    if (typeof marca !== "string" || !marca.trim()) {
      return res
        .status(400)
        .json({ error: "La marca debe ser un string válido" });
    }

    if (!Array.isArray(distribuidoras) || distribuidoras.length === 0) {
      return res
        .status(400)
        .json({ error: "Debes enviar al menos una distribuidora" });
    }

    const userId = req.usuario.id;
    const reporte = await reporteService.createReporte(
      marca,
      distribuidoras,
      userId,
      sessionId,
    );

    // Registrar acción
    await registrarAccion({
      usuarioId: userId,
      marca,
      distribuidora: distribuidoras.join(", "),
      action: "crear_reporte",
      payload: { marca, distribuidoras },
    });

    res.status(201).json(reporte);
  } catch (error) {
    if (error.message === "Proceso cancelado por el usuario") {
      return res.status(400).json({ message: error.message });
    } else {
      console.error("❌ Error al crear reporte:", error);
      res.status(500).json({ message: error.message });
    }
  }
}

async function getMisReportes(req, res) {
  console.log("Usuario recibido en controlador:", req.usuario);
  try {
    const { id: userId, roleId } = req.usuario;
    if (!userId) {
      return res.status(400).json({ error: "ID de usuario no proporcionado" });
    }

    const reportes =
      roleId === 1
        ? await reporteService.getTodosLosReportesConUsuarios()
        : await reporteService.getReportesByUserId(userId);

    // Registrar acción
    await registrarAccion({
      usuarioId: userId,
      marca: null,
      distribuidora: null,
      action: "ver_mis_reportes",
      payload: { cantidad: reportes.length },
    });

    // if (!reportes || reportes.length === 0) {
    //   return res.json({ message: "No tienes reportes disponibles", reportes: [] });
    // }

    //res.json({ reportes });
    return res.json({ reportes: reportes || [] });
  } catch (error) {
    console.error("❌ Error al obtener reportes:", error);
    res.status(500).json({ message: error.message });
  }
}
/*
async function progresoReporte(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { marca, distIds, sessionId } = req.query;
  console.log("📡 SSE recibido con sessionId:", sessionId);

  await ejecutarValidacionPorSesion({
    marca,
    distIds: distIds?.split(","),
    sessionId,
    res,
  });
}*/

async function cancelarProcesoHandler(req, res) {
  const { sessionId } = req.params;
  const userId = req.usuario?.id;
  const { marca = null, distribuidoras = [] } = req.body;

  const exito = cancelarProceso(sessionId);
  if (exito) {
    if (userId) {
      await registrarAccion({
        usuarioId: userId,
        marca,
        distribuidora: Array.isArray(distribuidoras)
          ? distribuidoras.join(", ")
          : null,
        action: "cancelar_proceso",
        payload: { sessionId },
      });
    }
    return res.status(200).json({ message: "Proceso cancelado" });
  } else {
    return res
      .status(404)
      .json({ message: "No se encontró un proceso activo" });
  }
}

module.exports = {
  createReporte,
  getMisReportes,
  /*progresoReporte,*/ cancelarProcesoHandler,
};

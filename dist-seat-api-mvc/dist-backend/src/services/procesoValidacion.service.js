// src/services/procesoValidacion.service.js

const sesionesActivas = new Map();

async function ejecutarValidacionPorSesion({ marca, distIds, sessionId, res }) {
  if (!sessionId) {
    res.write(`event: error\ndata: ${JSON.stringify({ message: "Falta sessionId" })}\n\n`);
    res.end();
    return;
  }

  if (sesionesActivas.has(sessionId)) {
    console.log("⛔ Sesión duplicada ignorada:", sessionId); // 🔍
    res.write(`event: info\ndata: ${JSON.stringify({ message: "Ya hay un proceso en curso para esta sesión." })}\n\n`);
    res.write("event: end\ndata: {}\n\n");
    res.end();
    return;
  }

  sesionesActivas.set(sessionId, true);
  console.log("🔥 SSE iniciado para:", sessionId);

  try {
    res.write(`event: info\ndata: ${JSON.stringify({ message: `Iniciando validación para ${distIds.length} distribuidoras de la marca ${marca}` })}\n\n`);

    res.write(`event: phase\ndata: ${JSON.stringify({ message: "Ejecutando validaciones..." })}\n\n`);

    res.write(`event: phase\ndata: ${JSON.stringify({ message: "Generando archivo Excel..." })}\n\n`);

    res.write(`event: done\ndata: ${JSON.stringify({ message: "Proceso finalizado" })}\n\n`);
    res.write("event: end\ndata: {}\n\n");
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ message: "Error en SSE", error: err.message })}\n\n`);
  } finally {
    sesionesActivas.delete(sessionId);
    res.end();
    console.log("✅ SSE finalizado para:", sessionId);
  }
}

module.exports = {
  ejecutarValidacionPorSesion,
};

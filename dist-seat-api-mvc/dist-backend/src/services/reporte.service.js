// src/services/reporte.service.js
const { STORAGE_PATH, BASE_URL } = require("../config");
const {
  validacionesPrincipales,
} = require("./checador/ejecutores/seat-LotesSitemap-Puppeter");
const path = require("path");
const fs = require("fs");
const reporteRepository = require("../repository/reporte.repository");
const {
  registrarProceso,
  eliminarProceso,
} = require("../utils/processManager");

async function createReporte(Marca, Distribuidoras, UserId, sessionId) {
  const controller = new AbortController(); // ✅ crear controlador
  registrarProceso(sessionId, controller); // ✅ registrar proceso activo
  try {
    const resultado = await validacionesPrincipales(
      Marca,
      Distribuidoras,
      //UserId,
      sessionId,
      controller.signal,
    );

    const nombreArchivo = path.basename(resultado.Excel); // extrae solo el nombre del archivo
    const rutaRelativa = `Resultados/${Marca}-ValidacionesPrincipales/Reporte/${nombreArchivo}`;
    const urlArchivo = `${BASE_URL}/storage/${rutaRelativa}`;

    //Guardar en DB
    const reporte = await reporteRepository.createReporte(
      UserId,
      Marca,
      Distribuidoras,
      urlArchivo,
    );

    return {
      message: "Reporte creado",
      reporte,
      userId: UserId,
      //urlExcel: urlArchivo,
      //datos: resultado
    };
  } catch (error) {
    if (controller.signal.aborted) {
      console.warn(`⚠️ Proceso cancelado para sessionId: ${sessionId}`);
      throw new Error("Proceso cancelado por el usuario");
    } else {
      console.error("❌ Error en validaciones:", error);
      throw error;
    }
  } finally {
    eliminarProceso(sessionId);
  }
}

async function getReportesByUserId(UserId) {
  const reportes = await reporteRepository.getReportesByUserId(UserId);

  return reportes.map((r) => {
    // Carpeta de distribuidoras
    const distFileDir = path.join(STORAGE_PATH, "dist");
    const files = fs.readdirSync(distFileDir);

    // Buscar archivos de la marca
    const marcaFiles = files.filter((f) => f.startsWith(r.marca + "_"));
    const latestFile = marcaFiles.sort().reverse()[0];
    const filePath = path.join(distFileDir, latestFile);

    // Leer JSON de distribuidoras
    const distribuidorasJson = JSON.parse(fs.readFileSync(filePath, "utf8"));

    let ids;
    try {
      ids = JSON.parse(r.distribuidoras);
      if (!Array.isArray(ids)) {
        ids = [ids]; // si es un valor único, lo convierto en array
      }
    } catch (e) {
      console.error("Error parseando distribuidoras:", r.distribuidoras);
      ids = [];
    }

    // Parsear ids guardados en la BD
    //const ids = JSON.parse(r.distribuidoras);

    // Enriquecer cada id con nombre y url
    const distribuidorasDetalladas = ids.map((id) => {
      const dist = distribuidorasJson.find((d) => d.idDist === String(id));
      return dist
        ? { id, name: dist.nameDist, url: dist.urlDist }
        : { id, name: "Desconocida", url: "#" };
    });

    return {
      id: r.id,
      marca: r.marca,
      distribuidoras: distribuidorasDetalladas,
      created_at: r.creado_en,
      fileUrl: r.archivo_url,
    };
  });

  return reportes.map((r) => ({
    id: r.id, // columna BD: id
    marca: r.marca, // columna BD: marca
    distribuidoras: JSON.parse(r.distribuidoras), // columna BD: distribuidoras (JSON)
    created_at: r.creado_en, // columna BD: creado_en → nombre JSON más claro
    fileUrl: r.archivo_url, // columna BD: archivo_url → nombre JSON más claro
  }));
}

async function getTodosLosReportesConUsuarios() {
  const reportes = await reporteRepository.getTodosLosReportesConUsuarios();

  return reportes.map((r) => {
    let ids;
    try {
      ids = JSON.parse(r.distribuidoras);
      if (!Array.isArray(ids)) ids = [ids];
    } catch (e) {
      ids = [];
    }

    const distFileDir = path.join(STORAGE_PATH, "dist");
    const files = fs.readdirSync(distFileDir);
    const marcaFiles = files.filter((f) => f.startsWith(r.marca + "_"));
    const latestFile = marcaFiles.sort().reverse()[0];
    const filePath = path.join(distFileDir, latestFile);

    const distribuidorasJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const distribuidorasDetalladas = ids.map((id) => {
      const dist = distribuidorasJson.find((d) => d.idDist === String(id));
      return dist
        ? { id, name: dist.nameDist, url: dist.urlDist }
        : { id, name: "Desconocida", url: "#" };
    });

    return {
      id: r.id,
      marca: r.marca,
      distribuidoras: distribuidorasDetalladas,
      created_at: r.creado_en,
      fileUrl: r.archivo_url,
      usuario: {
        id: r.usuario_id,
        username: r.username,
        email: r.email,
      },
    };
  });
}

module.exports = {
  createReporte,
  getReportesByUserId,
  getTodosLosReportesConUsuarios,
};

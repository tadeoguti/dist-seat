// src/services/reporte.service.js
const { STORAGE_PATH , BASE_URL } = require("../config");
const { validacionesPrincipales } = require("./checador/ejecutores/seat-LotesSitemap-Puppeter");
const path = require('path');
const fs = require("fs");
const reporteRepository = require("../repository/reporte.repository");

async function createReporte(Marca, Distribuidoras, UserId) {
      const resultado = await validacionesPrincipales(Marca, Distribuidoras);

      const nombreArchivo = path.basename(resultado.Excel); // extrae solo el nombre del archivo
      const rutaRelativa = `Resultados/${Marca}-ValidacionesPrincipales/Reporte/${nombreArchivo}`;
      const urlArchivo = `${BASE_URL}/storage/${rutaRelativa}`;

      //Guardar en DB
      const reporte = await reporteRepository.createReporte(UserId, Marca, Distribuidoras, urlArchivo);

      return { 
        message: "Reporte creado", 
        reporte,
        //userId: UserId,
        //urlExcel: urlArchivo,
        datos: resultado 
      };
}

async function getReportesByUserId(UserId) {
  const reportes = await reporteRepository.getReportesByUserId(UserId);

  return reportes.map(r => {
    // Carpeta de distribuidoras
    const distFileDir = path.join(STORAGE_PATH, "dist");
    const files = fs.readdirSync(distFileDir);

    // Buscar archivos de la marca
    const marcaFiles = files.filter(f => f.startsWith(r.marca + "_"));
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
    const distribuidorasDetalladas = ids.map(id => {
      const dist = distribuidorasJson.find(d => d.idDist === String(id));
      return dist
        ? { id, name: dist.nameDist, url: dist.urlDist }
        : { id, name: "Desconocida", url: "#" };
    });

    return {
      id: r.id,
      marca: r.marca,
      distribuidoras: distribuidorasDetalladas,
      created_at: r.creado_en,
      fileUrl: r.archivo_url
    };
  });
  
  // return reportes.map(r => ({
  //   id: r.id,                        // columna BD: id
  //   marca: r.marca,                  // columna BD: marca
  //   distribuidoras: JSON.parse(r.distribuidoras), // columna BD: distribuidoras (JSON)
  //   created_at: r.creado_en,         // columna BD: creado_en → nombre JSON más claro
  //   fileUrl: r.archivo_url           // columna BD: archivo_url → nombre JSON más claro
  // }));
}
 
module.exports = { createReporte, getReportesByUserId };
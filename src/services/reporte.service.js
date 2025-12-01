// src/services/user.service.js
const { validacionesPrincipales } = require("./checador/ejecutores/seat-LotesSitemap-Puppeter");
const path = require('path');
const reporteRepository = require("../repository/reporte.repository");

async function createReporte(Marca, Distribuidoras, UserId) {
      const resultado = await validacionesPrincipales(Marca, Distribuidoras);

      const nombreArchivo = path.basename(resultado.Excel); // extrae solo el nombre del archivo
      const rutaRelativa = `Resultados/${Marca}-ValidacionesPrincipales/Reporte/${nombreArchivo}`;
      const urlArchivo = `http://localhost:3000/storage/${rutaRelativa}`;

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
  return await reporteRepository.getReportesByUserId(UserId);
}
 
module.exports = { createReporte, getReportesByUserId };
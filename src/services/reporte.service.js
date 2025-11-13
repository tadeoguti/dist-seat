// src/services/user.service.js
const { validacionesPrincipales } = require("./checador/ejecutores/seat-LotesSitemap-Puppeter");
const path = require('path');

async function createReporte(Marca, Distribuidoras) {

      const resultado = await validacionesPrincipales(Marca, Distribuidoras);

      const nombreArchivo = path.basename(resultado.Excel); // extrae solo el nombre del archivo
      const rutaRelativa = `Resultados/${Marca}-ValidacionesPrincipales/Reporte/${nombreArchivo}`;
      const urlArchivo = `http://localhost:3000/storage/${rutaRelativa}`;

      return { 
        message: "Reporte creado", 
        urlExcel: urlArchivo,
        datos: resultado 
      };
}

// async function getUsers() {
//   // Aquí va tu código (ej: devolver datos de un archivo, API externa, etc.)
//   return [{ id: 1, name: "Usuario de prueba" }];
// }

module.exports = { createReporte };




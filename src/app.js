const express = require("express");
const reporteDist = require("./routes/reporte.route");
const cors = require('cors'); 

const app = express();
// Middleware para habilitar CORS 
  app.use(cors()); 
app.use(express.json()); // Para leer JSON en requests
//Rutas
app.use("/api/reporte", reporteDist);



module.exports = app;

const express = require("express");
const reporteDist = require("./routes/reporte.route");
const authRoutes = require("./routes/auth.route");
const distribuidorasRoutes = require("./routes/distribuidoras.route");
const path = require ('path');
const cors = require('cors');

const app = express();

// Middleware para habilitar CORS 
app.use(cors());
app.use(express.json()); // Para leer JSON en requests

//Rutas
app.use("/api/auth", authRoutes);
app.use("/api/reporte", reporteDist);

// Archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));
app.use('/storage', express.static(path.join(__dirname, '../storage')));


//Obtener listado de distribuidoras por marca
app.use("/api/distribuidoras", distribuidorasRoutes);

module.exports = app;
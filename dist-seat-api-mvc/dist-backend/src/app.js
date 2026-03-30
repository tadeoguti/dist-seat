const express = require("express");
const authRoutes = require("./routes/auth.route");
const distribuidorasRoutes = require("./routes/distribuidoras.route");
const marcaRoutes = require("./routes/marca.route");
const { iniciarMarcasJob } = require("./jobs/marcas.job");
const jobRoutes = require("./routes/job.route");
const reporteRoutes = require("./routes/reporte.route");
const sseRotue = require("./routes/sse.route");
const usuariosRouter = require("./routes/usuarios.route");
const auditoriaUser = require("./routes/auditoriaUser.route");
//const { iniciarDistribuidorasJob } = require("./jobs/distribuidoras.job");

const path = require("path");
const cors = require("cors");

const app = express();

// Middleware para habilitar CORS
app.use(cors());
app.use(express.json()); // Para leer JSON en requests

//Rutas Reporte
app.use("/api/auth", authRoutes);
app.use("/api/reporte", reporteRoutes);
app.use("/api/marcas", marcaRoutes);

//Ruta de Jobs
app.use("/api/jobs", jobRoutes);

// Archivos estáticos
app.use(express.static(path.join(__dirname, "../public")));
app.use("/storage", express.static(path.join(__dirname, "../storage")));

//Obtener listado de distribuidoras por marca
app.use("/api/distribuidoras", distribuidorasRoutes);

// Eventos SSE
app.use("/api/stream", sseRotue);

//Ruta Usuarios
app.use("/api/usuarios", usuariosRouter);

//Ruta Auditoria de usuarios
app.use("/api/auditoria", auditoriaUser);

// Llamado del job
iniciarMarcasJob();
//iniciarDistribuidorasJob();

module.exports = app;

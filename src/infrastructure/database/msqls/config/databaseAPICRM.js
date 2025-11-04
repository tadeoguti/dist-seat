require("dotenv").config();
const { Sequelize } = require('sequelize');

// Configura la conexión a SQL Server
const sequelize = new Sequelize(process.env.DB_DATABASE_APICRM, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, // Dirección del servidor
  dialect: 'mssql',  // Dialecto para SQL Server
  port: process.env.DB_PORT, 
  dialectModule: require('tedious'), // Usa tedious como cliente
  dialectOptions: {
    options:{
      multipleStatements: true,  // 👈 Esto permite múltiples SELECTs
      enableArithAbort: true,
      encrypt: false, // Desactivar el uso de TLS
      trustServerCertificate: true  // Aceptar cualquier certificado (solo si estás seguro de la seguridad)
    }
  },
  logging: true,    // Puedes desactivar el logging si no lo necesitas
});
sequelize.authenticate()
  .then(() => {
    console.log('Conexión exitosa');
  })
  .catch(err => {
    console.error('Error de conexión:', err);
  });
module.exports = sequelize;
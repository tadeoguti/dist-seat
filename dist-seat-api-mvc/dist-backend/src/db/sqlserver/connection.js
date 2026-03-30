const sql = require('mssql');

const dbSettings = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: false, // Uso local, si es producción true y certificados validos
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const poolPromise = new sql.ConnectionPool(dbSettings)
  .connect()
  .then(pool => {
    console.log('Conectado a SQL Server Exitosamente');
    return pool;
  })
  .catch(err => {
    console.error('Error creando conexión a base de datos de SQL Server: ', err);
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise
};

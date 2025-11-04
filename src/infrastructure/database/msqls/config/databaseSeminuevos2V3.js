require('dotenv').config();

module.exports = async () => {
  const sql = require('mssql');
  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_DATABASE_SEMINUEVOS2V3,
    port: parseInt(process.env.DB_PORT),
    options: {
      encrypt: false,
      enableArithAbort: true,
      trustServerCertificate: true,
    },
  };

 try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Conectado a la BD Seminuevos2V3');
    return pool;
  } catch (error) {
    console.error('❌ Error al conectar con la BD Seminuevos2V3:', error);
    throw error;
  }
};
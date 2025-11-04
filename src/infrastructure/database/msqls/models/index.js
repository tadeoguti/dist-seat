const sequelize = require('../config/database');
const MarcasKey = require('./MarcasKey');

const db = {
  MarcasKey,
  sequelize,
};

// Sincroniza las tablas con la base de datos
db.sequelize.sync({ force: false })  // `force: true` elimina y recrea las tablas cada vez que ejecutas
  .then(() => {
    console.log("Base de datos sincronizada");
  })
  .catch(err => console.log("Error sincronizando base de datos:", err));

module.exports = db;

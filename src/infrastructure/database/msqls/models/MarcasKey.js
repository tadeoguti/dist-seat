const { DataTypes } = require('sequelize');
const sequelize = require('../config/databaseAPICRM');

// Definir el modelo de MarcasKey
const MarcasKey = sequelize.define('MarcasKey', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,  // Esto hace que el id se incremente automáticamente
  },
  masID: {
    type: DataTypes.STRING,  // Asumí que es un campo de texto. Ajusta el tipo si es necesario.
    allowNull: true,  // Permite que sea nulo si es necesario
  },
  APIKey: {
    type: DataTypes.STRING,  // Asumí que es un campo de texto. Ajusta el tipo si es necesario.
    allowNull: false,  // Asumí que no puede ser nulo, puedes cambiarlo si es necesario
  },
  fecAlta: {
    type: DataTypes.DATE,  // Fecha en formato Date
    allowNull: true,  // Permite que sea nulo si es necesario
  },
  status: {
    type: DataTypes.STRING,  // Asumí que es un campo de texto, ajusta si es necesario
    allowNull: true,  // Permite que sea nulo si es necesario
  },
}, {
  tableName: 'MarcasKey',  // El nombre de la tabla en la base de datos
  timestamps: false,  // No usar columnas `createdAt` y `updatedAt` en la tabla
});

module.exports = MarcasKey;

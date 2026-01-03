const delay = require('../common/delay');
const fs = require('fs');

async function folders(dirPath) {
    try {
      await delay(2000);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Carpeta creada: ${dirPath}`);
      } else {
        console.log(`📂 Carpeta ya existente: ${dirPath}`);
      }
    } catch (error) {
      console.error("❌ Error al crear la carpeta:", error);
    }
  }

  module.exports = folders;
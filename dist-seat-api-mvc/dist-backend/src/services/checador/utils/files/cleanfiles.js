const fs = require("fs");
const path = require("path");

async function cleanfiles(dirPath, nameStartText, extensionText, limite) {
  try {
    if (!limite) limite = 5;
    console.log(
      "Validando el total de Archivos que no pasen del limite: ",
      limite,
    );
    const archivos = fs
      .readdirSync(dirPath)
      .filter(
        (name) =>
          name.startsWith(nameStartText) && name.endsWith(extensionText),
      )
      .map((name) => ({
        name,
        time: fs.statSync(path.join(dirPath, name)).mtime.getTime(),
      }))
      .sort((a, b) => a.time - b.time); // Ordena del más viejo al más nuevo

    console.log(`📁 Archivos encontrados: ${archivos.length}`);

    if (archivos.length > limite) {
      const toDelete = archivos.slice(0, archivos.length - limite);
      for (const file of toDelete) {
        const fullPath = path.join(dirPath, file.name);
        try {
          fs.unlinkSync(fullPath);
          console.log(`🗑️  -> Eliminado: ${file.name}`);
        } catch (error) {
          console.warn(`⚠️ No se pudo eliminar ${file.name}:`, err.message);
        }
      }
    } else {
      console.log("✅ No se requiere limpieza. Total dentro del límite.");
    }
  } catch (error) {
    console.log("Error al limpiar los archivos: ", error);
  }
}

module.exports = cleanfiles;

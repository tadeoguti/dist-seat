require('dotenv').config();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Crea una configuración de Multer reutilizable con validaciones
 *
 * @param {object} options - Opciones de configuración
 * @param {string} [options.destination="uploads/cv"] - Ruta de destino donde guardar los archivos (relativa al proyecto)
 * @param {function} [options.filename] - Función personalizada para nombrar archivos
 * @param {number} [options.maxFiles=1] - Número máximo de archivos permitidos
 * @param {number} [options.maxSize=5 * 1024 * 1024] - Tamaño máximo por archivo en bytes (default 5MB)
 * @param {string[]} [options.allowedMimeTypes] - Mime types permitidos (ej: ["application/pdf", "image/jpeg"])
 * @returns {multer} Configuración lista para usar
 */
function createMulterService(options = {}) {
  const {
    destination = path.join(process.env.FILE_UPLOAD_PATHBASE, process.env.FILE_UPLOAD_FOLDER),
    filename,
    maxFiles = process.env.FILE_UPLOAD_COUNT,
    maxSize = process.env.FILE_UPLOAD_MAXSIZE * 1024 * 1024, // 5MB
    allowedMimeTypes = [],
  } = options;

  const fullUploadPath = path.join(process.cwd(), destination);

  // Configuración del almacenamiento
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Crear carpeta si no existe
      if (!fs.existsSync(fullUploadPath)) {
        fs.mkdirSync(fullUploadPath, { recursive: true });
        //console.log("📁 Carpeta creada:", fullUploadPath);
      }

      // Verificar permisos
      try {
        fs.accessSync(fullUploadPath, fs.constants.W_OK);
        //console.log("✅ Permisos OK para escribir en:", fullUploadPath);
      } catch (err) {
        //console.error("❌ Sin permisos de escritura:", err.message);
      }

      cb(null, fullUploadPath);
    },

    filename: function (req, file, cb) {
      if (typeof filename === "function") {
        return filename(req, file, cb);
      }
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  // Configuración de validaciones
  const multerConfig = multer({
    storage,
    limits: {
      fileSize: maxSize, // tamaño máximo por archivo
    },
    fileFilter: function (req, file, cb) {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Tipo de archivo no permitido. Solo se permiten: ${allowedMimeTypes.join(
              ", "
            )}`
          ),
          false
        );
      }
    },
  });

  return multerConfig;
}

module.exports = { createMulterService };

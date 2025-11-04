const path = require("path");
const fs = require("fs");

class StorageRepository {
  constructor({ SftpService } = {}) {
    this.SftpService = SftpService; 
  }
  async saveFile(reqDto) {
    try {
      if (!reqDto.File) throw new Error("Archivo inválido");

      // Guardado local
      const localPath = path.join(process.cwd(), reqDto.File.destination, reqDto.File.originalname);

      if (!reqDto.IsRemote) {
        // Crear carpeta local si no existe
        if (!fs.existsSync(path.join(process.cwd(), reqDto.TargetDir))) {
          fs.mkdirSync(path.join(process.cwd(), reqDto.TargetDir), { recursive: true });
        }
        fs.renameSync(reqDto.File.path, localPath);
        return { success: true, filename: reqDto.File.originalname, path: localPath };
      }

      // Guardado remoto vía SFTP
      if (!this.SftpService) throw new Error("SftpService no está inyectado");
      await this.SftpService.mkdir(reqDto.TargetDir, true);
      await this.SftpService.upload(reqDto.File.path, path.posix.join(reqDto.TargetDir, reqDto.File.originalname));
      fs.unlinkSync(reqDto.File.path); // borrar temporal

      return { success: true, filename: reqDto.File.originalname, path: path.posix.join(reqDto.TargetDir, reqDto.File.originalname) };
    } catch (error) {
      console.error("Error al guardar el archivo:", error);
      throw new Error("Error al guardar el archivo");
    }
  }

  /*
  async saveFiles(reqDto) {
    if (!Array.isArray(files)) throw new Error("Se espera un array de archivos");
    const results = [];
    for (const reqDto.File of files) {
      results.push(await this.saveFile(reqDto.File, reqDto.TargetDir, reqDto.IsRemote));
    }
    return results;
  }
    */

  /*
  async deleteFile(reqDto) {
    try {
      if (!filename) throw new Error("Nombre de archivo inválido");

      const localPath = path.join(process.cwd(), reqDto.TargetDir, filename);

      // Eliminar local
      if (!reqDto.IsRemote && fs.existsSync(localPath)) fs.unlinkSync(localPath);

      // Eliminar remoto
      if (reqDto.IsRemote) {
        if (!this.SftpService) throw new Error("SftpService no está inyectado");
        const remotePath = path.posix.join(reqDto.TargetDir, filename);
        await this.SftpService.delete(remotePath);
      }

      return { success: true, filename };
    } catch (error) {
      console.error("Error al eliminar el archivo:", error);
      throw new Error("Error al eliminar el archivo");
    }
  }
    */

  /*
  getFilePath(reqDto) {
    return path.join(process.cwd(), reqDto.TargetDir, reqDto.File.filename);
  }
  */
}

module.exports = StorageRepository;

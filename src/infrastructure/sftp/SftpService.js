// services/SftpService.js
require("dotenv").config();
const SftpClient = require("ssh2-sftp-client");
const path = require("path");
const fs = require('fs');

class SftpService {
  constructor(sftpConfig = null) {
    this.sftp = new SftpClient();
    this.sftpConfig = {
      host: process.env.SFTP_HOST,
      port: 22,
      username: process.env.SFTP_USERNAME,
      privateKey: fs.readFileSync(path.join(process.cwd(), process.env.SFTP_KEY_PATH))
    };
  }

  async connect() {
    try {
      // Siempre intenta conectar si no está conectado
      if (!this.sftp._ready) {
        await this.sftp.connect(this.sftpConfig);
        this.sftp._ready = true;
      }
    } catch (err) {
      console.error("❌ Error al conectar al SFTP:", err.message);
      this.sftp._ready = false;
      throw err;
    }
  }

  async disconnect() {
    try {
      if (this.sftp._ready) {
        await this.sftp.end();
        this.sftp._ready = false;
      }
    } catch (err) {
      console.warn("⚠️ Error al cerrar conexión SFTP:", err.message);
    }
  }

  async upload(localPath, remotePath) {
    await this.connect();
    try {
      await this.sftp.put(localPath, remotePath);
    } catch (err) {
      console.error("❌ Error al subir archivo:", err.message);
      throw err;
    } finally {
      await this.disconnect();
    }
  } // sudo usermod -aG www-data wvuserapi

  async delete(remotePath) {
    await this.connect();
    try {
      if (await this.sftp.exists(remotePath)) {
        await this.sftp.delete(remotePath);
      }
    } catch (err) {
      console.error("❌ Error al eliminar archivo:", err.message);
      throw err;
    } finally {
      await this.disconnect();
    }
  }

  async exists(remotePath) {
    await this.connect();
    try {
      return await this.sftp.exists(remotePath);
    } catch (err) {
      console.error("❌ Error al verificar existencia:", err.message);
      throw err;
    } finally {
      await this.disconnect();
    }
  }

  async mkdir(remotePath, recursive = true) {
    await this.connect();
    try {
      const exists = await this.sftp.exists(remotePath);
      if (!exists) {
        await this.sftp.mkdir(remotePath, recursive);
      }
    } catch (err) {
      console.error("❌ Error al crear directorio:", err.message);
      throw err;
    } finally {
      await this.disconnect();
    }
  }
}

module.exports = SftpService;

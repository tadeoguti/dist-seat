class CreateRequestComRepository {
    constructor({DBPrincipal,Sql}) {
      this.DBPrincipal = DBPrincipal;
      this.Sql = Sql;
    }
    
    // * Listo
    async createRequestCom(ReqDto) {
      try {
      const result = await this.DBPrincipal.request()
        // OUTPUTS
        .output("solicitudID", this.Sql.Int)
        .output("consecutivoDisID", this.Sql.Int)
        .output("AsesorNomSalida", this.Sql.VarChar)
        .output("AsesorIDSalida", this.Sql.Int)
        .output("AsesorEmailSalida", this.Sql.VarChar)

        // Cliente
        .input("clienteID", this.Sql.Int, ReqDto.ClienteId)
        .input("disID", this.Sql.Int, ReqDto.DisID)
        .input("tipoSolicitud", this.Sql.VarChar, ReqDto.TipoSolicitud)
        .input("comentarios", this.Sql.VarChar, ReqDto.Comentarios)
        .input("origen", this.Sql.VarChar, ReqDto.Origen)
        .input("status", this.Sql.VarChar, ReqDto.Estatus)
        .input("TipoServ", this.Sql.VarChar, ReqDto.TipoServ)
        .input("tipoCom", this.Sql.VarChar, ReqDto.TipoComentario)
        .input("enviar", this.Sql.VarChar, ReqDto.DirigidoA)

        // Seguimiento
        .input("strTcoID", this.Sql.VarChar, ReqDto.TcoID)
        .input("comentario", this.Sql.VarChar, ReqDto.Comentarios)
        .input("emailAse", this.Sql.VarChar, ReqDto.EmailAsesor)
        .input("usrIDAsigna", this.Sql.Int, ReqDto.UserIdAsigna)
        .input("usrIDAsignado", this.Sql.Int, ReqDto.UserIdAsignado)
        .input("tipoSeg", this.Sql.VarChar, ReqDto.TipoSeguimiento)
        .input("enviaCorrreo", this.Sql.Bit, ReqDto.EnviarCorreo)
        .input("origenSO", this.Sql.VarChar, ReqDto.OrigenSO)
        .input("dispositivo", this.Sql.VarChar, ReqDto.Dispositivo)
        .input("ip", this.Sql.VarChar, ReqDto.IpClient)

        .execute("proInsertaDatosComentarios");

      const solicitudID = result.output.solicitudID || 0;
      const consecutivoDisID = result.output.consecutivoDisID || 0;
      const asesorNombre = result.output.AsesorNomSalida || "Asesor Disponible";
      const asesorID = result.output.AsesorIDSalida || 0;

      return {
        isSuccess: true,
        data: {
          SolicitudId: solicitudID,
          ConsecutivoDisId: consecutivoDisID,
          AsesorNombreSalida: asesorNombre,
          AsesorId: asesorID
        }
      };
      } catch (error) {
        throw {
          isSuccess: false,
          message: `Error en InsertaSolicitudCOM: ${error.message}`,
          statusCode: 500
        };
      }
    }


  }
  
module.exports = CreateRequestComRepository;
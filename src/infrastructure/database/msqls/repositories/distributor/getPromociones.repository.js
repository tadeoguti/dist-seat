class GetPromotionsRepository {
    constructor({DBPrincipal,Sql}) {
      this.DBPrincipal = DBPrincipal;
      this.Sql = Sql;
    }
    
    // * Listo
    async getPromotions(ReqDto) {
      const storedProcedure = ReqDto.IsCommercial
      ? "proConsultaPromocionesComercialesPorId"
      : "proConsultaPromocionesPorIdV6";

      try {
        const result = await this.DBPrincipal.request()
          .input("disID", this.Sql.VarChar, String(ReqDto.DisID))
          .input("idPro", this.Sql.Int, String(ReqDto.IdPro))
         //.input("activo", this.Sql., parsaInt(ReqDto.Activo))
          .execute(storedProcedure);

        const promociones = result.recordset.map(row => ({
          IdPro: parseInt(row.idPro),
          IdRPro: parseInt(row.idRPro),
          Nombre: row.nombre || "",
          Modelo: row.Modelo || "",
          Anio: row.Anio || "",
          Clavegen: row.xsID || "",
          Titulo: row.titulo || "",
          Subtitulo: row.subtitulo || "",
          Descripcion: row.descripcion || "",
          Legales: row.legales || "",
          Corporativa: row.corporativa || "",
          ImgPromos: row.imgPromos || "",
          ImgPromosMov: row.imgPromosMov || "",
          Orden: row.orden || "",
          FechaVigencia: row.fechaVigencia || ""
        }));

        return {
          isSuccess: true,
          data: promociones
        };

      } catch (error) {
        throw {
          isSuccess: false,
          message: `Error al cargar promociones para distribuidor ${DisID}. Detalles: ${error.message}`,
          statusCode: 500
        };
      }
    }
    
  }
  
module.exports = GetPromotionsRepository;
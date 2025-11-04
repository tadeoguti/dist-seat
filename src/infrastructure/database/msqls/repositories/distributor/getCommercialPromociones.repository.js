class GetCommercialPromotionsRepository {
  constructor({DBPrincipal,Sql}) {
    this.DBPrincipal = DBPrincipal;
    this.Sql = Sql;
  }
  
  // * Listo
  async getCommercialPromotions(ReqDto) {
    try {
      // seleccionamos el SP según si es comercial o no
      let storedProcedure = 'proConsultaPromocionesPorIdV6';
      if (ReqDto.EsComercial) {
        storedProcedure = 'proConsultaPromocionesComercialesPorId';
      }

      // ejecutamos el SP
      const result = await this.DBPrincipal.request()
        .input("disID", this.Sql.Int, parseInt(ReqDto.DisID))
        .execute(storedProcedure);

      const promociones = (result.recordset || []).map(row => ({
        IdPro: row.idPro,
        IdRPro: row.idRPro,
        Nombre: row.nombre,
        Modelo: row.Modelo,
        Anio: row.Anio,
        Clavegen: row.xsID,
        Titulo: row.titulo,
        Subtitulo: row.subtitulo,
        Descripcion: row.descripcion,
        Legales: row.legales,
        Corporativa: row.corporativa,
        ImgPromos: row.imgPromos,
        ImgPromosMov: row.imgPromosMov,
        Orden: row.orden,
        FechaVigencia: row.fechaVigencia
      }));

      return {
        success: true,
        data: promociones
      };
    } catch (error) {
      console.error('Error en getCommercialPromotions:', error.message, error.stack);
      return {
        success: false,
        message: 'Error al obtener promociones Comerciales.',
        error: error.message
      };
    }
  }
  
}
  
module.exports = GetCommercialPromotionsRepository;
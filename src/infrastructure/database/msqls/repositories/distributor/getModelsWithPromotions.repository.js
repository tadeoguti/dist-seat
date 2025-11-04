class GetModelsWithPromotionsRepository {
    constructor({DBPrincipal,Sql}) {
      this.DBPrincipal = DBPrincipal;
      this.Sql = Sql;
    }
    
    // * Listo
    async getModelsWithPromotions(ReqDto) {
      try {
        const result = await this.DBPrincipal.request()
          .input("disID", this.Sql.Int, parseInt(ReqDto.DisID))
          .execute("proConsultaPromocionesModelos");

        const modelos = result.recordset.map(row => ({
          XsID: row.xsID || "",
          Modelo: row.modelojato || ""
        }));

        return {
          isSuccess: true,
          data: modelos
        };

      } catch (error) {
        throw {
          isSuccess: false,
          message: `Error al cargar modelos con promoción para disID ${disID}. | ${error.message}`,
          statusCode: 500
        };
      }
    }
    
  }
  
module.exports = GetModelsWithPromotionsRepository;
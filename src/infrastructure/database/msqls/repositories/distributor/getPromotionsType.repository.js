class GetPromotionsTypeRepository {
    constructor({DBPrincipal,Sql}) {
      this.DBPrincipal = DBPrincipal;
      this.Sql = Sql;
    }
    
    // * Listo
    async getPromotionsType(ReqDto) {
      try {
        const result = await this.DBPrincipal.request()
          .input("disID", this.Sql.Int, parseInt(ReqDto.DisID))
          .execute("proConsultaTipoPromociones");

        const tipos = result.recordset.map(row => ({
          IdPro: parseInt(row.idPro),
          Nombre: row.nombre || ""
        }));

        return {
          isSuccess: true,
          data: tipos
        };

      } catch (error) {
        throw {
          isSuccess: false,
          message: `Error al cargar tipos de promociones para disID ${disID}. Detalles: ${error.message}`,
          statusCode: 500
        };
      }
    }
    
  }
  
module.exports = GetPromotionsTypeRepository;
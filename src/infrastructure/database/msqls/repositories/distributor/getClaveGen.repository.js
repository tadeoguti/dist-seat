class GetClaveGenRepository {
    constructor({DBPreciosV3,Sql}) {
      this.DBPreciosV3 = DBPreciosV3;
      this.Sql = Sql;
    }
    
    // * Listo
    async getClaveGen(ReqDto) {
    try {
      const model = ReqDto.Model || "";
      const year = ReqDto.Year || "";

      if (model !== "" && year !== "") {
        const result = await this.DBPreciosV3.request()
          .input("modelo", this.Sql.VarChar, model)
          .input("anio", this.Sql.Int, parseInt(year))
          .execute("proConsultaClaveGen");

        const claveGen = result.recordset.length > 0 ? result.recordset[0].xsID || "" : "";

        return {
          isSuccess: true,
          data: { ClaveGen: claveGen }
        };
      }
    } catch (error) {
      throw {
        isSuccess: false,
        message: `Error en GetClaveGen: ${error.message}`,
        statusCode: 500
      };
    }
  }
    
  }
  
module.exports = GetClaveGenRepository;
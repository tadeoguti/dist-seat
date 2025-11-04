const MarcasKey = require("../../models/MarcasKey");
class AuthRepository {
    constructor({DBDistribuidoresV3}) {
      this.DBDistribuidoresV3 = DBDistribuidoresV3;
    }

    async getToken(resTokenDto) {
      try {
        const marcasKeyFormated = await MarcasKey.findOne({ where: { 
            masID : resTokenDto.MasID,
            APIKey: resTokenDto.ApiKey
          }
        });
        return (marcasKeyFormated)?marcasKeyFormated.get({ raw: true }):null;
      } catch (error) {
        //console.error(`Error Generico al obtener los datos en el auth repository del token:`, error);
        //console.log("file:auth.repository, funt:getToken, line:9");
        throw {isSuccess: false, message: 'Error Generico al obtener los datos en el auth repository del token. Error: | '+error+'|',statusCode: 404 };
      }
    }

    async loadInfoDistributorPayload(resTokenDto) {
      try {
        const result = await this.DBDistribuidoresV3.request()
        .input('URL', sql.VarChar, reqDistributorDto.Url)
        .input('masID', sql.Int, reqDistributorDto.MasID)
        .execute('dbo.proConsultaDatosDistribuidorV6');

        const data = result.recordsets[0];
        
        return (data)?data:null;
      } catch (error) {
        throw {isSuccess: false, message: 'Error Generico al obtener los datos en el repository. Error: | '+error+'|',statusCode: 404 };
      }
    }

    async getUser(id) {
      return await MarcasKey.findAll();
    }
    
    async createUser(catMarcasKey) {
      return MarcasKey.findAll();
    }
    
  }
  
  module.exports = AuthRepository;
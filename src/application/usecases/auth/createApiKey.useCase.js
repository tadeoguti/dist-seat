const CatMarcasKey = require("../../../domain/entities/catMarcaKey");
class CreateApiKeyUseCase {
    constructor({ AuthRepository }) {
      this.AuthRepository = AuthRepository;
    }
  
    execute(reqRegisterUserOrApiKeyDto) {
    const catMarcasKey = new CatMarcasKey();
    catMarcasKey.masID = reqRegisterUserOrApiKeyDto.MasID;
    catMarcasKey.APIKey = "ui90efjerf034093jfoi3jef034fj304";
    catMarcasKey.fecAlta = new Date();
    catMarcasKey.status = true;


    return this.AuthRepository.createUser(catMarcasKey);
    }
  
  }
  
  module.exports = CreateApiKeyUseCase;
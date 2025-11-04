require("dotenv").config();
const { generateApiKey, generateAccessTokenOrRefreshToken } = require("../../../infrastructure/tools/generateToken");

class AuthApplicationController {
  constructor({
    LoginApiKeyUseCase,
    LoadInfoDistributorPayloadUseCase
  }) {
    this.LoginApiKeyUseCase = LoginApiKeyUseCase;
    this.LoadInfoDistributorPayloadUseCase = LoadInfoDistributorPayloadUseCase;
    
  }

  async createToken(resTokenDto) {
    
    let result = {
      isSuccess: false,
      message: 'Error Generico no controlado.',
      statusCode: 500
    };  

    let userAuthExists;
    let distribuidorPayloadSetData;
    await this.LoginApiKeyUseCase.execute(resTokenDto).then(data =>{
      userAuthExists = data;
    });
    
    if (userAuthExists == null || userAuthExists == undefined) {
        result.message = 'ApiKey o masID no encontrado.';
        result.data = {msg:result.message};
        result.statusCode = 404;
        return result;
    }

    if(userAuthExists.statusCode==404){
      return userAuthExists;
    }

    try {
        //if (bcrypt.compare(user.password, userExists.password)) {
            
            // Consultar los datos del distribuidor para el payload
            await this.LoadInfoDistributorPayloadUseCase.execute(resTokenDto).then(data =>{
              distribuidorPayloadSetData = data;
            });
            // guardar refresh token en la base de datos o en una cookie segura
            // llenar datos para el payload ejemplo consultar datos de distribuidora
            let payload = {
                username: resTokenDto.ApiKey,
                masID:resTokenDto.MasID,
                marID:distribuidorPayloadSetData.MarID,
                disID:distribuidorPayloadSetData.DisID,
                url: distribuidorPayloadSetData.Url,
                masID2: distribuidorPayloadSetData.MasID2,
                masNombre: distribuidorPayloadSetData.MasNombre,
                marca:"VOLKSWAGEN" // CAMBIAR
                
            }
            const accessToken = generateAccessTokenOrRefreshToken(payload,process.env.SECRETKEYTIMELIFE,process.env.SECRETKEY);
            const refreshAccessToken = generateAccessTokenOrRefreshToken(payload,process.env.REFRESHSECRETKEYTIMELIFE,process.env.REFRESHSECRETKEY);
            result.isSuccess = true;
            result.message = 'Token Generado con exito.';
            result.data = {
                accessToken:accessToken,
                refreshAccessToken:refreshAccessToken
            };
            result.statusCode = 200;

        /*} else {
            result.message = 'Contraseña incorrecta';
            result.data = user;
            result.statusCode = 403;
        }*/
    } catch(error) {
        console.log("Error detectado:", error);
        result.message = 'Error detectado: '+error;
        result.data = {};
        result.statusCode = 500;
    }
    return result;
      
  }
  /*
  createUser(reqRegisterUserOrApiKeyDto){
    let result = {
      isSuccess: false,
      message: 'Usuario registrado correctamente',
      statusCode: 500
    };

    try {
      const user = this.CreateUserUseCase.execute(reqRegisterUserOrApiKeyDto);
      result.isSuccess = true;
      result.message = 'Usuario registrado correctamente';
      result.data = user;
      result.statusCode = 201;
      
    } catch (error) {
      result.message = 'Error al registrar usuario';
      result.data = reqRegisterUserOrApiKeyDto;
      result.statusCode = 500;
    }
  }
    */
}

module.exports = AuthApplicationController;

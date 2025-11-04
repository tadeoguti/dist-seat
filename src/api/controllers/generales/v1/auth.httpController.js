require('dotenv').config();
const ReqTokenDto = require("../../../../application/dtos/Auth/reqToken.dto");
const ReqRegisterUserOrApiKeyDto = require("../../../../application/dtos/reqRegisterUserOrApiKey.dto");
class AuthHttpController {
    constructor({ AuthApplicationController }) {
      this.AuthApplicationController = AuthApplicationController;
    }

    async createToken(req, res) {
        try {

            const reqTokenDto = new ReqTokenDto({
                MasID: req.body.MasID,
                ApiKey: req.body.ApiKey,
                Url: req.body.Url
            });
            
            const token = await this.AuthApplicationController.createToken(reqTokenDto);
            if (!token) {
                return res.status(404).json({ message: "Token no encontrado" });
            }
            res.status(200).json(token.data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
   
    
    
    
}
    
module.exports = AuthHttpController;

 
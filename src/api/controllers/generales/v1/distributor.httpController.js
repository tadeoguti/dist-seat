require('dotenv').config();
const ReqObjDto = require("../../../../application/dtos/Distribuitor/reqDistributor.dto");
const { getDataPayload } = require("../../../tools/PayloadData");
//const ReqRegisterUserOrApiKeyDto = require("../../../../application/dtos/reqRegisterUserOrApiKey.dto");
class DistributorHttpController {
    constructor({ DistributorApplicationControllers }) {
      this.DistributorApplicationControllers = DistributorApplicationControllers;
    }
    
    // * Listo
    async GetDistribuidor(req, res) {
        try {
            // Paso 1: Llenar el objeto DTO con los datos del req.user que se agregaron del Payload
            const reqDto = getDataPayload(new ReqObjDto(), req);

            // Paso 2: Agregar o validar datos del req.body y agregarlo al objeto DTO antes de mandarlo al Orquestado o Casos de usos

            // Paso 3: Llamar al Orquestador de los casos de usos(controlador de casos de usos)
            const data = await this.DistributorApplicationControllers.getDistributor(reqDto);


            // Paso 4: validar si data viene vacio retornar un error generico (se tiene que mejorar esta validación)
            if (!data) {
                return res.status(404).json({ message: "Distribuidores no encontrado." });
            }

            // Paso 5: Regresar los datos con la respuesta Http
            return res.status(data.statusCode).json(data);

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    // * Listo
    async GetDistributorByUrl(req, res) {
        try {
            // Paso 1: Llenar el objeto DTO con los datos del req.user que se agregaron del Payload
            const reqDto = getDataPayload(new ReqObjDto(), req);

            // Paso 2: Agregar o validar datos del req.body y agregarlo al objeto DTO antes de mandarlo al Orquestado o Casos de usos
            reqDto.showAllData = (req.query.showAllData || req.query.showAllData == "1" || req.query.showAllData == '1' || req.query.showAllData == "true" )? true : false;

            // Paso 3: Llamar al Orquestador de los casos de usos(controlador de casos de usos)
            const data = await this.DistributorApplicationControllers.getDistributorByUrl(reqDto);


            // Paso 4: validar si data viene vacio retornar un error generico (se tiene que mejorar esta validación)
            if (!data) {
                return res.status(404).json({ message: "Distribuidores no encontrado." });
            }

            // Paso 5: Regresar los datos con la respuesta Http
            return res.status(data.statusCode).json(data);

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    // ? Trabajando
    async ExecChecador(req, res) {
        try {
            // Paso 1: Llenar el objeto DTO con los datos del req.user que se agregaron del Payload
            const reqDto = getDataPayload(new ReqObjDto(), req);

            // Paso 2: Agregar o validar datos del req.body y agregarlo al objeto DTO antes de mandarlo al Orquestado o Casos de usos
            reqDto.Distribuidoras   = req.query.Distribuidoras || "";
            // reqDto.Year     = req.query.Year || 0 ;
            reqDto.FormatedDistribuidoras = reqDto.Distribuidoras.split(',');
            // Paso 3: Llamar al Orquestador de los casos de usos(controlador de casos de usos)
            const data = await this.DistributorApplicationControllers.execChecador(reqDto);


            // Paso 4: validar si data viene vacio retornar un error generico (se tiene que mejorar esta validación)
            if (!data) {
                return res.status(404).json({ message: "ClaveGen no encontrado." });
            }

            // Paso 5: Regresar los datos con la respuesta Http
            return res.status(data.statusCode).json(data);

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    

    
    
}
    
module.exports = DistributorHttpController;

 
require("dotenv").config();

class DistributorsApplicationController{
    constructor({
        GetDistribuidorUseCase,
        GetDistributorByUrlUseCase,
        ExecChecadorUseCase
    }){
        this.GetDistribuidorUseCase = GetDistribuidorUseCase;
        this.GetDistributorByUrlUseCase = GetDistributorByUrlUseCase;
        this.ExecChecadorUseCase = ExecChecadorUseCase;
    }

    // * Listo
    async getDistributor(reqDto){

        // Paso 1: Inicializar el response con valores default para regresarlos al Controlador HTTP
        let result = {
            isSuccess: false,
            message: 'Error Generico no controlado.',
            statusCode: 500
        };  
        
        // Paso 2: Aplicar reglas de la Aplicacion y llamar casos de usos necesarios
        let dataResult;
        await this.GetDistribuidorUseCase.execute(reqDto).then(data =>{
            dataResult = data;
        });
        
        // Paso 3: Validar la respuesta obtenidos de los casos de usos
        if (dataResult == null || dataResult == undefined) {
            result.message = 'ApiKey o masID no encontrado.';
            result.data = {msg:result.message};
            result.statusCode = 404;
            return result;
        }

        // Paso 4: Regresar los resultados al controlador HTTP
        result.message = 'Busqueda de distribuidor con exito.';
        result.data = dataResult;
        result.statusCode = 200;

        return result;
    }

    // * Listo
    async getDistributorByUrl(reqDto){

        // Paso 1: Inicializar el response con valores default para regresarlos al Controlador HTTP
        let result = {
            isSuccess: false,
            message: 'Error Generico no controlado.',
            statusCode: 500
        };  
        
        // Paso 2: Aplicar reglas de la Aplicacion y llamar casos de usos necesarios
        let dataResult = await this.GetDistributorByUrlUseCase.execute(reqDto);
        
        // Paso 3: Validar la respuesta obtenidos de los casos de usos
        if (dataResult == null || dataResult == undefined) {
            result.message = 'ApiKey o masID no encontrado.';
            result.data = {msg:result.message};
            result.statusCode = 404;
            return result;
        }

        // Paso 4: Regresar los resultados al controlador HTTP
        result.message = 'Busqueda de distribuidores con exito.';
        result.data = dataResult.data;
        result.isSuccess = true;
        result.statusCode = 200;

        return result;
    }

    // ? Trabajando
    async execChecador(reqDto){

        // Paso 1: Inicializar el response con valores default para regresarlos al Controlador HTTP
        let result = {
            isSuccess: false,
            message: 'Error Generico no controlado.',
            statusCode: 500
        };  
        
        // Paso 2: Aplicar reglas de la Aplicacion y llamar casos de usos necesarios
        let dataResult = await this.ExecChecadorUseCase.execute(reqDto);
        
        // Paso 3: Validar la respuesta obtenidos de los casos de usos
        if (dataResult == null || dataResult == undefined) {
            result.message = 'ApiKey o masID no encontrado.';
            result.data = {msg:result.message};
            result.statusCode = 404;
            return result;
        }

        // Paso 4: Regresar los resultados al controlador HTTP
        result.message = 'Busqueda de distribuidores con exito.';
        result.data = dataResult.data;
        result.isSuccess = true;
        result.statusCode = 200;

        return result;
    }

}

module.exports = DistributorsApplicationController;
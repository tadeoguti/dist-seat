require("dotenv").config();
const express = require('express'); 
const cors = require('cors'); 
const { createContainer, asClass, asFunction, asValue,Lifetime } = require("awilix");
//Importar conction
const getDBPrincipal = require("./infrastructure/database/msqls/config/dabasepPrincipal");
const getDBDistribuidoresV3 = require("./infrastructure/database/msqls/config/dabaseDistribuidoresV3");
const getDBPreciosV3 = require("./infrastructure/database/msqls/config/databasePreciosV3");
const getDBHits = require("./infrastructure/database/msqls/config/databaseHits");
const getDBSeminuevos2V3 = require("./infrastructure/database/msqls/config/databaseSeminuevos2V3");
//const swaggerUi = require('swagger-ui-express');
//const swaggerFile = require('../swagger-output.json');
//const swaggerFilev2 = require('../swagger-outputv2.json');

const debugMode = (process.env.DEBUG.toLowerCase().replace(/\s+/g, '') === 'true' || process.env.DEBUG.toLowerCase().replace(/\s+/g, '')==='1')?true:false;
(async () => {
  const dbPrincipal = await getDBPrincipal();
  const dbDistribuidoresV3 = await getDBDistribuidoresV3();
  const dbPreciosV3 = await getDBPreciosV3();
  const dbHits = await getDBHits();
  const dbSeminuevos2V3 = await getDBSeminuevos2V3();

  // Registrar dependencias
  const container = createContainer();
  container.register({
    // Alcens disponibles scoped, singleton y transient
    //Mode Aplication
    IsDebug: asValue(debugMode),

    // Conection to Databases
    //authenticateToken: asFunction(require('./api/middlewares/auth.middlewares').authenticateToken).singleton(),
    Sql: asValue(require('mssql')),
    DBPrincipal: asValue(dbPrincipal),
    DBDistribuidoresV3: asValue(dbDistribuidoresV3),
    DBPreciosV3: asValue(dbPreciosV3),
    DBHits: asValue(dbHits),
    DBSeminuevos2V3: asValue(dbSeminuevos2V3),

    // Middlewares
    //authenticateToken: asFunction(require('./api/middlewares/auth.middlewares').authenticateToken).singleton(),
    Sanitizer: asClass(require("./infrastructure/sanitizers/validatorXssSanitizer")).singleton(),
   // MulterConfig: asClass(require("./infrastructure/upload/multerConfig")).singleton(),

    // Registrar el HttpController (manejo de HTTP)
    AuthHttpController:asClass(require("./api/controllers/generales/v1/auth.httpController")).transient(),
    DistributorHttpController:asClass(require("./api/controllers/generales/v1/distributor.httpController")).transient(),
   
    // Register Controller Uses Case(Orquestador)
    AuthApplicationController:asClass(require("./application/controllers/authentication/auth.applicationController")).scoped(),
    DistributorApplicationControllers:asClass(require("./application/controllers/distributors/distributors.applicationController")).scoped(),
    

    // Registers Uses Cases
    LoginApiKeyUseCase:asClass(require("./application/usecases/auth/loginApiKey.useCase")).scoped(),
    GetDistribuidorUseCase:asClass(require("./application/usecases/distributor/getDistributor.useCase")).scoped(),
    LoadInfoDistributorPayloadUseCase:asClass(require("./application/usecases/distributor/loadInfoDistributorPayload.useCase")).scoped(),
    GetDistributorByUrlUseCase:asClass(require("./application/usecases/distributor/getDistributorByUrl.useCase")).scoped(),
    GetClaveGenUseCase:asClass(require("./application/usecases/distributor/getClaveGen.useCase")).scoped(),
    ExecChecadorUseCase:asClass(require("./application/usecases/distributor/execChecador.useCase")).scoped(),

    // Register Repositories
    AuthRepository:asClass(require("./infrastructure/database/msqls/repositories/auth/auth.repository")).singleton(),
    DistributorRepository:asClass(require("./infrastructure/database/msqls/repositories/distributor/distributor.repository")).singleton(),
    
    // Services
    SendToCustomer:asClass(require("./infrastructure/Email/sendToCustomer")).singleton(),
    Storage:asClass(require("./infrastructure/upload/storageRepository")).singleton(),
    SftpService: asClass(require("./infrastructure/sftp/SftpService")).singleton(),
    Checador: asFunction(require('./infrastructure/checador/ejecutores/seat-LotesSitemap-Puppeter')).singleton(),


    // Registrar funciones
     CryptoService: asFunction(require('./infrastructure/crypto/crypto')).singleton()
  });

  
  // Crear aplicación Express 
  const app = express(); 

  // Middleware para habilitar CORS 
  app.use(cors()); 
  
  // app.use('/api/v1/jobExchange', require('./api/routes/generales/v1/jobExchange.route')(container));
  // Middleware para parsear JSON 
  app.use(express.json()); 

  // Para datos x-www-form-urlencoded
  app.use(express.urlencoded({ extended: true }));

  // Middleware para capturar errores de JSON inválido
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({ error: 'JSON inválido. Revisa la sintaxis.' });
    }
    next();
  });

  // Registrar las rutas V1
  app.use('/api/v1/auth', require('./api/routes/generales/v1/auth.route')(container.cradle));
  app.use('/api/v1/distributor', require('./api/routes/generales/v1/distributor.route')(container.cradle));
  //app.use('/api/v1/test', require('./routes/V1/testRoutes'));

  // Registrar las rutas V2
  //app.use('/api/v2',  require('./routes/V2/testRoutes'));

  /*
  // Configuración de Swagger
  // 📌 Configuración Swagger con múltiples servidores
  const options = {
      explorer: true,
      swaggerOptions: {
          url: "./swagger-output.json", // Asegura que Swagger lea bien el JSON
          displayRequestDuration: true, // Muestra el tiempo de respuesta
      },
  };

  // Documentación Swagger
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile, options));
  // Iniciar el servidor

  */

  app.get('/', (req, res) => {
    res.send('API corriendo correctamente 🚀');
  });

  // Middleware para manejar errores 404
  app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
  });

  // Middleware para manejar errores 500
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  });
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
})();
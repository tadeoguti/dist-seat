require("dotenv").config();
const swaggerAutogen = require('swagger-autogen')({openapi: '3.1.0'});

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/index.js'];


const config = {
  info: {
    title: 'Api Node + Express',
    description: 'Documentación de la API',
    version: '1.0.0',
  },
  host: process.env.HOST,
  basePath: '/',
  // servers: [
  //   { url: "https://lmidominio.com", description: "" },
  //   { url: "https://localhost:5000", description: "" },
  // ],
  schemes: ['http','https'],
  openapi: '3.0.0' // Usar OpenAPI 3.0 para mejor soporte de tags
  
};

swaggerAutogen(outputFile, endpointsFiles, config);
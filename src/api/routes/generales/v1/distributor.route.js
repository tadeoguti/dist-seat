require('dotenv').config();
const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../../../middlewares/auth.middlewares");
const sanitizeBodyRequest = require("../../../middlewares/sanitize.middlewares");

module.exports = ({ DistributorHttpController, Sanitizer }) => {

    // Endpoints Simples
    router.get('/',authenticateToken,sanitizeBodyRequest(Sanitizer), DistributorHttpController.GetDistribuidor.bind(DistributorHttpController));
    router.get('/byUrl',authenticateToken,sanitizeBodyRequest(Sanitizer), DistributorHttpController.GetDistributorByUrl.bind(DistributorHttpController));
    router.get('/checador',authenticateToken,sanitizeBodyRequest(Sanitizer), DistributorHttpController.ExecChecador.bind(DistributorHttpController));

    // Endpoints Compuestos


    return router;
};
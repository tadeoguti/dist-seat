require('dotenv').config();
const express = require('express');
const router = express.Router();

module.exports = ({ AuthHttpController }) => {

    router.post('/token', AuthHttpController.createToken.bind(AuthHttpController));

    //router.post('/tokenApikey', AuthHttpController.createtokenApikey.bind(AuthHttpController));
    
    //router.post('/refreshToken', AuthHttpController.refreshToken.bind(AuthHttpController));

    //router.post('/createApikey', AuthHttpController.createApikey.bind(AuthHttpController));

    //router.post('/createUser', AuthHttpController.createUser.bind(AuthHttpController));
    

    return router;
};

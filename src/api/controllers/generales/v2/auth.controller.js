require('dotenv').config();
//const authService = require('../services/authServices');

const registerUser = async (req, res)=>{
    const user = { username, password } = req.body;
    //const result = await authService.registerUser(user);
    const result = {"name":"jesus"};

    // if (result.isSuccess) {
    if (true) {
        res.status(201).json(result);
    } else {
        res.status(409).json(result);
    }
}
module.exports = {
    registerUser
}
/*
const registerApiKey = async (req, res)=>{
    const dataApikey = { apikey } = req.body;
    const result = await authService.registerApiKey(dataApikey);


    if (result.isSuccess) {
        res.status(201).json(result);
    } else {
        res.status(409).json(result);
    }
}

const login = async (req, res) => {

    const user = { username, password } = req.body;
    const result = await authService.login(user);
    if (result.isSuccess) {
        res.status(result.statusCode).json({accessToken:result.data.accessToken, refreshToken:result.data.refreshAccessToken});
    } else {
        res.status(result.statusCode).json(result);
    }
    
}

const loginApiKey = async (req, res) => {

    const data = { apikey } = req.body;
    const result = await authService.loginApiKey(data);
    if (result.isSuccess) {
        res.status(result.statusCode).json({accessToken:result.data.accessToken, refreshToken:result.data.refreshAccessToken});
    } else {
        res.status(result.statusCode).json(result);
    }
    
}

const refreshAccessToken = async (req, res) => {
    const { userId, refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Refresh Token requerido" });
    
    const result = await authService.refreshAccessToken(refreshToken);
    console.log(result);
    if (result.isSuccess) {
        res.status(result.statusCode).json({accessToken:result.data});
    } else {
        res.status(result.statusCode).json(result);
    }
}

module.exports = {
    registerUser,
    registerApiKey,
    login,
    loginApiKey,
    refreshAccessToken
}
    */
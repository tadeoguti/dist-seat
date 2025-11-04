const jwt = require("jsonwebtoken");

function generateAccessTokenOrRefreshToken(payload, expiresIn, secretKey) {
    return jwt.sign(payload, secretKey, { expiresIn: expiresIn });
}

function generateApiKey(seed) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let hash = 0;
    
    // Generar un número basado en la cadena de entrada
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0; // Convertir a entero de 32 bits
    }
    
    let apiKey = '';
    let sections = [8, 4, 4, 4, 12]; // Formato de la API Key
    let sectionIndex = 0, count = 0;
    
    while (apiKey.length < 36) {
        hash = (hash * 31 + 17) & 0xffffffff; // Transformar el hash
        let char = chars[Math.abs(hash) % chars.length];
        apiKey += char;
        count++;

        // Agregar guiones en las posiciones adecuadas
        if (count === sections[sectionIndex]) {
            if (apiKey.length < 35) apiKey += '-';
            sectionIndex++;
            count = 0;
        }
    }
    
    return apiKey;
}

module.exports =  {
        generateAccessTokenOrRefreshToken,
        generateApiKey
    };
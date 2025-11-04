const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const encrypt = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}
const decrypt = async (password, hash) => {
    return await jwt.decode(token);
}

module.exports = {
    encrypt,
    decrypt
}
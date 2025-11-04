const crypto = require("crypto");
const querystring = require("querystring");

function createCryptoService() {
  const securityKey = "#$634ilnv1!099";

  function encriptarSolID(solID) {
    const textBytes = Buffer.from(solID.toString(), "utf8");
    const key = getTripleDesKey("#$634ilnv1!099");
    const cipher = crypto.createCipheriv("des-ede3", key, null);
    cipher.setAutoPadding(true);

    const encrypted = Buffer.concat([cipher.update(textBytes), cipher.final()]);
    const base64Encrypted = encrypted.toString("base64");

    // Original
    //return querystring.escape(base64Encrypted);

    // Adaptado
    return base64Encrypted;
  }

  function getTripleDesKey(keyStr) {
    const md5Hash = crypto.createHash("md5").update(keyStr).digest(); // 16 bytes
    // Expandimos a 24 bytes (Triple DES necesita 24)
    return Buffer.concat([md5Hash, md5Hash.slice(0, 8)]); // 16 + 8 = 24
  }

  return {
    encriptarSolID,
  };
}

module.exports = createCryptoService;

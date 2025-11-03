// src/validarCertificadoSSL.js
const https = require("https");
const { URL } = require("url");

/**
 * Valida el certificado SSL de un sitio y devuelve info completa
 * @param {string} siteUrl - URL del sitio a verificar
 * @returns {Promise<{sslStatus: string, cn: string, san: string[], validForHost: boolean, validFrom: string, validTo: string, issuer: string}>}
 */
async function validarCertificadoSSL(siteUrl) {
    let result = {
        sslStatus: "Desconocido",
        cn: "",
        san: [],
        validForHost: false,
        validFrom: "",
        validTo: "",
        issuer: "",
    };

    try {
        const { hostname, port } = new URL(siteUrl);

        const options = {
            host: hostname,
            port: port || 443,
            method: "GET",
            rejectUnauthorized: false, // No bloquea por cert inválido
        };

        await new Promise((resolve) => {
            const req = https.request(options, (res) => {
                const cert = res.socket.getPeerCertificate();

                if (!cert || Object.keys(cert).length === 0) {
                    result.sslStatus = "❌ No se pudo obtener certificado";
                    resolve();
                    return;
                }

                result.cn = cert.subject.CN || "";
                result.san = cert.subjectaltname
                    ? cert.subjectaltname.replace(/DNS:/g, "").split(", ")
                    : [];
                result.validFrom = cert.valid_from || "";
                result.validTo = cert.valid_to || "";
                //result.issuer = cert.issuer.CN || "";
                result.issuer = `${cert.issuer.O || ""} ${cert.issuer.OU || ""} ${cert.issuer.CN || ""}`.trim();

                // Validar si el hostname coincide con CN o SAN (incluyendo comodines)
                const wildcardDomain = `*.${hostname.split(".").slice(1).join(".")}`;
                result.validForHost =
                    result.cn === hostname ||
                    result.san.includes(hostname) ||
                    result.san.includes(wildcardDomain);

                result.sslStatus = result.validForHost
                ? "✅ Válido"
                : "⚠️ Inválido para este host";
                resolve();
            });

            req.on("error", (err) => {
                result.sslStatus = "❌ Error de conexión o certificado inválido";
                resolve();
            });

            req.end();
        });
    } catch (error) {
        result.sslStatus = "❌ URL inválida o error inesperado";
    }

    return result;
}

module.exports = validarCertificadoSSL;

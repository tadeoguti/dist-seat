require('dotenv').config();
const dns = require('dns').promises;
const ping = require('ping');
//const fetch = require("node-fetch");

async function validarIP(dominio) {
    let resultado = {
        ipResuelta: null,
        coincideServidor: false,
        respondePing: false,
        tiempoPing: null,
        statusHttp: null,
        estadoFinal: null,
    };

    try {
        // Resolver IP del dominio
        const ips = await dns.lookup(dominio);
        resultado.ipResuelta = ips.address;

        // Comparar con la IP registrada en .env
        const ipServidor = process.env.SERVIDOR_IP;
        resultado.coincideServidor = ips.address === ipServidor;

        // Hacer ping al dominio
        const pingRes = await ping.promise.probe(dominio, { timeout: 3 });
        resultado.respondePing = pingRes.alive;
        resultado.tiempoPing = pingRes.time; // en ms

        // Verificar HTTP status
        try {
            const resp = await fetch(`https://${dominio}`, { method: "GET", timeout: 5000 });
            resultado.statusHttp = resp.status;
        } catch (err) {
            resultado.statusHttp = `Error: ${err.message}`;
        }
        // Interpretar estado final
        if (resultado.coincideServidor && resultado.respondePing && resultado.statusHttp === 200) {
            resultado.estadoFinal = "✅ Servidor y sitio responden correctamente";
        } else if (resultado.respondePing && (resultado.statusHttp >= 500)) {
            resultado.estadoFinal = "⚠️ Servidor responde a red pero la web está caída (5xx)";
        } else if (resultado.respondePing && resultado.statusHttp === null) {
            resultado.estadoFinal = "⚠️ Servidor responde a ping pero no a HTTP";
        } else if (!resultado.respondePing && resultado.statusHttp === null) {
            resultado.estadoFinal = "❌ Servidor no responde (ping y HTTP fallan)";
        } else if (resultado.statusHttp === 301 || resultado.statusHttp === 302) {
            resultado.estadoFinal = "ℹ️ El sitio redirige a otra URL";
        } else {
            resultado.estadoFinal = "❓ Estado indeterminado, revisar manualmente";
        }

    } catch (error) {
        console.error(`❌ Error al validar IP de ${dominio}: ${error.message || error}`);
    }

    return resultado;
}

module.exports = validarIP;
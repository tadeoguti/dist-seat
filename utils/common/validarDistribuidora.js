const extractSitemapLinks = require("../network/extratSitemapLinks");
const validarCertificadoSSL = require("../network/validarCertificadoSSL");
const validarIP = require("../network/validarIP");
const capturarErroresConsolaSelenium = require("../Selenium/capturarErroresConsolaSelenium");
const getPageStatusSelenium = require("../Selenium/getPageStatusSelenium");
const medirTiempoCargaSelenium = require("../Selenium/medirTiempoCargaSelenium");
const validarDOMSelenium = require("../Selenium/validarDOMSelenium");
const validateHomeRedirectSelenium = require("../Selenium/validateHomeRedirectSelenium");
const { addDriver } = require("./cleanupDrivers.js");
const delay = require("./delay");
// Array para almacenar todos los drivers activos (opcional, si quieres más control)

async function validarDistribuidora(itemDist, index, total, pathSiteMap) {
    const  driverSelenium  = require("../Selenium/driverSelenium"); // cargar aquí para crear uno nuevo
    const driver = await driverSelenium(false); // headless: true
    // 🔥 Registrar driver
    addDriver(driver);
    const resultDistGeneral = {
        idDist: itemDist.idDist,
        nameDist: itemDist.nameDist,
        urlDist: '',
        sitemap: '',
        urlsDuplicadas: [],
        homeRedireccion: '',
        homeUrlSinWWW: null,
        homeUrlConWWW: null,
        homeDestinoSinWWW: null,
        homeDestinoConWWW: null,
        homeError: null,
        domValido: '',
        mensajeError: '',
        ipResuelta: null,
        coincideServidor: false,
        respondePing: false,
        tiempoPing: null,
        statusHttp: null,
        estadoFinal: null,
        sslStatus: '',
        sslCn: '',
        sslSan: [],
        sslValidForHost: false,
        sslValidFrom: '',
        sslValidTo: '',
        sslIssuer: '',
    };

    let resultsDist = []; // resultados de las URLs del sitemap
    let linksSitemapDist = {};

    try {
        console.log("=".repeat(50));
        console.log(`🔎 Distribuidor #${index + 1} de ${total}: ${itemDist.nameDist}`);

        let urlD = itemDist.urlDist.replace(/^www\./i, '');
        if (!urlD.startsWith('http://') && !urlD.startsWith('https://')) {
            urlD = 'https://' + urlD;
        }
        resultDistGeneral.urlDist = urlD;

        const dominio = urlD.replace(/^https?:\/\//, '');

        // === 1. Validar IP ===
        const resultadoIP = await validarIP(dominio);
        Object.assign(resultDistGeneral, {
            ipResuelta: resultadoIP.ipResuelta,
            coincideServidor: resultadoIP.coincideServidor,
            respondePing: resultadoIP.respondePing,
            tiempoPing: resultadoIP.tiempoPing,
            statusHttp: resultadoIP.statusHttp,
            estadoFinal: resultadoIP.estadoFinal,
        });

        if (!resultadoIP.coincideServidor) {
            resultDistGeneral.mensajeError = "IP no válida / No coincide con servidor registrado.";
            return { general: resultDistGeneral, details: resultsDist };
        }

        // === 2. SSL ===
        const infoCertSSL = await validarCertificadoSSL(urlD);
        resultDistGeneral.sslStatus = infoCertSSL.sslStatus;
        resultDistGeneral.sslCn = infoCertSSL.cn;
        resultDistGeneral.sslSan = infoCertSSL.san.join("\n");
        resultDistGeneral.sslValidForHost = infoCertSSL.validForHost ? "✅ Sí" : "❌ No";
        resultDistGeneral.sslValidFrom = infoCertSSL.validFrom;
        resultDistGeneral.sslValidTo = infoCertSSL.validTo;
        resultDistGeneral.sslIssuer = infoCertSSL.issuer;

        // === 3. Redirección Home ===
        const homeValidated = await validateHomeRedirectSelenium(driver, urlD);
        resultDistGeneral.homeRedireccion = homeValidated
            ? `Ambas versiones redirigen al mismo destino.`
            : `Las versiones con y sin "www." NO redirigen igual.`;
        resultDistGeneral.homeUrlSinWWW = homeValidated.urlWithoutWWW;
        resultDistGeneral.homeUrlConWWW = homeValidated.urlWithWWW;
        resultDistGeneral.homeDestinoSinWWW = homeValidated.finalUrlWithoutWWW;
        resultDistGeneral.homeDestinoConWWW = homeValidated.finalUrlWithWWW;
        resultDistGeneral.homeError = homeValidated.error;

        // === 4. Sitemap ===
        const linkDistSitemap = urlD + pathSiteMap;
        resultDistGeneral.sitemap = linkDistSitemap;
        linksSitemapDist = await extractSitemapLinks(linkDistSitemap);
        resultDistGeneral.urlsDuplicadas = linksSitemapDist.duplicatedUrls || [];

        if (!linksSitemapDist.uniqueUrls?.length) {
            resultDistGeneral.mensajeError = `Sitemap vacío o inválido para ${itemDist.nameDist}`;
            return { general: resultDistGeneral, details: resultsDist };
        }

        console.log(`✅ Sitemap contiene ${linksSitemapDist.uniqueUrls.length} enlaces`);

        // === 5. Procesar cada URL del sitemap ===
        for (const [i, url] of linksSitemapDist.uniqueUrls.entries()) {
            const resultSitioDist = {
                idDist: itemDist.idDist,
                nameDist: itemDist.nameDist,
                urlSitio: url,
                statusURL: "",
                statusMensaje: "",
                TiempoCargaDOM: null,
                TiempoCargaTotal: null,
                Imagen_rota: "",
                Texto: "",
                Enlace_invalido: "",
                Error_consola: "",
                Titulo: "",
                Etiqueta_Meta: "",
                Enlace_externo_invalido: "",
                Error_general: "",
            };

            try {
                await capturarErroresConsolaSelenium(driver);
                await driver.get(url);

                const tiemposCarga = await medirTiempoCargaSelenium(driver);
                resultSitioDist.TiempoCargaDOM = `${tiemposCarga.tiempoDOM.ms} ms (${tiemposCarga.tiempoDOM.s} s)`;
                resultSitioDist.TiempoCargaTotal = `${tiemposCarga.tiempoTotal.ms} ms (${tiemposCarga.tiempoTotal.s} s)`;

                const totalHeight = await driver.executeScript('return document.body.scrollHeight || document.documentElement.scrollHeight;');
                await driver
                    .manage()
                    .window()
                    .setRect({ width: 1920, height: totalHeight });
                await delay(1000);

                const estado = await getPageStatusSelenium(driver);
                resultSitioDist.statusURL = estado.status;
                resultSitioDist.statusMensaje = estado.message;

                if (estado.status !== 200) {
                    resultsDist.push(resultSitioDist);
                    continue;
                }

                const datosDOM = await validarDOMSelenium(driver);
                if (!datosDOM.ok) {
                    console.warn(`❌ Errores detectados en DOM:\n  ${JSON.stringify(datosDOM.errores, null, 2)}`);
                    resultDistGeneral.domValido = false;
                }

                datosDOM.errores.forEach(err => {
                    if (err.tipo && resultSitioDist.hasOwnProperty(err.tipo)) {
                        resultSitioDist[err.tipo] = err.detalle || "";
                    }
                });

                resultsDist.push(resultSitioDist);
            } catch (error) {
                resultSitioDist.Error_general = error.message || String(error);
                resultsDist.push(resultSitioDist);
            }
        }
    } catch (error) {
        resultDistGeneral.mensajeError = `Error crítico: ${error.message}`;
        console.error(`❌ Error grave en distribuidora ${itemDist.nameDist}:`, error);
    } finally {
         // ✅ Cierra el driver aquí, y elimínalo del registro
        try {
            await driver.quit();
            console.log(`🔗 Navegador para ${itemDist.nameDist} cerrado.`);
        } catch (err) {
            // Puede fallar si ya se cerró por otro motivo
            console.warn(`🔸 No se pudo cerrar driver para ${itemDist.nameDist}`);
        } finally {
            // Asegúrate de eliminarlo del Set global
            const { activeDrivers } = require('./cleanupDrivers.js');
            activeDrivers.delete(driver);
        }
    }

    return { general: resultDistGeneral, details: resultsDist };
}



module.exports = validarDistribuidora;
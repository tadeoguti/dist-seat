const fs = require("fs");
const path = require("path");
const crearCarpetasResultados = require("../utils/files/crearCarpetasResultados");
const extractSitemapLinks = require("../utils/network/extratSitemapLinks");
const validarCertificadoSSL = require("../utils/network/validarCertificadoSSL");
const validarIP = require("../utils/network/validarIP");
const capturarErroresConsolaSelenium = require("../utils/Selenium/capturarErroresConsolaSelenium");
const driverSelenium = require("../utils/Selenium/driverSelenium");
const getDistribuidoraSelenium = require("../utils/Selenium/getDistribuidoraSelenium");
const getPageStatusSelenium = require("../utils/Selenium/getPageStatusSelenium");
const medirTiempoCargaSelenium = require("../utils/Selenium/medirTiempoCargaSelenium");
const validarDOMSelenium = require("../utils/Selenium/validarDOMSelenium");
const validateHomeRedirectSelenium = require("../utils/Selenium/validateHomeRedirectSelenium");
const cleanfiles = require("../utils/files/cleanfiles");
const saveReportDetalles = require("../utils/ReportesExcel/saveReportDetalles");
const reportarTiempo = require("../utils/common/reportarTiempo");
const delay = require("../utils/common/delay");
const setupLoggingToFile = require("../utils/files/setupLoggingToFile");

//Proceso para hacerlo por lotes en los links de cada Distribuidora 



async function validacionesPrincipales() {
    const startProcessTime = Date.now();
    try {
        const nameMarca = "Seat";
        let resultsGeneral = [];
        let resultsDist = [];
        let distribuidoras = [];
        let totalSecciones = 0;
        let linksSitemapDist = {};
        const pathSiteMap = "/XMLsitemap.ashx";
        const MAX_PARALLEL_URLS = 8; // Máximo 3 URLs procesadas simultáneamente por distr.
        // Crear carpetas
        const RUTAS = await crearCarpetasResultados(
            `${nameMarca}-ValidacionesPrincipales`,
            ["REPORT_DIR"]
        );
        //Guardado de los logs
        setupLoggingToFile(RUTAS.script_DIR, 'ejecucion_logs.txt');

        // Obtener distribuidores
        const driverDist = await driverSelenium(false);
        const pathJson = await getDistribuidoraSelenium(driverDist, nameMarca);
        await driverDist.quit();
        distribuidoras = JSON.parse(fs.readFileSync(path.join(pathJson), "utf-8"));
        // 🔧 Solo prueba con las primeras 5 distribuidoras
        distribuidoras = distribuidoras.slice(0, 2);
        const dirPathJson = path.dirname(pathJson);
        cleanfiles(dirPathJson, `${nameMarca}_`, `.json`, 1);

        // Procesar cada distribuidora
        let index = 0;
        for (const dist of distribuidoras) {
            const itemDist = dist;
            //let estado = { status: 0, message: "No procesado" };
            let resultDistGeneral = {
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
            console.log("=".repeat(50));
            console.log(`🔎 Distribuidor #${index + 1} de ${distribuidoras.length}: ${itemDist.nameDist}`);

            let urlD = itemDist.urlDist;
            // Quitar "www." si está al inicio
            urlD = urlD.replace(/^www\./i, '');
            // Añadir protocolo si no está presente
            if (!urlD.startsWith('http://') && !urlD.startsWith('https://')) {
                urlD = 'https://' + urlD;
            }
            resultDistGeneral.urlDist = urlD;
            // === 1. Validación IP ===
            try {
                let dominio = urlD;
                //Para la validación de IP hay que quitar el https://
                if (dominio.startsWith('http://') || dominio.startsWith('https://')) {
                    dominio = dominio.replace(/^https?:\/\//, '');
                }
                // Validación de IP antes de procesar el sitio
                const resultadoIP = await validarIP(dominio); // función que compara la IP del sitio con tu IP registrada
                console.log(`🔹 Distribuidora: ${itemDist.nameDist}`);
                console.log(`Dominio: ${dominio}`);
                console.log(`DNS-IP Resuelta: ${resultadoIP.ipResuelta}`);
                console.log(`Coincide con servidor registrado: ${resultadoIP.coincideServidor}`);
                console.log(`Respuesta Ping: ${resultadoIP.respondePing}`);
                console.log(`Tiempo Ping: ${resultadoIP.tiempoPing} ms`);
                console.log(`Status HTTP: ${resultadoIP.statusHttp}`);
                console.log(`Estado final: ${resultadoIP.estadoFinal}`);

                resultDistGeneral.ipResuelta = resultadoIP.ipResuelta;
                resultDistGeneral.coincideServidor = resultadoIP.coincideServidor;
                resultDistGeneral.respondePing = resultadoIP.respondePing;
                resultDistGeneral.tiempoPing = resultadoIP.tiempoPing;
                resultDistGeneral.statusHttp = resultadoIP.statusHttp;
                resultDistGeneral.estadoFinal = resultadoIP.estadoFinal;
                if (!resultadoIP.coincideServidor) {
                    console.warn(`❌ La IP de ${dominio} no coincide con la IP registrada. Se omiten las validaciones principales.`);
                    resultDistGeneral.mensajeError = "IP no válida / No coincide con servidor registrado.";
                    resultsGeneral.push(resultDistGeneral);
                    index++;
                    continue;// pasar a la siguiente distribuidora
                }

            } catch (error) {
                console.error(`❌ Error al validar la IP del sitio: ${itemDist.urlDist}`);
                console.error(`Detalle del error: ${error.message || error}`);

                // Guardar información parcial en el objeto para el reporte
                resultDistGeneral.mensajeError = `Error validando IP: ${error.message || error}`;
                resultDistGeneral.ipResuelta = null;
                resultDistGeneral.coincideServidor = false;
                resultDistGeneral.respondePing = false;
                resultDistGeneral.tiempoPing = null;

                resultsGeneral.push(resultDistGeneral);
                index++;
                continue; // pasar a la siguiente distribuidora
            }
            // === 2. SSL ===
            try {
                const infoCertSSL = await validarCertificadoSSL(urlD);
                console.log(`🔐 Certificado de: ${urlD}`);
                console.log(`- Estado: ${infoCertSSL.sslStatus}`);
                console.log(`- CN: ${infoCertSSL.cn}`);
                console.log(`- SAN: ${infoCertSSL.san.join(", ")}`);
                console.log(`- Válido para host: ${infoCertSSL.validForHost ? "✅ Sí" : "❌ No"}`);
                console.log(`- Desde: ${infoCertSSL.validFrom}`);
                console.log(`- Hasta: ${infoCertSSL.validTo}`);
                console.log(`- Emitido por: ${infoCertSSL.issuer}`);
                resultDistGeneral.sslStatus = infoCertSSL.sslStatus;
                resultDistGeneral.sslCn = infoCertSSL.cn;
                resultDistGeneral.sslSan = infoCertSSL.san.join("\n");
                resultDistGeneral.sslValidForHost = infoCertSSL.validForHost ? "✅ Sí" : "❌ No";
                resultDistGeneral.sslValidFrom = infoCertSSL.validFrom;
                resultDistGeneral.sslValidTo = infoCertSSL.validTo;
                resultDistGeneral.sslIssuer = infoCertSSL.issuer;
            } catch (error) {
                console.error(`❌ Error al validar el Certificado SSL del sitio: ${itemDist.urlDist}`);
                console.error(`Detalle del error: ${error.message || error}`);

                // Guardar información parcial en el objeto para el reporte
                resultDistGeneral.mensajeError = `Error validando el Certificado SSL: ${error.message || error}`;
                resultsGeneral.push(resultDistGeneral);
            }
            // === 3. Redirección Home ===
            let driverHome;
            try {
                driverHome = await driverSelenium(false);
                const homeValidated = await validateHomeRedirectSelenium(driverHome, urlD);
                resultDistGeneral.homeRedireccion = homeValidated
                    ? `Ambas versiones redirigen al mismo destino.`
                    : `Las versiones con y sin "www." NO redirigen igual.`;
                resultDistGeneral.homeUrlSinWWW = homeValidated.urlWithoutWWW;
                resultDistGeneral.homeUrlConWWW = homeValidated.urlWithWWW;
                resultDistGeneral.homeDestinoSinWWW = homeValidated.finalUrlWithoutWWW;
                resultDistGeneral.homeDestinoConWWW = homeValidated.finalUrlWithWWW;
                resultDistGeneral.homeError = homeValidated.error;

            } catch (error) {
                console.error(`❌ Error al validar la Redirección Home del sitio: ${itemDist.urlDist}`);
                console.error(`Detalle del error: ${error.message || error}`);
                // Guardar información parcial en el objeto para el reporte
                resultDistGeneral.mensajeError = `Error validando la Redirección Home: ${error.message || error}`;
                resultsGeneral.push(resultDistGeneral);
            } finally {
                await driverHome.quit();
            }
            // === 4. Sitemap ===
            try {
                console.log(`Validando Sitemap del sitio web: ${urlD}`);
                //Obtener los links del sitemap. 
                let linkDistSitemap = urlD + pathSiteMap;
                resultDistGeneral.sitemap = linkDistSitemap;
                linksSitemapDist = await extractSitemapLinks(linkDistSitemap);
                resultDistGeneral.urlsDuplicadas = linksSitemapDist.duplicatedUrls;
                resultDistGeneral.certificadoSSL_Sitemap = linksSitemapDist.sslStatus;

                if (!linksSitemapDist.uniqueUrls || linksSitemapDist.uniqueUrls.length === 0) {
                    console.log(`❌ El sitemap de ${itemDist.nameDist} no contiene enlaces`);
                    resultDistGeneral.mensajeError = `Error: No tiene enlaces el sitemap de la Distribuidora -> ${itemDist.nameDist} `;
                    resultsGeneral.push(resultDistGeneral);
                    index++;
                    continue; // saltar a la siguiente distribuidora
                }
            } catch (error) {
                console.error(`❌ Error al validar el sitemap del sitio: ${itemDist.urlDist}`);
                console.error(`Detalle del error: ${error.message || error}`);
                // Guardar información parcial en el objeto para el reporte
                resultDistGeneral.mensajeError = `Error validando el sitemap: ${error.message || error}`;
                resultsGeneral.push(resultDistGeneral);
                index++;
                continue;
            }
            // === 5. Validar URLs del sitemap en lotes paralelos ===
            // Filtrar quitando las que tengan `/Cupra/` en el path
            console.log("Excluyendo las Landings Cupra...");
            const urlsFiltradas = linksSitemapDist.uniqueUrls.filter(u => {
                const { pathname } = new URL(u);
                const LandingCupra= ["/Cupra/", "/NUEVO-FORMENTOR/25","/NUEVO-LEON/25", "/NUEVO-TERRAMAR/25","/NUEVO-FORMENTOR-PHEV/25","/ATECA/24"];
                //return !pathname.includes("Cupra");
                // devuelve true si contiene alguno de los textos
                const contienePalabra = LandingCupra.some(word =>
                    pathname.toUpperCase().includes(word.toUpperCase())
                );

                return !contienePalabra; // nos quedamos solo con los que NO matchean
            });
            console.log(`✅ Sitemap contiene ${urlsFiltradas.length} enlaces`);
            const resultsBatch = [];

            // Crear hasta MAX_PARALLEL_URLS drivers
            const drivers = [];
            for (let i = 0; i < Math.min(MAX_PARALLEL_URLS, urlsFiltradas.length); i++) {
                const driver = await driverSelenium(false);
                drivers.push(driver);
                addActiveDriver(driver);
            }
            try {
                // Procesar en lotes
                const totalLotes = Math.ceil(urlsFiltradas.length / MAX_PARALLEL_URLS);
                console.log(`\n📊 Total de URLs: ${urlsFiltradas.length}`);
                console.log(`📦 Se dividirán en ${totalLotes} lote(s), máximo ${MAX_PARALLEL_URLS} por lote`);
                for (let i = 0; i < urlsFiltradas.length; i += MAX_PARALLEL_URLS) {
                    const batch = urlsFiltradas.slice(i, i + MAX_PARALLEL_URLS);
                    const driverBatch = drivers.slice(0, batch.length);

                    // 🔢 Número de lote actual
                    const numeroLoteActual = Math.floor(i / MAX_PARALLEL_URLS) + 1;

                    console.log(`\n🚀 PROCESANDO LOTE ${numeroLoteActual} de ${totalLotes}...`);
                    console.log(`🔗 URLs en este lote (${batch.length}):`);
                    batch.forEach((url, idx) => {
                        console.log(`   [${idx + 1}] ${url}`);
                    });

                    const promises = batch.map(async (url, idx) => {
                        const driver = driverBatch[idx];
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
                            //console.log(`Revisando el sitio: ${url}`);
                            await capturarErroresConsolaSelenium(driver);
                            await driver.get(url);

                            //console.log(`Revisando el Estatus HTTP del sitio: ${url}`);
                            const estado = await getPageStatusSelenium(driver);
                            resultSitioDist.statusURL = estado.status;
                            resultSitioDist.statusMensaje = estado.message;

                            if (estado.status !== 200) return resultSitioDist;

                            //console.log(`Revisando los tiempos de carga del sitio: ${url}`);
                            const tiemposCarga = await medirTiempoCargaSelenium(driver);
                            resultSitioDist.TiempoCargaDOM = `${tiemposCarga.tiempoDOM.ms} ms (${tiemposCarga.tiempoDOM.s} s)`;
                            resultSitioDist.TiempoCargaTotal = `${tiemposCarga.tiempoTotal.ms} ms (${tiemposCarga.tiempoTotal.s} s)`;
                            //console.log(`Revisando El DOM del sitio: ${url}`);
                            const datosDOM = await validarDOMSelenium(driver);
                            datosDOM.errores.forEach(err => {
                                if (resultSitioDist.hasOwnProperty(err.tipo)) {
                                    resultSitioDist[err.tipo] = err.detalle || "";
                                }
                            });
                        } catch (error) {
                            console.log(`Error Revisando el sitio: ${url}`);
                            console.log("-".repeat(50));
                            resultSitioDist.Error_general = error.message;
                        }
                        //console.log(`Finalizando de revisar el sitio: ${url}`);
                        return resultSitioDist;
                    });

                    const results = await Promise.all(promises);
                    resultsBatch.push(...results);
                }
            } catch (error) {
                console.error(`Error procesando URLs de ${itemDist.nameDist}:`, error);
            } finally {
                // Cerrar todos los drivers de este grupo
                await Promise.all(
                    drivers.map(async (driver) => {
                        try {
                            await driver.quit();
                        } catch (err) { /* ignorar */ }
                        finally {
                            activeDrivers.delete(driver);
                        }
                    })
                );
            }

            resultsDist.push(...resultsBatch);
            resultsGeneral.push(resultDistGeneral);
        }
        //console.table(resultsGeneral);
        //console.table(resultsDist);
        console.log("Resultados Generales: ");
        console.log(resultsGeneral);
        console.log("-".repeat(50));
        console.log("Resultados por sitio: ");
        console.log(resultsDist);
        //Guardar Reporte de ejecucion 
        //Guardar Reporte de ejecucion 
        const dateExcel = new Date()
            .toISOString()                // "2025-04-05T14:30:25.123Z"
            .slice(0, 19)                 // "2025-04-05T14:30:25"
            .replace('T', '_')            // "2025-04-05_14:30:25"
            .replace(/:/g, '-');          // "2025-04-05_14-30-25"
        console.log(`\n\n📝 Guardando resultados en Excel...`);
        const excelPath = path.join(
            RUTAS.REPORT_DIR,
            `Reporte_${dateExcel}.xlsx`
        );
        await saveReportDetalles(resultsGeneral, resultsDist, excelPath);
        cleanfiles(RUTAS.REPORT_DIR, `Reporte_`, `.xlsx`, 5);

        console.log("-".repeat(50));

        reportarTiempo(startProcessTime, distribuidoras.length, totalSecciones);

    } catch (error) {
        console.error('❌ Error en la ejecución del script:', error);
    } //finally {
    //     await driver.quit();
    // }
}
// Array global para manejar drivers activos (para Ctrl+C)
const activeDrivers = new Set();

// Función para agregar driver al seguimiento
function addActiveDriver(driver) {
    activeDrivers.add(driver);
}

// Manejo seguro de interrupción (Ctrl + C)
process.on('SIGINT', async () => {
    console.log('\n\n🛑 Señal de interrupción recibida. Cerrando navegadores...');
    for (const driver of activeDrivers) {
        try {
            await driver.quit();
        } catch (err) {
            // Ignorar errores de sesión perdida
        }
    }
    activeDrivers.clear();
    console.log('✅ Todos los navegadores cerrados. Saliendo...');
    process.exit(0);
});
validacionesPrincipales();

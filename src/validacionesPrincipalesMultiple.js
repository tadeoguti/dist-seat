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
const { default: pLimit } = require('p-limit');

async function validacionesPrincipalesMultiple() {
    const startProcessTime = Date.now();
    const nameMarca = "Seat";
    const trabajador = 5;
    const limit = pLimit(trabajador); // Aqui se indica el total de navegadores trabajando a la vez. 
    // Crear carpetas
    const RUTAS = await crearCarpetasResultados(
        `${nameMarca}-ValidacionesPrincipales`,
        ["REPORT_DIR"]
    );
    setupLoggingToFile(RUTAS.script_DIR, 'ejecucion_logs.txt');

    // Obtener distribuidores
    const driver1 = await driverSelenium(true);
    const pathJson = await getDistribuidoraSelenium(driver1, nameMarca);
    await driver1.quit();
    const distribuidoras = JSON.parse(fs.readFileSync(path.join(pathJson), "utf-8"));
    const dirPathJson = path.dirname(pathJson);
    cleanfiles(dirPathJson, `${nameMarca}_`, `.json`, 2);
    //try {
    let resultsGeneral = [];
    let totalSecciones = 0;
    let linksSitemapDist = {};
    const pathSiteMap = "/XMLsitemap.ashx";
    let index = 0;
    let allPageValidationTasks = [];

    console.log("📋 Preparando la lista de todas las páginas a validar...");

    for (const dist of distribuidoras) {
        const itemDist = dist;
        //let estado = { status: 0, message: "No procesado" };
        // Guarda la info general del distribuidor
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

        try {
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
            //validar IP
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
                continue; // pasar a la siguiente distribuidora
            }
            //Validar Certificado SSL
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
            //Validar Redireccionamiento del HOME www con vs sin 
            let driver3;
            try {
                driver3 = await driverSelenium(true);
                const homeValidated = await validateHomeRedirectSelenium(driver3, urlD);
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
            }finally{
                await driver3.quit();
            }
            //Validando Sitemap
            try {
                console.log(`Validando Sitemap del sitio web: ${urlD}`);
                //Obtener los links del sitemap. 
                let linkDistSitemap = urlD + pathSiteMap;
                resultDistGeneral.sitemap = linkDistSitemap;
                linksSitemapDist = await extractSitemapLinks(linkDistSitemap);
                resultDistGeneral.urlsDuplicadas = linksSitemapDist.duplicatedUrls;
                resultDistGeneral.certificadoSSL_Sitemap = linksSitemapDist.sslStatus;

                if (!linksSitemapDist.uniqueUrls || linksSitemapDist.uniqueUrls.length === 0) {
                    console.log(`⚠️ ❌ El sitemap de ${itemDist.nameDist} no contiene enlaces`);
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
                continue;
            }
            console.log(`✅ Sitemap contiene ${linksSitemapDist.uniqueUrls.length} secciones`);
            totalSecciones = linksSitemapDist.uniqueUrls.length;
            let i = 0;
            for (const url of linksSitemapDist.uniqueUrls) {
                allPageValidationTasks.push(
                    // limit() envuelve tu función y se asegura de que no se ejecuten más de 5 a la vez
                    limit(() => validateSinglePage(url, itemDist))
                );
                i++;
                //if (i >= 20) break;
            }
            //resultsGeneral.push(resultDistGeneral);
        } catch (error) {
            console.error(`  - ❌ Error al preparar ${itemDist.nameDist}: ${error.message}`);
            // Guarda el error y continúa
            resultDistGeneral.mensajeError = error.message;
            //resultsGeneral.push(resultDistGeneral);
        }
        resultsGeneral.push(resultDistGeneral);
        index++;
        //if (index >= 1) break;
    }
    // --- 3. EJECUCIÓN EN PARALELO ---
    // CAMBIO: Ahora ejecutamos todas las tareas de la lista con un límite de concurrencia.
    const mappedTasks = allPageValidationTasks.map(task => limit(task));

    console.log(`\n🚀 Ejecutando ${allPageValidationTasks.length} validaciones de páginas en paralelo (límite de ${trabajador})...`);
    // BUCLE 2: EJECUCIÓN EN PARALELO (LA MAGIA OCURRE AQUÍ)
    // Promise.all espera a que todas las tareas en la cola terminen.
    const resultsDist = await Promise.all(mappedTasks);
    console.log("✅ Todas las validaciones han terminado.");
    // --- 4. GUARDADO DE RESULTADOS ---
    //console.table(resultsGeneralCupra);
    //console.table(resultsCupraDist);
    //console.log(resultsCupraDist);
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
}

validacionesPrincipalesMultiple().catch(console.error);;

/**
 * Nueva función para validar UNA SOLA página.
 * Cada ejecución de esta función usará su propia instancia de Selenium.
 */
async function validateSinglePage(url, itemDist) {
    let driver;
    // Prepara el objeto de resultados para esta página
    let resultSitioDist = {
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
    }
    console.log(`  -> Procesando: ${url}`);
    try {
        // Cada tarea crea y destruye su propio navegador para evitar conflictos.
        // Se usa 'false' para modo headless (más rápido).
        driver = await driverSelenium(true);

        console.log("-".repeat(50));
        //console.log(`🔎 📊 Comparación de Distribuidoras ${nameMarca} #${index + 1} de ${distribuidoras.length} `);
        //console.log(`🌐 Validando sección #${i + 1} de ${linksSitemapDist.uniqueUrls.length}: \n${url}`);
        //try {
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
        console.log(`Estado: ${estado.status} - ${estado.message}`);
        // if (estado.status !== 200) {
        //     console.warn(`⚠️ Página con error HTTP, se omite validación de elementos.`);
        //     resultSitioDist.statusURL = estado.status;
        //     resultSitioDist.statusMensaje = estado.message;
        //     //resultsDist.push(resultSitioDist);
        //     continue;
        // } else {
        //     resultSitioDist.statusURL = estado.status;
        //     resultSitioDist.statusMensaje = estado.message;
        //     // 3.4.2: Validar carga correcta de elementos
        //     const datosDOM = await validarDOMSelenium(driver);
        //     if (datosDOM.ok) {
        //         console.log('✅ Elementos cargados correctamente.');
        //     } else {
        //         console.warn(`❌ Errores detectados en DOM:\n  ${JSON.stringify(datosDOM.errores, null, 2)}`);
        //         //resultDistGeneral.domValido = datosDOM.ok; // true = sin errores, false = hubo errores
        //     }
        //     // Ingresar errores al objeto usando el tipo como columna
        //     datosDOM.errores.forEach(err => {
        //         if (resultSitioDist.hasOwnProperty(err.tipo)) {
        //             resultSitioDist[err.tipo] = err.detalle || "";
        //         } else {
        //             // Por si aparece un tipo nuevo no contemplado en tu plantilla
        //             resultSitioDist[err.tipo] = err.detalle || "";
        //         }
        //     });
        //     //resultsDist.push(resultSitioDist);
        // }
        if (estado.status === 200) {

            const datosDOM = await validarDOMSelenium(driver);
            if (!datosDOM.ok) {
                datosDOM.errores.forEach(err => {
                    if (resultSitioDist.hasOwnProperty(err.tipo)) {
                        resultSitioDist[err.tipo] = err.detalle || "";
                    }
                });
            }
        }
        return resultSitioDist;
    } catch (error) {
        console.error(`❌ Error validando ${url}: ${error.message}`);
        resultSitioDist.Error_general = error.message; // Guarda el error
        return resultSitioDist; // Siempre retorna un objeto

    } finally {
        await driver.quit();
    }
}

module.exports = validacionesPrincipalesMultiple;
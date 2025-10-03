const path = require('path');
const fs = require('fs');
const { emularPuppeteer, listarDispositivos } = require("../utils/Puppeteer/emularPuppeteer.js");
const crearEstructuraCarpetas = require("../utils/files/crearCarpetasResultados.js");
const setupLoggingToFile = require("../utils/files/setupLoggingToFile.js");
const driverPuppeteer = require('../utils/Puppeteer/driverPuppeteer.js');
const getDistribuidoraPuppeteer = require('../utils/Puppeteer/getDistribuidoraPuppeteer.js');
const seleccionarDistribuidoras = require("../utils/common/seleccionarDistribuidoras.js");
const extractSitemapLinks = require("../utils/network/extratSitemapLinks.js");
const getSafeFileNameFromUrl = require("../utils/network/getSafeFileNameFromUrl.js");
const getValidUrl = require("../utils/network/getValidUrl.js");
const tiemposCargaPuppeteer = require("../utils/Puppeteer/tiemposCargaPuppeteer.js");
const capturaCompletaPuppeter = require("../utils/Puppeteer/capturaCompletaPuppeter.js");
const validarIP = require("../utils/network/validarIP.js");
const validarCertificadoSSL = require("../utils/network/validarCertificadoSSL.js");
const cleanfiles = require("../utils/files/cleanfiles.js");
const validarHomeRedirectPuppeteer = require("../utils/Puppeteer/validarHomeRedirectPuppeteer.js");
const compareVisualTestingResemble = require("../utils/CompararImgs/compareVisualTestingResemble.js");
const saveExcelVisual = require("../utils/ReportesExcel/saveExcelVisual.js");
const reportarTiempo = require('../utils/common/reportarTiempo.js');
const folders = require("../utils/files/folders.js");
/*
    Creación de proyecto, Aplicar el siguiente comando estando en la carpeta donde se guardará este script 
        npm init -y
*/
const startProcessTime = Date.now();
let distribuidoras = [];
let browserDist, browserBase, browser, homeBrowser;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const nameMarca = "Seat";
async function main() {
    console.log(`Iniciando el proceso de Validación sitios ${nameMarca} Con Dispositivo Emulado...`);
    // 🔹 Ver todos los dispositivos que soporta Puppeteer
    await listarDispositivos();
    const dispositivoEmulado = "iPhone 15";
    //const dispositivoEmulado="iPad Pro 11";
    //const { browser, page, deviceData } = await emularPuppeteer(dispositivoEmulado, false);
    try {
        const sitioBase = "https://demo1.gosev4.netcar.com.mx";
        const pathSiteMap = "/XMLsitemap.ashx"
        const sitemapBase = sitioBase + pathSiteMap;
        const MAX_PARALLEL_URLS = 10; // Máximo de URLs procesadas simultáneamente por 
        let resultsGeneral = [], resultsDist = [], resultsBase = [];
        const RUTAS = await crearEstructuraCarpetas(
            `${nameMarca}-${dispositivoEmulado}`,
            ["DIST_DIR", "baseDir", "REPORT_DIR"],
            PROJECT_ROOT
        );
        setupLoggingToFile(RUTAS.script_DIR, 'ejecucion_logs.txt');
        console.log("=".repeat(50));
        browserDist = await driverPuppeteer(true);
        const pageDist = await browserDist.newPage();
        const pathJson = await getDistribuidoraPuppeteer(pageDist, nameMarca, RUTAS.list_Distri);
        await browserDist.close();
        distribuidoras = JSON.parse(
            fs.readFileSync(path.join(pathJson),
                "utf-8"
            ));
        // Extraer solo la dirección de la carpeta donde se guardó el JSON
        const dirPathJson = path.dirname(pathJson);
        cleanfiles(dirPathJson, `${nameMarca}_`, `.json`, 2);
        console.log("=".repeat(60));
        //console.log(`\nSelecciona las distribuidoras a Revisar: \n Presiona: "Espacio" para seleccionar | "a" para seleccionar todas | "i" para invertir la sección | "Enter" para continuar el proceso con la sección elegida`)
        distribuidoras = await seleccionarDistribuidoras(distribuidoras);
        if (distribuidoras.length === 0) {
            console.log("🛑 No se seleccionó ninguna distribuidora. Proceso cancelado.");
            return;
        }
        const linksSitemapBase = await extractSitemapLinks(sitemapBase);
        // Validar que hay links unicos en el sitemap
        if (!linksSitemapBase.uniqueUrls || linksSitemapBase.uniqueUrls.length === 0) {
            console.log(`❌ El sitioBase no contiene enlaces en el sitemap:  ${sitemapBase} `);
            return;
            //resultDistGeneral.mensajeError = `Error: No tiene enlaces el sitemap de la Distribuidora -> ${itemDist.nameDist} `;
        } else {
            console.log("Excluyendo las Landings Cupra En sitio Base...");
            const urlsFiltradasBase = linksSitemapBase.uniqueUrls.filter(u => {
                const { pathname } = new URL(u);
                const LandingCupra = ["/Cupra/", "/NUEVO-FORMENTOR/25", "/NUEVO-LEON/25", "/NUEVO-TERRAMAR/25", "/NUEVO-FORMENTOR-PHEV/25", "/ATECA/24"];
                //return !pathname.includes("Cupra");
                // devuelve true si contiene alguno de los textos
                const contienePalabra = LandingCupra.some(word =>
                    pathname.toUpperCase().includes(word.toUpperCase())
                );
                return !contienePalabra; // nos quedamos solo con los que NO matchean
            });
            console.log(`✅ Sitemap contiene ${urlsFiltradasBase.length} enlaces`);
            const resultsBatchBase = [];
            try {
                //1. Creando el browser (Navegador) con las pages (Pestañas) hasta el valor de MAX_PARALLEL_URLS
                browserBase = await emularPuppeteer(dispositivoEmulado, false, MAX_PARALLEL_URLS);
                // === 2. Procesamiento de Lotes (Lógica sin cambios) ===
                const totalLotesBase = Math.ceil(urlsFiltradasBase.length / MAX_PARALLEL_URLS);
                console.log(`\n📊 Total de URLs: ${urlsFiltradasBase.length}`);
                console.log(`📦 Se dividirán en ${totalLotesBase} lote(s), máximo ${MAX_PARALLEL_URLS} por lote`);
                for (let i = 0; urlsFiltradasBase.length; i += MAX_PARALLEL_URLS) {
                    const batchBase = urlsFiltradasBase.slice(i, i + MAX_PARALLEL_URLS);
                    const pageBatchBase = browserBase.pages.slice(0, batchBase.length);
                    // 🔢 Número de lote actual
                    const numeroLoteBaseActual = Math.floor(i / MAX_PARALLEL_URLS) + 1;
                    console.log(`\n🚀 PROCESANDO LOTE ${numeroLoteBaseActual} de ${totalLotesBase}...`);
                    console.log(`🔗 URLs en este lote (${batchBase.length}):`);
                    batchBase.forEach((url, idx) => {
                        console.log(`   [${idx + 1}] ${url}`);
                    });
                    const promisesBase = batchBase.map(async (url, idx) => {
                        // Asignamos una 'page' del lote a la URL
                        const pageBase = pageBatchBase[idx];
                        let nameImgBase = getSafeFileNameFromUrl(url);
                        let rutaImgBase = path.join(RUTAS.baseDir, `${nameImgBase}.png`);
                        console.log(`Captura del sitio #${idx + 1} de ${urlsFiltradasBase.length}`);
                        console.log(`Entrando al sitio: ${url}`);
                        let newUrlBase = getValidUrl(url);
                        if (newUrlBase) {
                            await pageBase.goto(newUrlBase, {
                                timeout: 60000,
                                waitUntil: 'networkidle2'
                            });
                            await tiemposCargaPuppeteer(pageBase);
                            await capturaCompletaPuppeter(pageBase, rutaImgBase);
                        }
                    });
                    const resultsBase = await Promise.all(promisesBase);
                    resultsBatchBase.push(...resultsBase);
                    console.log(resultsBatchBase);
                }
            } catch (error) {
                console.error(`Error procesando URLs Base de ${newUrlBase}:`, error);
            } finally {
                if (browserBase) {
                    try {
                        await browserBase.close();
                    } catch (e) {
                        console.warn(`Advertencia: Falló el cierre del browserBase para ${itemDist.urlDist}.`);
                    }
                }

            }
            let index = 0;
            for (const itemDist of distribuidoras) {
                let resultDistGeneral = {
                    idDist: itemDist.idDist,
                    nameDist: itemDist.nameDist,
                    urlDist: "",
                    sitemap: '',
                    urlsDuplicadas: [],
                    homeRedireccion: '',
                    homeUrlSinWWW: null,
                    homeUrlConWWW: null,
                    homeDestinoSinWWW: null,
                    homeDestinoConWWW: null,
                    homeError: null,
                    ipResuelta: null,
                    coincideServidor: false,
                    respondePing: false,
                    tiempoPing: null,
                    statusHttp: null,
                    estadoFinal: null,
                    certificadoSSL_Sitemap: "",
                    sslStatus: "",
                    sslCn: "",
                    sslSan: [],
                    sslValidForHost: false,
                    sslValidFrom: "",
                    sslValidTo: "",
                    sslIssuer: "",
                    mensajeError: '',
                };

                console.log("=".repeat(50));
                console.log(`🔎📊 Distribuidor #${index + 1} de ${distribuidoras.length}: ${itemDist.nameDist}`);
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
                try {
                    homeBrowser = await driverPuppeteer(true);
                    const pageHome = await homeBrowser.newPage();
                    const homeValidated = await validarHomeRedirectPuppeteer(pageHome, urlD);
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
                    console.error(`Detalle del error: ${error}`);
                    // Guardar información parcial en el objeto para el reporte
                    resultDistGeneral.mensajeError = `Error validando la Redirección Home: ${error.message || error}`;
                    resultsGeneral.push(resultDistGeneral);
                } finally {
                    // 4. Cerrar el NAVEGADOR TEMPORAL inmediatamente
                    if (homeBrowser) {
                        try {
                            await homeBrowser.close(); // 🚀 Cierre inmediato del browser de Home
                        } catch (e) {
                            console.warn(`Advertencia: Falló el cierre del homeBrowser para ${itemDist.urlDist}.`);
                        }
                    }
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
                        continue;
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
                // Filtrar quitando las que tengan `/Cupra/` y los modelos Cupra en el path
                console.log("Excluyendo las Landings Cupra...");
                const urlsFiltradas = linksSitemapDist.uniqueUrls.filter(u => {
                    const { pathname } = new URL(u);
                    const LandingCupra = ["/Cupra/", "/NUEVO-FORMENTOR/25", "/NUEVO-LEON/25", "/NUEVO-TERRAMAR/25", "/NUEVO-FORMENTOR-PHEV/25", "/ATECA/24"];
                    //return !pathname.includes("Cupra");
                    // devuelve true si contiene alguno de los textos
                    const contienePalabra = LandingCupra.some(word =>
                        pathname.toUpperCase().includes(word.toUpperCase())
                    );
                    return !contienePalabra; // nos quedamos solo con los que NO matchean
                });
                console.log(`✅ Sitemap contiene ${urlsFiltradas.length} enlaces`);
                let currentDir = path.join(RUTAS.DIST_DIR, `${itemDist.idDist} - ${itemDist.nameDist}`);
                let screenshotDir = path.join(currentDir, "Capturas_Pantalla");
                let diffDir = path.join(currentDir, "Diferencias_Visuales");
                await folders(currentDir);
                await folders(screenshotDir);
                await folders(diffDir);
                const resultsBatch = [];
                try {
                    //1. Creando el browser (Navegador) con las pages (Pestañas) hasta el valor de MAX_PARALLEL_URLS
                    browser = await emularPuppeteer(dispositivoEmulado, false, MAX_PARALLEL_URLS);
                    // === 2. Procesamiento de Lotes (Lógica sin cambios) ===
                    const totalLotes = Math.ceil(urlsFiltradas.length / MAX_PARALLEL_URLS);
                    console.log(`\n📊 Total de URLs: ${urlsFiltradas.length}`);
                    console.log(`📦 Se dividirán en ${totalLotes} lote(s), máximo ${MAX_PARALLEL_URLS} por lote`);
                    for (let i = 0; i < urlsFiltradas.length; i += MAX_PARALLEL_URLS) {
                        const batch = urlsFiltradas.slice(i, i + MAX_PARALLEL_URLS);
                        const pageBatch = pages.slice(0, batch.length); // Usamos las páginas pre-creadas
                        // 🔢 Número de lote actual
                        const numeroLoteActual = Math.floor(i / MAX_PARALLEL_URLS) + 1;
                        console.log(`\n🚀 PROCESANDO LOTE ${numeroLoteActual} de ${totalLotes}...`);
                        console.log(`🔗 URLs en este lote (${batch.length}):`);
                        batch.forEach((url, idx) => {
                            console.log(`   [${idx + 1}] ${url}`);
                        });
                        const promises = batch.map(async (url, idx) => {
                            // Asignamos una 'page' del lote a la URL
                            const page = pageBatch[idx];
                            let nameImg = getSafeFileNameFromUrl(url);
                            let newUrlValida = getValidUrl(url);
                            let rutaImg = path.join(screenshotDir, `${nameImg}.png`);
                            let rutaBase = path.join(RUTAS.baseDir, `${nameImg}.png`);
                            const filePathDiff = path.join(diffDir, `${nameImg}.png`);
                            const parsedUrl = new URL(url);
                            const resultSitioDist = {
                                idDist: itemDist.idDist,
                                nameDist: itemDist.nameDist,
                                urlSitioBase: sitioBase + parsedUrl.pathname + parsedUrl.search + parsedUrl.hash,
                                urlSitio: newUrlValida,
                                similitudVisual: "",
                                mensajeVisual: "",
                                evidenciaDiff: "",
                                Device: "",
                                dimensionesImg: "",
                                TiempoCargaDOM: null,
                                TiempoCargaTotal: null,
                                Error_general: "",
                            };
                            let medidas = {};
                            try {
                                if (newUrlValida) {
                                    await page.goto(newUrlValida, {
                                        timeout: 60000,
                                        waitUntil: 'networkidle2' // espera a que la mayoría de recursos terminen de cargar
                                    });
                                    const tiemposCarga = await tiemposCargaPuppeteer(page);
                                    resultSitioDist.TiempoCargaDOM = `${tiemposCarga.tiempoDOM.ms} ms (${tiemposCarga.tiempoDOM.s} s)`;
                                    resultSitioDist.TiempoCargaTotal = `${tiemposCarga.tiempoTotal.ms} ms (${tiemposCarga.tiempoTotal.s} s)`;
                                    //await takeBodyScreenshot(page,rutaImg);
                                    medidas = await capturaCompletaPuppeter(page, rutaImg);
                                }
                                //const resultComparacionVisual = await compareVisualTesting(rutaBase ,rutaImg, filePathDiff);
                                const resultComparacionVisual = await compareVisualTestingResemble(rutaBase, rutaImg, filePathDiff);

                                resultSitioDist.similitudVisual = `${resultComparacionVisual.Similitud}%`;
                                resultSitioDist.mensajeVisual = resultComparacionVisual.Mensaje;
                                if (resultComparacionVisual.Similitud < 100) {
                                    resultSitioDist.evidenciaDiff = filePathDiff;
                                }
                                resultSitioDist.Device = `Tipo: ${deviceData.name} \nResolución: ${deviceData.ancho}x${deviceData.alto}px`;
                                resultSitioDist.dimensionesImg = `${medidas.anchoDevice}x${medidas.altoDevice}px`;

                                resultsDist.push(resultSitioDist);
                            } catch (error) {
                                console.log(`Error Revisando el sitio: ${url}, ${error}`);
                                console.log("-".repeat(50));
                                resultSitioDist.Error_general = error;
                            }
                            return resultSitioDist;
                        });
                        const results = await Promise.all(promises);
                        resultsBatch.push(...results);
                    }
                } catch (error) {
                    console.error(`Error procesando URLs de ${itemDist.nameDist}:`, error);
                } finally {
                    if (browser) {
                        try {
                            await browser.close();
                        } catch (err) {
                            console.error("Error al cerrar el navegador Puppeteer:", err);
                        }
                    }
                }
                resultsDist.push(...resultsBatch);
                resultsGeneral.push(resultDistGeneral);
                index++;
            }
        }
        console.log("=".repeat(50));
        //console.table(resultsGeneral);
        //console.table(resultsDist);
        //console.log(resultsGeneral);
        //console.log(resultsDist);
        //Guardar Reporte de ejecucion 
        const dateExcel = new Date()
            .toISOString()                // "2025-04-05T14:30:25.123Z"
            .slice(0, 19)                 // "2025-04-05T14:30:25"
            .replace('T', '_')            // "2025-04-05_14:30:25"
            .replace(/:/g, '-');          // "2025-04-05_14-30-25"
        console.log(`\n\n📝 Guardando resultados en Excel...`);
        const excelPath = path.join(
            RUTAS.REPORT_DIR,
            `ReporteDispEmulado_${dateExcel}.xlsx`
        );
        await saveExcelVisual(resultsGeneral, resultsDist, excelPath);
        cleanfiles(RUTAS.REPORT_DIR, `ReporteDispEmulado_`, `.xlsx`, 5);
        console.log("-".repeat(50));
    } catch (error) {
        console.error('❌ Error en la ejecución del script:', error);
    } finally {
        reportarTiempo(startProcessTime, distribuidoras.length);
        if (browser) {
            await browser.close();
        }
        if (homeBrowser) {
            await homeBrowser.close();
        }
        if (browserDist) {
            await browserDist.close();
        }
        console.log('Proceso finalizado.\n Navegador de Puppeteer cerrado.');
    }
}

// Manejo seguro de interrupción (Ctrl + C)
process.on('SIGINT', async () => {
    console.log('\n\n🛑🚫 Interrupción detectada. Cerrando navegador...');
    if (browser) {
        await browser.close();
    }
    if (homeBrowser) {
        await homeBrowser.close();
    }
    if (browserDist) {
        await browserDist.close();
    }
    console.log('Navegador de Puppeteer cerrado.');
    process.exit(0);
});

main();
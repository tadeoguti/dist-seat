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
let browserDist, browserBase, browserSitio;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const nameMarca = "Seat";
const numBreak = 5;
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
        const MAX_PARALLEL_URLS = 1;//3; // Máximo de URLs procesadas simultáneamente por 
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
            let newUrlBase;
            try {
                //1. Creando el browser (Navegador) con las pages (Pestañas) hasta el valor de MAX_PARALLEL_URLS
                browserBase = await emularPuppeteer(dispositivoEmulado, true, MAX_PARALLEL_URLS);

                console.log(`\n📊 Total de URLs: ${urlsFiltradasBase.length}`);

                let indexBase = 0;
                for (const urlBase of linksSitemapBase.uniqueUrls) {
                    let nameImgBase = getSafeFileNameFromUrl(urlBase);
                    let rutaImgBase = path.join(RUTAS.baseDir, `${nameImgBase}.png`);
                    console.log("-".repeat(50));
                    console.log(`Captura del sitio #${indexBase + 1} de ${linksSitemapBase.uniqueUrls.length}`);
                    console.log(`Entrando al sitio: ${urlBase}`);
                    newUrlBase = getValidUrl(urlBase);
                    if (newUrlBase) {
                        await browserBase.pages[0].goto(newUrlBase, {
                            timeout: 120000,
                            waitUntil: 'networkidle2' // espera a que la mayoría de recursos terminen de cargar
                        });
                        //await tiemposCargaPuppeteer(page);
                        //console.log(tiemposCarga);
                        //await takeBodyScreenshot(page,rutaImgBase);
                        await capturaCompletaPuppeter(browserBase.pages[0], rutaImgBase);
                    }
                    indexBase++;
                    //if (indexBase >= numBreak) break;
                }
            } catch (error) {
                console.error(`Error procesando URLs Base de ${newUrlBase}:`, error);
            } finally {
                if (browserBase) {
                    try {
                        await browserBase.browser.close();
                    } catch (e) {
                        console.warn(`Advertencia: Falló el cierre del browserBase:  ${e}.`);
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
                    certificadoSSL_Sitemap: "",

                    mensajeError: '',
                };
                console.log("=".repeat(50));
                console.log(`🔎 📊 Comparación de sitios Cupra #${index + 1} de ${distribuidoras.length} `);
                let urlD = itemDist.urlDist;
                // Quitar "www." si está al inicio
                urlD = urlD.replace(/^www\./i, '');
                // Añadir protocolo si no está presente
                if (!urlD.startsWith('http://') && !urlD.startsWith('https://')) {
                    urlD = 'https://' + urlD;
                }
                resultDistGeneral.urlDist = urlD;

                console.log(`Validando Sitemap del sitio web: ${urlD}`);
                //Obtener los links del sitemap de la distribuidora actual. 
                let linkDistSitemap = urlD + pathSiteMap;
                resultDistGeneral.sitemap = linkDistSitemap;
                const linksSitemapDist = await extractSitemapLinks(linkDistSitemap);
                resultDistGeneral.urlsDuplicadas = linksSitemapDist.duplicatedUrls;
                resultDistGeneral.certificadoSSL_Sitemap = linksSitemapDist.sslStatus;
                // Validar que hay links unicos en el sitemap
                if (!linksSitemapDist.uniqueUrls || linksSitemapDist.uniqueUrls.length === 0) {
                    console.log(`❌ El sitemap de ${itemDist.nameDist} no contiene enlaces`);
                    resultDistGeneral.mensajeError = `Error: No tiene enlaces el sitemap de la Distribuidora -> ${itemDist.nameDist} `;
                    resultsGeneralCupra.push(resultDistGeneral);
                    index++;
                    continue; // saltar a la siguiente distribuidora
                } else {
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

                    let i = 0;
                    for (const url of urlsFiltradas) {
                        console.log("-".repeat(50));
                        console.log(`🔎 📊 Comparación de Distribuidoras Cupra #${index + 1} de ${distribuidoras.length} `);
                        console.log(`🌐 Validando enlace #${i + 1} de ${linksSitemapDist.uniqueUrls.length}: \n${url}`);
                        let nameImg = getSafeFileNameFromUrl(url);
                        let newUrlValida = getValidUrl(url);
                        let rutaImg = path.join(screenshotDir, `${nameImg}.png`);
                        let rutaBase = path.join(RUTAS.baseDir, `${nameImg}.png`);
                        const filePathDiff = path.join(diffDir, `${nameImg}.png`);
                        const parsedUrl = new URL(url);
                        browserSitio = await emularPuppeteer(dispositivoEmulado, true, MAX_PARALLEL_URLS);
                        let resultSitioDist = {
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
                        }
                        let medidas = {};
                        try {
                            if (newUrlValida) {
                                await browserSitio.pages[0].goto(newUrlValida, {
                                    timeout: 120000,
                                    waitUntil: 'networkidle2' // espera a que la mayoría de recursos terminen de cargar
                                });
                                medidas = await capturaCompletaPuppeter(browserSitio.pages[0], rutaImg);
                            }
                            const resultComparacionVisual = await compareVisualTestingResemble(rutaBase, rutaImg, filePathDiff);

                            resultSitioDist.similitudVisual = `${resultComparacionVisual.Similitud}%`;
                            resultSitioDist.mensajeVisual = resultComparacionVisual.Mensaje;
                            if (resultComparacionVisual.Similitud < 100) {
                                resultSitioDist.evidenciaDiff = filePathDiff;
                            }
                            resultSitioDist.Device = `Tipo: ${browserSitio.deviceData.name} \nResolución: ${browserSitio.deviceData.ancho}x${browserSitio.deviceData.alto}px`;
                            resultSitioDist.dimensionesImg = `${medidas.anchoDevice}x${medidas.altoDevice}px`;
                            resultsDist.push(resultSitioDist);
                        } catch (error) {
                            console.log(`Error al revisar link ${url} del sitemap de la Distribuidora: ${itemDist.nameDist}  \n\n-->${error}`);
                            resultSitioDist.Error_general = error;
                            resultsDist.push(resultSitioDist);
                        } finally {
                            if (browserSitio) {
                                try {
                                    await browserSitio.browser.close();
                                } catch (err) {
                                    console.error("Error al cerrar el navegador Puppeteer:", err);
                                }
                            }
                        }
                        //if (i >= numBreak) break;
                        i++;
                    }
                }
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
        if (browserSitio) {
            await browserSitio.browser.close();
        }
        if (browserBase) {
            await browserBase.browser.close();
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
    if (browserSitio) {
        await browserSitio.browser.close();
    }
    if (browserBase) {
        await browserBase.browser.close();
    }
    if (browserDist) {
        await browserDist.close();
    }
    console.log('Navegador de Puppeteer cerrado.');
    process.exit(0);
});

main();
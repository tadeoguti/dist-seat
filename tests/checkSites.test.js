//const { Builder, By } = require('selenium-webdriver');
const fs = require("fs");
const path = require("path");
const { expect } = require('chai');
const driverSelenium = require('../utils/Selenium/driverSelenium');
const crearCarpetasResultados = require("../utils/files/crearCarpetasResultados");
const setupLoggingToFile = require("../utils/files/setupLoggingToFile");
const saveReportDetalles = require("../utils/ReportesExcel/saveReportDetalles");
const cleanfiles = require("../utils/files/cleanfiles");
const reportarTiempo = require("../utils/common/reportarTiempo");
const getDistribuidoraSelenium = require("../utils/Selenium/getDistribuidoraSelenium");
const validarIP = require("../utils/network/validarIP");
const validarCertificadoSSL = require("../utils/network/validarCertificadoSSL");
const validateHomeRedirectSelenium = require("../utils/Selenium/validateHomeRedirectSelenium");
const extractSitemapLinks = require("../utils/network/extratSitemapLinks");
const capturarErroresConsolaSelenium = require("../utils/Selenium/capturarErroresConsolaSelenium");
const medirTiempoCargaSelenium = require("../utils/Selenium/medirTiempoCargaSelenium");
const getPageStatusSelenium = require("../utils/Selenium/getPageStatusSelenium");
const validarDOMSelenium = require("../utils/Selenium/validarDOMSelenium");
const delay = require("../utils/common/delay");
const { it } = require("mocha");

// 🔹 describe: agrupa un conjunto de pruebas
describe('Revisión de sitios web SEAT', function () {
  let driver;
  let startProcessTime;
  let RUTAS = {};
  let resultsGeneral = [];
  let resultsDist = [];
  let distribuidoras = [];
  let totalSecciones = 0;
  let linksSitemapDist = {};
  const pathSiteMap = "/XMLsitemap.ashx";

  // 🔹 before: se ejecuta UNA vez antes de todos los tests
  before(async function () {
    try {
      startProcessTime = Date.now();
      driver = await driverSelenium(false);

      // Crear carpetas
      RUTAS = await crearCarpetasResultados(
        "Seat-ValidacionesPrincipales",
        ["REPORT_DIR"]
      );
      setupLoggingToFile(RUTAS.script_DIR, 'ejecucion_logs.txt');

      // Obtener distribuidores
      const pathJson = await getDistribuidoraSelenium(driver, "Seat");
      distribuidoras = JSON.parse(fs.readFileSync(path.join(pathJson), "utf-8"));
      const dirPathJson = path.dirname(pathJson);
      cleanfiles(dirPathJson, `Seat_`, `.json`, 2);

    } catch (error) {
      console.error("❌ Error en before:", error);
      throw error;
    }
  });

  // 🔹 after: se ejecuta UNA vez al final de todos los tests
  after(async function () {
    try {
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
      console.error("❌ Error en after:", error);
    } finally {
      if (driver) await driver.quit();
    }
  });
  // 🔹 it: cada caso de prueba individual
  it(`Revisión de sitios`, async function () {
    let index = 0;
    for (const dist of distribuidoras) {
      //distribuidoras.forEach((dist, index) => {
      const itemDist = dist;
      let estado = { status: 0, message: "No procesado" };
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
          //continue;// pasar a la siguiente distribuidora
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
        //continue; // pasar a la siguiente distribuidora
      }




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




      try {
        const homeValidated = await validateHomeRedirectSelenium(driver, urlD);
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
      }




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
          //index++;
          //continue; // saltar a la siguiente distribuidora
        }
      } catch (error) {
        console.error(`❌ Error al validar el sitemap del sitio: ${itemDist.urlDist}`);
        console.error(`Detalle del error: ${error.message || error}`);
        // Guardar información parcial en el objeto para el reporte
        resultDistGeneral.mensajeError = `Error validando el sitemap: ${error.message || error}`;
        resultsGeneral.push(resultDistGeneral);
      }


      console.log(`✅ Sitemap contiene ${linksSitemapDist.uniqueUrls.length} enlaces`);
      totalSecciones = linksSitemapDist.uniqueUrls.length;
      let i = 0;
      for (const url of linksSitemapDist.uniqueUrls) {
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
        console.log("-".repeat(50));
        console.log(`🌐 Validando enlace #${i + 1} de ${linksSitemapDist.uniqueUrls.length}: \n${url}`);



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
          estado = await getPageStatusSelenium(driver);
          console.log(`Estado: ${estado.status} - ${estado.message}`);
          if (estado.status !== 200) {
            console.warn(`⚠️ Página con error HTTP, se omite validación de elementos.`);
            resultSitioDist.statusURL = estado.status;
            resultSitioDist.statusMensaje = estado.message;
            resultsDist.push(resultSitioDist);
            //continue;
          } else {
            resultSitioDist.statusURL = estado.status;
            resultSitioDist.statusMensaje = estado.message;
            // 3.4.2: Validar carga correcta de elementos
            const datosDOM = await validarDOMSelenium(driver);
            if (datosDOM.ok) {
              console.log('✅ Elementos cargados correctamente.');
            } else {
              console.warn(`❌ Errores detectados en DOM:\n  ${JSON.stringify(datosDOM.errores, null, 2)}`);
              resultDistGeneral.domValido = datosDOM.ok; // true = sin errores, false = hubo errores
            }
            // Ingresar errores al objeto usando el tipo como columna
            datosDOM.errores.forEach(err => {
              if (resultSitioDist.hasOwnProperty(err.tipo)) {
                resultSitioDist[err.tipo] = err.detalle || "";
              } else {
                // Por si aparece un tipo nuevo no contemplado en tu plantilla
                resultSitioDist[err.tipo] = err.detalle || "";
              }
            });
            resultsDist.push(resultSitioDist);
          }
        } catch (error) {
          console.log(`Error al revisar link ${url} del sitemap de la Distribuidora: ${itemDist.nameDist}  \n\n-->${error}`);
          resultSitioDist.statusURL = estado.status;
          resultSitioDist.statusMensaje = estado.message;
          resultsDist.push(resultSitioDist);
        }

        i++;
        if (i >= 5) break;
      }
      resultsGeneral.push(resultDistGeneral);
      index++;
      if (index >= 5) break;
    };
  });

});



const fs = require("fs");
const path = require("path");
const crearCarpetasResultados = require("../utils/files/crearCarpetasResultados");
const extractSitemapLinks = require("../utils/network/extratSitemapLinks");
const validarCertificadoSSL = require("../utils/network/validarCertificadoSSL");
const validarIP = require("../utils/network/validarIP");
const cleanfiles = require("../utils/files/cleanfiles");
const saveReportDetalles = require("../utils/ReportesExcel/saveReportDetalles");
const reportarTiempo = require("../utils/common/reportarTiempo");
const setupLoggingToFile = require("../utils/files/setupLoggingToFile");
const driverPuppeteer = require("../utils/Puppeteer/driverPuppeteer");
const tiemposCargaPuppeteer = require("../utils/Puppeteer/tiemposCargaPuppeteer");
const capturarErroresConsolaPuppeteer = require("../utils/Puppeteer/capturarErroresConsolaPuppeteer");
const validarDOMPuppeteer = require("../utils/Puppeteer/validarDOMPuppeteer");
//const getDistribuidoraPuppeteer = require("../utils/Puppeteer/getDistribuidoraPuppeteer");
const validarHomeRedirectPuppeteer = require("../utils/Puppeteer/validarHomeRedirectPuppeteer");
const getPageStatusPuppeteer = require("../utils/Puppeteer/getPageStatusPuppeteer");
const seleccionarDistribuidoras = require("../utils/common/seleccionarDistribuidoras");
const verificarCancelacion = require("../utils/common/verificarCancelacion");
const { STORAGE_PATH } = require("../../../config");
const sseBus = require("../../../utils/sseBus");

//Proceso para hacerlo por lotes en los links de cada Distribuidora Puppeter
const startProcessTime = Date.now();
let distribuidoras = [];
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;
let browserDist, browser, homeBrowser;
const ModoTest = true;
const MAX_LOTES_PRUEBA = 2;
//const STORAGE_PATH = path.resolve(process.cwd(), "storage");

async function validacionesPrincipales(
  nameMarca,
  distIds = [],
  sessionId,
  signal,
) {
  try {
    //const nameMarca = "Seat";
    let resultsGeneral = [];
    let resultsDist = [];
    let linksSitemapDist = {};
    const pathSiteMap = "/XMLsitemap.ashx";
    const MAX_PARALLEL_URLS = 10;
    /*
            Tiempos: 
                Lotes de 10:
                    --- Reporte de Tiempo ---
                    Total de Distribuidoras: 2
                    ⏱️ Tiempo total de ejecución: 0 h, 12 min, 53 s
                    ⏱️ Tiempo promedio por Distribuidora: 0 h, 6 min, 27 s
                    ------------------------------------------------------------
    
                    --- Reporte de Tiempo ---
                    Total de Distribuidoras: 2
                    ⏱️ Tiempo total de ejecución: 0 h, 13 min, 14 s
                    ⏱️ Tiempo promedio por Distribuidora: 0 h, 6 min, 37 s
    
                Lotes de 9:
                    --- Reporte de Tiempo ---
                    Total de Distribuidoras: 2
                    ⏱️ Tiempo total de ejecución: 0 h, 14 min, 38 s
                    ⏱️ Tiempo promedio por Distribuidora: 0 h, 7 min, 19 s
                    ------------------------------------------------------------
                
                Lotes de 8:
                    --- Reporte de Tiempo ---
                    Total de Distribuidoras: 2
                    ⏱️ Tiempo total de ejecución: 0 h, 14 min, 55 s
                    ⏱️ Tiempo promedio por Distribuidora: 0 h, 7 min, 28 s
                    ------------------------------------------------------------
    
                Lotes de 5: 
                    --- Reporte de Tiempo ---
                    Total de Distribuidoras: 2
                    ⏱️ Tiempo total de ejecución: 0 h, 16 min, 21 s
                    ⏱️ Tiempo promedio por Distribuidora: 0 h, 8 min, 11 s
                    ------------------------------------------------------------
            */

    sseBus.emit(sessionId, {
      type: "info",
      step: "init",
      message: "Preparando entorno y carpetas...",
    });
    // Crear carpetas
    const RUTAS = await crearCarpetasResultados(
      `${nameMarca}`,
      ["REPORT_DIR"],
      STORAGE_PATH,
    );
    verificarCancelacion(signal, sessionId);
    //Guardado de los logs
    setupLoggingToFile(RUTAS.script_DIR, "ejecucion_logs.txt");
    // Obtener distribuidores
    // browserDist = await driverPuppeteer(true);
    // const pageDist = await browserDist.newPage();
    // await pageDist.setViewport({
    //     width: VIEWPORT_WIDTH,
    //     height: VIEWPORT_HEIGHT,
    // });
    // const pathJson = await getDistribuidoraPuppeteer(
    //     pageDist,
    //     nameMarca,
    //     RUTAS.list_Distri
    // );
    // await browserDist.close();
    // distribuidoras = JSON.parse(fs.readFileSync(path.join(pathJson), "utf-8"));
    // const dirPathJson = path.dirname(pathJson);
    //cleanfiles(dirPathJson, `${nameMarca}_`, `.json`, 2);
    sseBus.emit(sessionId, {
      type: "info",
      step: "load_dist",
      message: "Cargando distribuidoras desde storage/dist...",
    });
    // Ruta fija donde se guardan los JSON de distribuidoras
    const DIST_PATH = path.resolve(process.cwd(), "storage", "dist");
    // Leer todos los archivos en la carpeta dist
    const files = fs.readdirSync(DIST_PATH);
    // Filtrar solo los que corresponden a la marca
    const marcaFiles = files.filter(
      (f) => f.startsWith(nameMarca + "_") && f.endsWith(".json"),
    );
    if (marcaFiles.length === 0) {
      console.log(
        `🛑 No se encontró ningún archivo para la marca ${nameMarca}`,
      );
      sseBus.emit(sessionId, {
        type: "error",
        step: "load_dist",
        message: `No se encontró archivo para la marca ${nameMarca}`,
      });
      return;
    }
    // Ordenar por nombre (como incluye fecha/hora, el último será el más reciente)
    const latestFile = marcaFiles.sort().reverse()[0];
    const filePath = path.join(DIST_PATH, latestFile);
    console.log(`📂 Usando archivo más reciente: ${latestFile}`);
    // Leer el JSON
    distribuidoras = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    console.log("=".repeat(60));
    // Filtrar las distribuidoras recibidas por API
    if (distIds.length > 0) {
      const distIdsStr = distIds.map((id) => id.toString());
      distribuidoras = distribuidoras.filter((d) =>
        distIdsStr.includes(d.idDist),
      );
      //distribuidoras = distribuidoras.filter(d => distIds.includes(Number(d.idDist)));
    }
    if (distribuidoras.length === 0) {
      console.log("🛑 No hay distribuidoras válidas para procesar.");
      sseBus.emit(sessionId, {
        type: "error",
        step: "load_dist",
        message: "No hay distribuidoras válidas para procesar.",
      });
      return;
    }
    // Procesar cada distribuidora
    sseBus.emit(sessionId, {
      type: "info",
      step: "summary",
      message: `Total distribuidoras: ${distribuidoras.length}`,
    });
    let index = 0;
    verificarCancelacion(signal, sessionId);
    for (const dist of distribuidoras) {
      verificarCancelacion(signal, sessionId);
      const itemDist = dist;
      sseBus.emit(sessionId, {
        type: "phase",
        step: "dist_start",
        message: `Procesando distribuidora ${index + 1}/${distribuidoras.length}: ${itemDist.nameDist}`,
      });
      //let estado = { status: 0, message: "No procesado" };
      let resultDistGeneral = {
        idDist: itemDist.idDist,
        nameDist: itemDist.nameDist,
        urlDist: "",
        sitemap: "",
        urlsDuplicadas: [],
        homeRedireccion: "",
        homeUrlSinWWW: null,
        homeUrlConWWW: null,
        homeDestinoSinWWW: null,
        homeDestinoConWWW: null,
        homeError: null,
        domValido: "",
        mensajeError: "",
        ipResuelta: null,
        coincideServidor: false,
        respondePing: false,
        tiempoPing: null,
        statusHttp: null,
        estadoFinal: null,
        sslStatus: "",
        sslCn: "",
        sslSan: [],
        sslValidForHost: false,
        sslValidFrom: "",
        sslValidTo: "",
        sslIssuer: "",
      };
      console.log("=".repeat(50));
      console.log(
        `🔎 Distribuidor #${index + 1} de ${distribuidoras.length}: ${
          itemDist.nameDist
        }`,
      );
      let urlD = itemDist.urlDist;
      // Quitar "www." si está al inicio
      urlD = urlD.replace(/^www\./i, "");
      // Añadir protocolo si no está presente
      if (!urlD.startsWith("http://") && !urlD.startsWith("https://")) {
        urlD = "https://" + urlD;
      }
      resultDistGeneral.urlDist = urlD;
      // === 1. Validación IP ===
      sseBus.emit(sessionId, {
        type: "phase",
        step: "ip",
        message: `Validando IP para ${urlD}...`,
      });
      verificarCancelacion(signal, sessionId);
      try {
        let dominio = urlD;
        //Para la validación de IP hay que quitar el https://
        if (dominio.startsWith("http://") || dominio.startsWith("https://")) {
          dominio = dominio.replace(/^https?:\/\//, "");
        }
        // Validación de IP antes de procesar el sitio
        const resultadoIP = await validarIP(nameMarca, dominio); // función que compara la IP del sitio con tu IP registrada
        sseBus.emit(sessionId, {
          type: "detail",
          step: "ip",
          message: `DNS: ${resultadoIP.ipResuelta} | Ping: ${resultadoIP.respondePing} (${resultadoIP.tiempoPing} ms) | HTTP: ${resultadoIP.statusHttp}`,
        });
        console.log(`🔹 Distribuidora: ${itemDist.nameDist}`);
        console.log(`Dominio: ${dominio}`);
        console.log(`DNS-IP Resuelta: ${resultadoIP.ipResuelta}`);
        console.log(
          `Coincide con servidor registrado: ${resultadoIP.coincideServidor}`,
        );
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
          console.warn(
            `❌ La IP de ${dominio} no coincide con la IP registrada. Se omiten las validaciones principales.`,
          );
          resultDistGeneral.mensajeError =
            "IP no válida / No coincide con servidor registrado.";
          resultsGeneral.push(resultDistGeneral);
          sseBus.emit(sessionId, {
            type: "warn",
            step: "ip",
            message: `IP no coincide con la autorizada. Se omiten validaciones para ${itemDist.nameDist}.`,
          });
          index++;
          continue; // pasar a la siguiente distribuidora
        }
      } catch (error) {
        console.error(
          `❌ Error al validar la IP del sitio: ${itemDist.urlDist}`,
        );
        console.error(`Detalle del error: ${error.message || error}`);
        // Guardar información parcial en el objeto para el reporte
        resultDistGeneral.mensajeError = `Error validando IP: ${
          error.message || error
        }`;
        resultDistGeneral.ipResuelta = null;
        resultDistGeneral.coincideServidor = false;
        resultDistGeneral.respondePing = false;
        resultDistGeneral.tiempoPing = null;
        resultsGeneral.push(resultDistGeneral);
        sseBus.emit(sessionId, {
          type: "error",
          step: "ip",
          message: `Error validando IP: ${error.message}`,
        });
        index++;
        continue; // pasar a la siguiente distribuidora
      }
      // === 2. SSL ===
      sseBus.emit(sessionId, {
        type: "phase",
        step: "ssl",
        message: `Validando certificado SSL...`,
      });
      verificarCancelacion(signal, sessionId);
      try {
        const infoCertSSL = await validarCertificadoSSL(urlD);
        sseBus.emit(sessionId, {
          type: "detail",
          step: "ssl",
          message: `CN: ${infoCertSSL.cn} | Válido: ${infoCertSSL.validForHost} | Vigencia: ${infoCertSSL.validFrom} → ${infoCertSSL.validTo}`,
        });
        console.log(`🔐 Certificado de: ${urlD}`);
        console.log(`- Estado: ${infoCertSSL.sslStatus}`);
        console.log(`- CN: ${infoCertSSL.cn}`);
        console.log(`- SAN: ${infoCertSSL.san.join(", ")}`);
        console.log(
          `- Válido para host: ${infoCertSSL.validForHost ? "✅ Sí" : "❌ No"}`,
        );
        console.log(`- Desde: ${infoCertSSL.validFrom}`);
        console.log(`- Hasta: ${infoCertSSL.validTo}`);
        console.log(`- Emitido por: ${infoCertSSL.issuer}`);
        resultDistGeneral.sslStatus = infoCertSSL.sslStatus;
        resultDistGeneral.sslCn = infoCertSSL.cn;
        resultDistGeneral.sslSan = infoCertSSL.san.join("\n");
        resultDistGeneral.sslValidForHost = infoCertSSL.validForHost
          ? "✅ Sí"
          : "❌ No";
        resultDistGeneral.sslValidFrom = infoCertSSL.validFrom;
        resultDistGeneral.sslValidTo = infoCertSSL.validTo;
        resultDistGeneral.sslIssuer = infoCertSSL.issuer;
      } catch (error) {
        sseBus.emit(sessionId, {
          type: "error",
          step: "ssl",
          message: `Error SSL: ${error.message}`,
        });
        console.error(
          `❌ Error al validar el Certificado SSL del sitio: ${itemDist.urlDist}`,
        );
        console.error(`Detalle del error: ${error.message || error}`);
        // Guardar información parcial en el objeto para el reporte
        resultDistGeneral.mensajeError = `Error validando el Certificado SSL: ${
          error.message || error
        }`;
        resultsGeneral.push(resultDistGeneral);
      }
      // === 3. Redirección Home ===
      sseBus.emit(sessionId, {
        type: "phase",
        step: "home",
        message: `Verificando redirección de Home (www vs sin www)...`,
      });
      verificarCancelacion(signal, sessionId);
      try {
        homeBrowser = await driverPuppeteer(true);
        const pageHome = await homeBrowser.newPage();
        await pageHome.setViewport({
          width: VIEWPORT_WIDTH,
          height: VIEWPORT_HEIGHT,
        });
        const homeValidated = await validarHomeRedirectPuppeteer(
          pageHome,
          urlD,
        );
        let msg = homeValidated
          ? `Ambas versiones redirigen al mismo destino.`
          : `Las versiones con y sin "www." NO redirigen igual.`;
        resultDistGeneral.homeRedireccion = msg;
        resultDistGeneral.homeUrlSinWWW = homeValidated.urlWithoutWWW;
        resultDistGeneral.homeUrlConWWW = homeValidated.urlWithWWW;
        resultDistGeneral.homeDestinoSinWWW = homeValidated.finalUrlWithoutWWW;
        resultDistGeneral.homeDestinoConWWW = homeValidated.finalUrlWithWWW;
        resultDistGeneral.homeError = homeValidated.error;
        sseBus.emit(sessionId, { type: "detail", step: "home", message: msg });
      } catch (error) {
        sseBus.emit(sessionId, {
          type: "error",
          step: "home",
          message: `Error Home: ${error.message}`,
        });
        console.error(
          `❌ Error al validar la Redirección Home del sitio: ${itemDist.urlDist}`,
        );
        console.error(`Detalle del error: ${error}`);
        // Guardar información parcial en el objeto para el reporte
        resultDistGeneral.mensajeError = `Error validando la Redirección Home: ${
          error.message || error
        }`;
        resultsGeneral.push(resultDistGeneral);
      } finally {
        // 4. Cerrar el NAVEGADOR TEMPORAL inmediatamente
        if (homeBrowser) {
          try {
            await homeBrowser.close(); // 🚀 Cierre inmediato del browser de Home
          } catch (e) {
            console.warn(
              `Advertencia: Falló el cierre del homeBrowser para ${itemDist.urlDist}.`,
            );
          }
        }
      }
      // === 4. Sitemap ===
      sseBus.emit(sessionId, {
        type: "phase",
        step: "sitemap",
        message: `Analizando sitemap...`,
      });
      verificarCancelacion(signal, sessionId);
      try {
        console.log(`Validando Sitemap del sitio web: ${urlD}`);
        //Obtener los links del sitemap.
        let linkDistSitemap = urlD + pathSiteMap;
        resultDistGeneral.sitemap = linkDistSitemap;
        linksSitemapDist = await extractSitemapLinks(linkDistSitemap);
        let total = (linksSitemapDist.uniqueUrls || []).length;
        sseBus.emit(sessionId, {
          type: "detail",
          step: "sitemap",
          message: `URLs en sitemap: ${total} | Duplicadas: ${linksSitemapDist.duplicatedUrls?.length || 0}`,
        });
        resultDistGeneral.urlsDuplicadas = linksSitemapDist.duplicatedUrls;
        resultDistGeneral.certificadoSSL_Sitemap = linksSitemapDist.sslStatus;
        if (
          !linksSitemapDist.uniqueUrls ||
          linksSitemapDist.uniqueUrls.length === 0
        ) {
          console.log(
            `❌ El sitemap de ${itemDist.nameDist} no contiene enlaces`,
          );
          resultDistGeneral.mensajeError = `Error: No tiene enlaces el sitemap de la Distribuidora -> ${itemDist.nameDist} `;
          resultsGeneral.push(resultDistGeneral);
          sseBus.emit(sessionId, {
            type: "warn",
            step: "sitemap",
            message: "Sitemap sin enlaces. Se omiten validaciones de páginas.",
          });
          index++;
          continue;
        }
      } catch (error) {
        console.error(
          `❌ Error al validar el sitemap del sitio: ${itemDist.urlDist}`,
        );
        console.error(`Detalle del error: ${error.message || error}`);
        // Guardar información parcial en el objeto para el reporte
        resultDistGeneral.mensajeError = `Error validando el sitemap: ${
          error.message || error
        }`;
        resultsGeneral.push(resultDistGeneral);
        sseBus.emit(sessionId, {
          type: "error",
          step: "sitemap",
          message: `Error sitemap: ${error.message}`,
        });
        index++;
        continue;
      }
      // === 5. Validar URLs del sitemap en lotes paralelos ===
      // Filtrar quitando las que tengan `/Cupra/` y los modelos Cupra en el path
      sseBus.emit(sessionId, {
        type: "phase",
        step: "filter",
        message: "Excluyendo landings Cupra...",
      });
      verificarCancelacion(signal, sessionId);
      console.log("Excluyendo las Landings Cupra...");
      const urlsFiltradas = linksSitemapDist.uniqueUrls.filter((u) => {
        const { pathname } = new URL(u);
        const LandingCupra = [
          "/Cupra/",
          "/NUEVO-FORMENTOR/25",
          "/NUEVO-LEON/25",
          "/NUEVO-TERRAMAR/25",
          "/NUEVO-FORMENTOR-PHEV/25",
          "/ATECA/24",
        ];
        //return !pathname.includes("Cupra");
        // devuelve true si contiene alguno de los textos
        const contienePalabra = LandingCupra.some((word) =>
          pathname.toUpperCase().includes(word.toUpperCase()),
        );
        return !contienePalabra; // nos quedamos solo con los que NO matchean
      });
      sseBus.emit(sessionId, {
        type: "detail",
        step: "filter",
        message: `URLs tras filtro: ${urlsFiltradas.length}`,
      });
      verificarCancelacion(signal, sessionId);
      console.log(`✅ Sitemap contiene ${urlsFiltradas.length} enlaces`);
      //Modo de prueba
      const urlsAProcesar = ModoTest
        ? urlsFiltradas.slice(0, MAX_LOTES_PRUEBA * MAX_PARALLEL_URLS)
        : urlsFiltradas;
      console.log(`🧪 URLs a procesar: ${urlsAProcesar.length}`);
      //Fin modo prueba
      const resultsBatch = [];
      const pages = []; // Ahora manejamos un array de 'pages'
      // 6) Lotes Puppeteer
      verificarCancelacion(signal, sessionId);
      try {
        browser = await driverPuppeteer(true);
        // 1. Crear hasta MAX_PARALLEL_URLS pestañas (pages) dentro de ese navegador
        for (
          let i = 0;
          i < Math.min(MAX_PARALLEL_URLS, urlsAProcesar.length);
          i++
        ) {
          verificarCancelacion(signal, sessionId);
          const page = await browser.newPage();
          await page.setViewport({
            width: VIEWPORT_WIDTH,
            height: VIEWPORT_HEIGHT,
          });
          pages.push(page);
        }
        // === 2. Procesamiento de Lotes ===
        const totalLotes = Math.ceil(urlsAProcesar.length / MAX_PARALLEL_URLS);
        sseBus.emit(sessionId, {
          type: "phase",
          step: "batch",
          message: `Procesando ${urlsAProcesar.length} URLs en ${totalLotes} lote(s)...`,
        });
        console.log(`\n📊 Total de URLs: ${urlsAProcesar.length}`);
        console.log(
          `📦 Se dividirán en ${totalLotes} lote(s), máximo ${MAX_PARALLEL_URLS} por lote`,
        );
        verificarCancelacion(signal, sessionId);
        for (let i = 0; i < urlsAProcesar.length; i += MAX_PARALLEL_URLS) {
          verificarCancelacion(signal, sessionId);
          const batch = urlsAProcesar.slice(i, i + MAX_PARALLEL_URLS);
          const pageBatch = pages.slice(0, batch.length); // Usamos las páginas pre-creadas
          // 🔢 Número de lote actual
          const numeroLoteActual = Math.floor(i / MAX_PARALLEL_URLS) + 1;
          console.log(
            `\n🚀 PROCESANDO LOTE ${numeroLoteActual} de ${totalLotes}...`,
          );
          console.log(`🔗 URLs en este lote (${batch.length}):`);
          batch.forEach((url, idx) => {
            console.log(`   [${idx + 1}] ${url}`);
          });
          sseBus.emit(sessionId, {
            type: "phase",
            step: "batch_lote",
            message: `Lote ${numeroLoteActual}/${totalLotes} (${batch.length} URLs)`,
          });
          const promises = batch.map(async (url, idx) => {
            // Asignamos una 'page' del lote a la URL
            const page = pageBatch[idx];
            const resultSitioDist = {
              idDist: itemDist.idDist,
              nameDist: itemDist.nameDist,
              urlSitio: url,
              statusURL: "",
              statusMensaje: null,
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
            verificarCancelacion(signal, sessionId);
            try {
              // 1. Capturar Errores (debe ser la nueva función para Puppeteer)
              await capturarErroresConsolaPuppeteer(page);
              // 2. Navegar a la URL
              const response = await page.goto(url, {
                waitUntil: "networkidle2",
                timeout: 60000,
              });
              // 3. Recuperar los errores de Consola después de la navegación
              const erroresConsola = page._capturedConsoleMessages;
              // 4. Procesar los resultados de consola
              if (erroresConsola.length > 0) {
                resultSitioDist.Error_consola = erroresConsola
                  .map((err) => `[${err.type}] ${err.text}`)
                  .join(" | ");
              }
              const status = response ? response.status() : 0;
              sseBus.emit(sessionId, {
                type: "detail",
                step: "batch_url",
                message: `[${status}] ${url}`,
              });
              verificarCancelacion(signal, sessionId);
              // 5. Obtener el Estatus HTTP
              if (response) {
                resultSitioDist.statusURL = response.status();
                resultSitioDist.statusMensaje = response.statusText();
                if (response.status() >= 200 && response.status() < 400) {
                  console.log(
                    `\n✅ [${response.status()}] OK: ${url}. Continuando con las validaciones DOM y tiempos de carga.`,
                  );
                  resultSitioDist.statusMensaje = `OK. Continuando con las validaciones DOM y tiempos de carga.`;
                }
                // Salta el resto de validaciones si no fue 200/300, etc.
                if (response.status() >= 400 || response.status() === 0) {
                  console.error(
                    `\n❌ [${response.status()}] Error: ${response.statusText()} en ${url}.`,
                  );
                  resultSitioDist.statusMensaje = `Error: ${response.statusText()}.`;
                  return resultSitioDist;
                }
              } else {
                // Esto solo ocurre en raras ocasiones si la conexión se establece pero no devuelve encabezados
                resultSitioDist.statusURL = 0;
                resultSitioDist.statusMensaje =
                  "Conexión incompleta/Sin respuesta de encabezado";
                return resultSitioDist;
              }
              verificarCancelacion(signal, sessionId);
              // 6. Medir tiempos de carga y validar DOM
              const tiemposCarga = await tiemposCargaPuppeteer(page);
              resultSitioDist.TiempoCargaDOM = `${tiemposCarga.tiempoDOM.ms} ms (${tiemposCarga.tiempoDOM.s} s)`;
              resultSitioDist.TiempoCargaTotal = `${tiemposCarga.tiempoTotal.ms} ms (${tiemposCarga.tiempoTotal.s} s)`;
              sseBus.emit(sessionId, {
                type: "detail",
                step: "batch_timing",
                message: `DOM: ${tiemposCarga.tiempoDOM.ms} ms | Total: ${tiemposCarga.tiempoTotal.ms} ms`,
              });
              verificarCancelacion(signal, sessionId);
              const datosDOM = await validarDOMPuppeteer(page);
              datosDOM.errores.forEach((err) => {
                if (resultSitioDist.hasOwnProperty(err.tipo)) {
                  resultSitioDist[err.tipo] = err.detalle || "";
                }
              });
              if (datosDOM.errores?.length) {
                sseBus.emit(sessionId, {
                  type: "warn",
                  step: "batch_dom",
                  message: `Errores DOM en ${url}: ${datosDOM.errores.length}`,
                });
              }
            } catch (error) {
              sseBus.emit(sessionId, {
                type: "error",
                step: "batch_url",
                message: `Error en ${url}: ${error.message}`,
              });
              console.log(`Error Revisando el sitio: ${url}, ${error}`);
              console.log("-".repeat(50));
              // Asignar el código de error (normalmente 0)
              resultSitioDist.statusURL = 0;

              // Captura el mensaje detallado de Puppeteer:
              if (error.name === "TimeoutError") {
                resultSitioDist.statusMensaje = `Timeout (El sitio no respondió en el tiempo límite de Puppeteer): ${error.message}`;
              } else {
                // Error de red, conexión cerrada, dominio no resuelto, etc.
                resultSitioDist.statusMensaje = `Error de red/conexión: ${error.message}`;
              }
              resultSitioDist.Error_general = error.message;
            }
            return resultSitioDist;
          });

          const results = await Promise.all(promises);
          resultsBatch.push(...results);
        }
      } catch (error) {
        console.error(`Error procesando URLs de ${itemDist.nameDist}:`, error);
        sseBus.emit(sessionId, {
          type: "error",
          step: "batch",
          message: `Error procesando lotes: ${error.message}`,
        });
      } finally {
        if (browser) {
          try {
            await browser.close();
          } catch (err) {
            console.error("Error al cerrar el navegador Puppeteer:", err);
          }
        }
      }
      // Consolidación por distribuidora
      sseBus.emit(sessionId, {
        type: "phase",
        step: "dist_done",
        message: `Distribuidora ${itemDist.nameDist} finalizada.`,
      });
      verificarCancelacion(signal, sessionId);
      resultsDist.push(...resultsBatch);
      resultsGeneral.push(resultDistGeneral);
      index++;
    }
    //console.table(resultsGeneral);
    //console.table(resultsDist);
    // console.log("Resultados Generales: ");
    // console.log(resultsGeneral);
    // console.log("-".repeat(50));
    // console.log("Resultados por sitio: ");
    // console.log(resultsDist);
    //Guardar Reporte de ejecucion
    //Guardar Reporte de ejecucion
    sseBus.emit(sessionId, {
      type: "phase",
      step: "excel",
      message: "Guardando resultados en Excel...",
    });
    verificarCancelacion(signal, sessionId);
    const dateExcel = new Date()
      .toISOString() // "2025-04-05T14:30:25.123Z"
      .slice(0, 19) // "2025-04-05T14:30:25"
      .replace("T", "_") // "2025-04-05_14:30:25"
      .replace(/:/g, "-"); // "2025-04-05_14-30-25"
    console.log(`\n\n📝 Guardando resultados en Excel...`);
    const excelPath = path.join(RUTAS.REPORT_DIR, `Reporte_${dateExcel}.xlsx`);
    await saveReportDetalles(resultsGeneral, resultsDist, excelPath);
    //cleanfiles(RUTAS.REPORT_DIR, `Reporte_`, `.xlsx`, 5);
    sseBus.emit(sessionId, {
      type: "done",
      step: "finish",
      message: "Proceso finalizado.",
      payload: {
        excelPath,
        logs: path.join(RUTAS.script_DIR, "ejecucion_logs.txt"),
      },
    });
    console.log("-".repeat(50));
    return {
      Excel: excelPath,
      namelogs: "ejecucion_logs.txt",
      rutaLogs: RUTAS.script_DIR,
    };
  } catch (error) {
    console.error(`❌ Error en la ejecución del script: ${error}`);
    sseBus.emit(sessionId, {
      type: "error",
      step: "fatal",
      message: `Error en la ejecución: ${error.message}`,
    });
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
    console.log("Proceso Finalizado.\n Navegador de Puppeteer cerrado.");
  }
}

module.exports = { validacionesPrincipales };

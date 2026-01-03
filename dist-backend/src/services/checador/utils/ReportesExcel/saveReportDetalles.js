const fs = require("fs");
const ExcelJS = require("exceljs");
const sheetStyles = require("./styleExcel");

async function saveReportDetalles(resultadosGenerales,resultadosDetalles, filePath) {
    try {
        const workbook = new ExcelJS.Workbook();

        // ---------------- Hoja 1: Resultados Generales ----------------
        const sheetGeneral = workbook.addWorksheet("Resultados Generales");
        // Añadir tabla con encabezados y datos de manera manual
        sheetGeneral.columns = [
            { header: "DistID", key: "idDist" },
            { header: "Distribuidora", key: "nameDist" },
            { header: "SitioWeb", key: "urlDist" },
            { header: "sitemap", key: "sitemap" },
            { header: "Urls duplicadas en el sitemap", key: "urlsDuplicadas" },

            { header: "Home redirección", key: "homeRedireccion" },
            { header: "Home sin www", key: "homeUrlSinWWW" },
            { header: "Redirección Home sin www", key: "homeDestinoSinWWW" },
            { header: "Home con www", key: "homeUrlConWWW" },
            { header: "Redirección Home con www", key: "homeDestinoConWWW" },
            //{ header: "Estatus Error Home", key: "homeError" },

            { header: "IP del sitio web (DNS)", key: "ipResuelta" },
            { header: "Coincide con IP Servidor", key: "coincideServidor" },
            { header: "Ping al dominio", key: "respondePing" },
            { header: "Tiempo de respuesta Ping (ms)", key: "tiempoPing" },
            { header: "Status HTTP", key: "statusHttp" },
            { header: "Resultado Validación", key: "estadoFinal" },

            { header: "Estatus de Certificado SSL", key: "sslStatus" },
            { header: "CN (Common Name)", key: "sslCn" },
            { header: "SAN (Subject Alternative Names)", key: "sslSan" },
            { header: "Válido para el Host (Dominio)", key: "sslValidForHost" },
            { header: "Válido Desde:", key: "sslValidFrom" },
            { header: "Válido Hasta:", key: "sslValidTo" },
            { header: "Emitido por:", key: "sslIssuer" },
            
            { header: "Observaciones", key: "mensajeError" },
        ];
        // Agrega filas
        resultadosGenerales.forEach((item) => {
            sheetGeneral.addRow({
                idDist: item.idDist,
                nameDist: item.nameDist,
                urlDist: item.urlDist,
                sitemap: item.sitemap,
                urlsDuplicadas: item.urlsDuplicadas,
                LandingCupra: item.LandingCupra,                
                homeRedireccion: item.homeRedireccion,
                homeUrlSinWWW: item.homeUrlSinWWW,
                homeUrlConWWW: item.homeUrlConWWW,
                homeDestinoSinWWW: item.homeDestinoSinWWW,
                homeDestinoConWWW: item.homeDestinoConWWW,
                //homeError: item.homeError,
                ipResuelta: item.ipResuelta,
                coincideServidor: item.coincideServidor,
                respondePing: item.respondePing,
                tiempoPing: item.tiempoPing,
                statusHttp: item.statusHttp,
                estadoFinal: item.estadoFinal,

                sslStatus: item.sslStatus,
                sslCn: item.sslCn,
                sslSan: item.sslSan,
                sslValidForHost: item.sslValidForHost,
                sslValidFrom: item.sslValidFrom,
                sslValidTo: item.sslValidTo,
                sslIssuer: item.sslIssuer,

                mensajeError: item.mensajeError,
            });
        });

        // ---------------- Hoja 2: Resultados Generales ----------------
        const sheetDetalles = workbook.addWorksheet("Resultados Detalles");
        
         // Añadir tabla con encabezados y datos de manera manual
        sheetDetalles.columns = [
            { header: "DistID", key: "idDist" },
            { header: "Distribuidora", key: "nameDist" },
            { header: "Sitio Web", key: "urlSitio" },
            { header: "Estatus HTTP", key: "statusURL" },
            { header: "Mensaje Estatus HTTP", key: "statusMensaje" },
            { header: "Tiempo de Carga DOM", key: "TiempoCargaDOM" },
            { header: "Tiempo de Carga Total", key: "TiempoCargaTotal" },
            { header: "Imagen rota", key: "Imagen_rota" },
            { header: "Texto No visble", key: "Texto" },
            { header: "Enlace inválido", key: "Enlace_invalido" },
            { header: "Título de página", key: "Titulo" },
            { header: "Etiqueta Meta", key: "Etiqueta_Meta" },
            { header: "Enlace externo inválido", key: "Enlace_externo_invalido" },    
            { header: "Error consola", key: "Error_consola" },
            { header: "Error al Validar DOM", key: "Error_general" },            
        ];
        // Agrega filas
        resultadosDetalles.forEach((item) => {
            sheetDetalles.addRow({
                idDist: item.idDist,
                nameDist: item.nameDist,
                urlSitio: item.urlSitio,
                statusURL: item.statusURL,
                statusMensaje: item.statusMensaje,
                TiempoCargaDOM:item.TiempoCargaDOM,
                TiempoCargaTotal:item.TiempoCargaTotal,
                Imagen_rota: item.Imagen_rota,
                Texto: item.Texto,
                Enlace_invalido: item.Enlace_invalido,
                Titulo:item.Titulo,
                Etiqueta_Meta:item.Etiqueta_Meta,
                Enlace_externo_invalido:item.Enlace_externo_invalido,
                Error_consola: item.Error_consola,
                Error_general:item.Error_general
            });
        });

        await sheetStyles(sheetGeneral);
        await sheetStyles(sheetDetalles);

        // console.log("✅ [DEBUG Final] Guardando archivo Excel en:", filePath);
        // console.log(
        //   "👉 [DEBUG Final] Total de filas en hoja Comparaciones Visuales:",
        //   sheetGeneral.rowCount
        // );
        if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        }
        await workbook.xlsx.writeFile(filePath);
        console.log("✅ Comparaciones guardadas en Excel:", filePath);
    } catch (error) {
        console.error("❌ Error al guardar Excel:", error);
    }
}



module.exports = saveReportDetalles;

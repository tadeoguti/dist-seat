const fs = require("fs");
const ExcelJS = require("exceljs");
const sheetStyles = require("./styleExcel");

async function saveExcelVisual(resultadosGenerales, Resultados, filePath) {
    try {
        const workbook = new ExcelJS.Workbook();

         // ---------------- Hoja 1: Resultados Generales ----------------
        const sheetGeneral = workbook.addWorksheet("Resultados Generales");
        // Añadir tabla con encabezados y datos de manera manual
        sheetGeneral.columns = [
            { header: "DistID", key: "idDist" },
            { header: "Distribuidora", key: "nameDist" },
            { header: "Sitio Web", key: "urlDist" },
            { header: "Sitemap", key: "sitemap" },
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
            { header: "Detalles del Error", key: "mensajeError" },
        ];
        // Agrega filas
        resultadosGenerales.forEach((item) => {
            sheetGeneral.addRow({
                idDist: item.idDist,
                nameDist: item.nameDist,
                urlDist: item.urlDist,
                sitemap: item.sitemap,
                urlsDuplicadas: item.urlsDuplicadas,
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

        // ---------------- Hoja 2: Resultados Visuales----------------
        const sheetDetalles = workbook.addWorksheet("Resultados Visuales");
        
         // Añadir tabla con encabezados y datos de manera manual
        sheetDetalles.columns = [
            { header: "DistID", key: "idDist" },
            { header: "Distribuidora", key: "nameDist" },
            { header: "Sitio Base", key: "urlSitioBase" },
            { header: "Sitio Comparado", key: "urlSitio" },
            { header: "Porcentaje de Similitud", key: "similitudVisual" },
            { header: "Observaciones de Similitud", key: "mensajeVisual" },
            { header: "imagen Diferencias", key: "evidenciaDiff" },
            { header: "Dispositivo Emulado", key: "Device" },
            { header: "Resolución de imagen completa", key: "dimensionesImg" },
            { header: "Tiempo de Carga DOM", key: "TiempoCargaDOM" },
            { header: "Tiempo de Carga Total", key: "TiempoCargaTotal" },
            { header: "Error Detalles", key: "Error_general" },            
        ];
        // Agrega filas
        Resultados.forEach((item) => {
            sheetDetalles.addRow({
                idDist: item.idDist,
                nameDist: item.nameDist,
                urlSitioBase: item.urlSitioBase,
                urlSitio: item.urlSitio,
                similitudVisual: item.similitudVisual,
                mensajeVisual: item.mensajeVisual,
                evidenciaDiff: item.evidenciaDiff,
                Device: item.Device,
                dimensionesImg: item.dimensionesImg,
                TiempoCargaDOM:item.TiempoCargaDOM,
                TiempoCargaTotal:item.TiempoCargaTotal,
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



module.exports = saveExcelVisual;

const MailService = require('./sendEmail');
class SendToDistributor{

    async enviar(reqDto){

        let lsEnviaEmail = 'jzatarain@exagono.net'; // 
        try
        {
            var lsBody = "";
            let lsLineaNotificacion = reqDto.lsLineaNotificacion;//TipoF + " / " + DTSolicitud.ConsecutivoDisId.ToString() + " | " + DTSolicitud.SolicitudId.ToString() + " | Envia: " + lsEnviaEmail + " | Recibe: " + DTCliente.Email; ;
            let strsubject = reqDto.strsubject;
            let lsDirLog = "dirlog";
            let TipoF = reqDto.TipoSolicitud;
            
            let TxtTipoF = "";
            let lsEnviaEmail = "";

            if (reqDto.TipoSolicitud == "COT")
            {
                TxtTipoF = "Cotizacion";
                //lsDirLog = DTFunciones.Keys('\Logs\Cotizacion\Notificaciones\log');
                lsEnviaEmail = (reqDto.Tipo == 1 ? (reqDto.dataDist.Distribuidor[0].MailCotizaciones != "" ? reqDto.dataDist.Distribuidor[0].MailCotizaciones : reqDto.dataDist.Distribuidor[0].MailGral) : (reqDto.dataDist.Distribuidor[0].MailSeminuevos != "" ? reqDto.dataDist.Distribuidor[0].MailSeminuevos : reqDto.dataDist.Distribuidor[0].MailGral));
            }
            else if (reqDto.TipoSolicitud == "PM")
            {
                TxtTipoF = "Prueba de Manejo";
                //lsDirLog = DTFunciones.Keys("logRegPMC");
                lsEnviaEmail = (reqDto.dataDist.Distribuidor[0].MailPruebadeManejo != "" ? reqDto.dataDist.Distribuidor[0].MailPruebadeManejo : reqDto.dataDist.Distribuidor[0].MailGral);
            }
            else if (reqDto.TipoSolicitud == "COM")
            {
                TxtTipoF = "Comentario";
                //lsDirLog = DTFunciones.Keys("logRegComC");
                lsEnviaEmail = reqDto.dataDist.Distribuidor[0].MailGral;
            }
            else if (reqDto.TipoSolicitud == "SER")
            {
                TxtTipoF = "Cita de Servicio";
                //lsDirLog = DTFunciones.Keys("logRegSerC");
                lsEnviaEmail = (reqDto.dataDist.Distribuidor[0].MailCitadeServicio != "" ? reqDto.dataDist.Distribuidor[0].MailCitadeServicio : reqDto.dataDist.Distribuidor[0].MailGral);
            }

            reqDto.strsubject = TxtTipoF + " Recibida - " + reqDto.Marca + " " + reqDto.Modelo + " #" + reqDto.dataInsertedCotization.consecutivoDisID;
            reqDto.lsLineaNotificacion = reqDto.TipoSolicitud + " / " + reqDto.dataInsertedCotization.consecutivoDisID + " | " + reqDto.dataInsertedCotization.solicitudID + " | Envia: " + lsEnviaEmail + " | Recibe: " + reqDto.Email;
            lsLineaNotificacion = reqDto.lsLineaNotificacion;
            if (reqDto.Tipo == 0) reqDto.strsubject += " [SEMINUEVOS]";


           switch (TipoF)
            {
                case "COT":
                    lsBody = await MailService.ArmaBodyCOT
                    (   reqDto,
                        "mailDatos.html",
                        reqDto.FullName,
                        1,
                        reqDto.dataInsertedCotization.AsesorEmailSalida,
                        1,
                        reqDto.dataInsertedCotization.AsesorNomSalida
                    );
                    break;
                case "PM":
                    lsBody = await MailService.ArmaBodyPM
                    (
                        reqDto,
                        "mailDatos.html",
                        reqDto.FullName,
                        1,
                        reqDto.dataInsertedCotization.AsesorEmailSalida,
                        1,
                        reqDto.dataInsertedCotization.AsesorNomSalida
                    );
                    break;
                case "COM":
                    lsBody = MailService.ArmaBodyCOT
                    (
                        reqDto,
                        "mailDatos.html",
                        reqDto.FullName,
                        1,
                        reqDto.dataInsertedCotization.AsesorEmailSalida,
                        1,
                        reqDto.dataInsertedCotization.AsesorNomSalida
                    );
                    break;
                case "SER":
                    lsBody = MailService.ArmaBodyCOT
                    (
                        reqDto,
                        "mailDatos.html",
                        reqDto.FullName,
                        1,
                        reqDto.dataInsertedCotization.AsesorEmailSalida,
                        1,
                        reqDto.dataInsertedCotization.AsesorNomSalida
                    );
                    break;
            }

            let data = {
                toEmail:'jzatarain@exagono.net', //reqDto.dataDist.Distribuidor[0].MailGral,
                nombreComercial:reqDto.dataDist.Distribuidor[0].NombreComercial,
                toNombre: reqDto.FullName,
                fromEmail: 'jzatarain@exagono.net', //reqDto.dataDist.Distribuidor[0].MailGral,
                subject:strsubject,
                body: lsBody,
                disUrl:reqDto.dataDist.Distribuidor[0].Url,
                lineaNotificacion:lsLineaNotificacion,
                dirLog:lsDirLog,
                disID:reqDto.DisID,
                marca:reqDto.Marca,
                tipoSolicitud:TipoF
            }
            let result = await MailService.enviaMailWSR(data);
         } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = SendToDistributor;
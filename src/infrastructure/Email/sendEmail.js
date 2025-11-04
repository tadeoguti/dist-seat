const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

class MailService {
    constructor() {
      //this.URI = "http://wsmail.netcar.com.mx/WS/WSMail.asmx/SendMail";
    }

    encodeParams(params) {
      return new URLSearchParams(params).toString();
    }

    async enviaMailWSR({
        toEmail,
        nombreComercial,
        toNombre,
        fromEmail,
        subject,
        body,
        disUrl,
        lineaNotificacion,
        dirLog,
        disID,
        marca,
        tipoSolicitud
    }) {
      const URI = "http://wsmail.netcar.com.mx/WS/WSMail.asmx/SendMail";

      const bodyParams = this.encodeParams({
          toEmail,
          nombreComercial,
          fromEmail,
          subject,
          logLine: lineaNotificacion,
          disID,
          marca,
          tipoSolicitud,
          body
      });

      try {
          const response = await fetch(URI, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: bodyParams
          });

          const responseText = await response.text();

          if (!response.ok) {
              console.error(`Error HTTP: ${response.status}`);
              console.error("Respuesta del servicio:", responseText);
              return "Error al enviar correo";
          }

          // Opcional: log de respuesta
          // console.log("Respuesta del WS:", responseText);

          return "Correo enviado con éxito";
      } catch (error) {
          console.error("Error al enviar Mail:", error);
          return "Error al enviar correo";
      }
    }

    textoFooter(tipoSol, esEnvioCliente) {
      let strreturn = "";

      if (esEnvioCliente) {
          if (tipoSol === "COT") {
              strreturn += "Gracias de nuevo por tu interés, estamos seguros que tu automóvil también lo agradecerá. " +
                  "Si tienes dudas o requieres ayuda no dudes en contactarnos:";
          }
          if (tipoSol === "COM") {
              strreturn += "Gracias de nuevo por tu comentario, estamos seguros que tu automóvil también lo agradecerá. " +
                  "Si tienes dudas o requieres ayuda no dudes en contactarnos:";
          }
          if (tipoSol === "COMPRA") {
              strreturn += "Gracias de nuevo por tu compra, estamos seguros que tu automóvil también lo agradecerá. " +
                  "Si tienes dudas o requieres ayuda no dudes en contactarnos:";
          }
          if (tipoSol === "SER") {
              strreturn += "Gracias de nuevo por tu cita, estamos seguros que tu automóvil también lo agradecerá. " +
                  "Si tienes dudas o requieres ayuda no dudes en contactarnos:";
          }
      } else {
          // Envío a sucursal
          strreturn = "Contactar al cliente para dar seguimiento.";
      }

      return strreturn;
    }

    armaCliente(tipoSol, itemObj) {
        let strreturn = "";

        // Simulación de FirstOrDefault() => tomamos el primer elemento o vacío
        let cliente = { nombreCompleto: "", mail: "", telefono: "" };
        if(itemObj!==undefined){
          if(itemObj.length > 0){
            cliente = itemObj[0];
          }
        } 

        const nombreCompletoCliente = reqDto.FullName;
        const emailCliente = cliente.mail;
        const telefonoCliente = cliente.telefono;

        // Espaciado
        strreturn += "<tr>";
        strreturn += "  <td width='100%' height='50' bgcolor='white' align ='center'>";
        strreturn += "      <p></p>";
        strreturn += "  </td>";
        strreturn += "</tr>";

        // Información del Cliente
        strreturn += "<tr>";
        strreturn += "<td width='100%' height='100' bgcolor='white' align ='center' >";
        strreturn += "<table width='70%' border='0' cellspacing='0' cellpadding='3' >";
        strreturn += "<tbody>";

        strreturn += "<tr>";
        strreturn += "  <td width='50%'>";
        strreturn += "      <p style='font-size: 14px;color: black;font-weight: bold;' align='center'><b>Nombre:</b></p>";
        strreturn += "  </td>";
        strreturn += "  <td width='50%' style='text-align: left;'>";
        strreturn += "      <p style='font-size: 14px;color: black;font-weight: bold;' align='left'><b>" + nombreCompletoCliente + "</b></p>";
        strreturn += "  </td>";
        strreturn += "</tr>";

        strreturn += "<tr>";
        strreturn += "  <td width='50%'>";
        strreturn += "      <p style='font-size: 14px;color: black;font-weight: bold;' align='center'><b>Email:</b></p>";
        strreturn += "  </td>";
        strreturn += "  <td width='50%'>";
        strreturn += "      <p style='font-size: 14px;color: #ed2201 !important;font-weight: bold;' align='left'><b>" + emailCliente + "</b></p>";
        strreturn += "  </td>";
        strreturn += "</tr>";

        strreturn += "<tr>";
        strreturn += "  <td width='50%'>";
        strreturn += "      <p style='font-size: 14px;color: black;font-weight: bold;' align='center'><b>Teléfono:</b></p>";
        strreturn += "  </td>";
        strreturn += "  <td width='50%'>";
        strreturn += "      <p style='font-size: 14px;color: black;font-weight: bold;' align='left'><b>" + telefonoCliente + "</b></p>";
        strreturn += "  </td>";
        strreturn += "</tr>";

        strreturn += "</tbody>";
        strreturn += "</table>";
        strreturn += "</td>";
        strreturn += "</tr>";

        return strreturn;
    }

    TablaCorreo(reqDto,Tiposol, EmailPara, status) {
      var strreturn = "";

      if (Tiposol == "COT")
      {
          if (EmailPara == 1 && status == 1)//CLIENTE INGRESO
          {
              strreturn += "<tr>";
              strreturn += "<td width='100%' height='300' bgcolor='white' align ='center' >";
              strreturn += "<table width='90%' border='0' cellspacing='0' cellpadding='3' >";
              strreturn += "<tbody>";
              strreturn += "<tr>";
              strreturn += "  <td width='50%'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Modelo + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Version + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><img src='https://" + reqDto.Url + "/Assets/img/correo/" + reqDto.ClaveGen + ".jpg' /></ p >";
              strreturn += "  </td>";
              strreturn += "  <td width='50%' style='text-align: left;'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>Cliente</b></'p'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.FullName + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Email + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Phone + "</b></p>";
              //Boton Cotizalo y manejalo
              if (reqDto.ClaveGen != "VPOL24")
              {
                  strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 11px;color: black;' align='center'><a href='" + reqDto.Url + "/" + reqDto.Modelo.replace(/ /g, "-") + "/" + reqDto.Anio + "/' ><img src='https://" + reqDto.Url + "/Assets/img/btn-conocelo.jpg'></a></p>";
                  strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 11px;color: black;' align='center'><a href='" + reqDto.Url + "/" + reqDto.Modelo.replace(/ /g, "-") + "/" + reqDto.Anio + "/Pruebademanejo/' ><img src='https://" + reqDto.Url + "/Assets/img/btn-manejalo.jpg'></a></p>";

              }
              strreturn += "  </td>";
              strreturn += "</tr>";
              strreturn += "</tbody>";
              strreturn += "</table>";
              strreturn += "<p style='font-family: \"Century Gothic\", CenturyGothic, AppleGothic, sans-serif; font-size: 16px; color: #000000; text-align: center; font-weight: bold;' >La llamada de tu asesor esta en camino, ¡espéralo!</p>";
              strreturn += "</td>";
              strreturn += "</tr>";
          }
          else if (EmailPara == 7)//ASESOR
          {
              strreturn += "<tr>";
              strreturn += "<td width='100%' height='300' bgcolor='white' align ='center' >";
              strreturn += "<table width='90%' border='0' cellspacing='0' cellpadding='3' >";
              strreturn += "<tbody>";
              strreturn += "<tr>";
              strreturn += "  <td width='50%'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Modelo + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Version + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><img src='https://" + reqDto.Url + "/Assets/img/correo/" + reqDto.ClaveGen + ".jpg' /></ p >";
              strreturn += "  </td>";
              strreturn += "  <td width='50%' style='text-align: left;'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>Cliente</b></'p'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.FullName + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Email + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Phone + "</b></p>";
              //Datos de compra
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Comentarios + "</b></p>";
              if (!(reqDto.CotPlazo == null || reqDto.CotPlazo == '') && reqDto.CotPlazo != 0 && reqDto.CotPlazo != '0')
              {
                  strreturn += "  <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>Plazo: </b><b style='color:#001D50;'>" + reqDto.CotPlazo + "</b></p>";
              }
              if (!(reqDto.CotEnganche == null || reqDto.CotEnganche == '') && reqDto.CotEnganche != "0" && reqDto.CotEnganche != 0 )
              {
                  strreturn += "  <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>Enganche:</b><b style='color:#001D50;'>" + reqDto.CotEnganche + "</b></p>";
              }
              if (!(reqDto.CotMensualidad == null || reqDto.CotMensualidad == '') && reqDto.CotMensualidad != "0" && reqDto.CotMensualidad != 0)
              {
                  strreturn += "  <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>Mensualidad:</b><b style='color:#001D50;'>" + reqDto.CotMensualidad + "</b></p>";
              }
              //
              strreturn += "  </td>";
              strreturn += "</tr>";
              strreturn += "</tbody>";
              strreturn += "</table>";
              strreturn += "</td>";
              strreturn += "</tr>";
          }
          else
          {
              strreturn += "<tr>";
              strreturn += "<td width='100%' height='300' bgcolor='white' align ='center' >";
              strreturn += "<table width='90%' border='0' cellspacing='0' cellpadding='3' >";
              strreturn += "<tbody>";
              strreturn += "<tr>";
              strreturn += "  <td width='50%'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Modelo + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Version + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><img src='https://" + reqDto.Url + "/Assets/img/correo/" + reqDto.ClaveGen + ".jpg' /></ p >";
              strreturn += "  </td>";
              strreturn += "  <td width='50%' style='text-align: left;'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>Cliente</b></'p'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.FullName + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Email + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Phone + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Comentarios + "</b></p>";
              strreturn += "  </td>";
              strreturn += "</tr>";
              strreturn += "</tbody>";
              strreturn += "</table>";
              strreturn += "</td>";
              strreturn += "</tr>";
          }
      }
      else if (Tiposol == "PM")
      {
          if ((EmailPara == 1 && status == 1) || EmailPara == 4 || EmailPara == 5)//CLIENTE INGRESO
          {
              strreturn += "<tr>";
              strreturn += "<td width='100%' height='300' bgcolor='white' align ='center' >";
              strreturn += "<table width='90%' border='0' cellspacing='0' cellpadding='3' >";
              strreturn += "<tbody>";
              strreturn += "<tr>";
              strreturn += "  <td width='50%'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Modelo + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Version + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><img src='https://" + reqDto.Url + "/Assets/img/correo/" + DTSolicitud.ClaveGen + ".jpg' /></ p >";
              strreturn += "  </td>";
              strreturn += "  <td width='50%' style='text-align: left;'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>Cliente</b></'p'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.FullName + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Email + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Phone + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 11px;color: black;' align='center'><a href='" + reqDto.Url + "/" + reqDto.Modelo.replace(/ /g, "-") + "/" + reqDto.Anio + "/' ><img src='https://" + reqDto.Url + "/Assets/img/btn-conocelo.jpg'></a></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 11px;color: black;' align='center'><a href='" + reqDto.Url + "/" + reqDto.Modelo.replace(/ /g, "-") + "/" + reqDto.Anio + "/Pruebademanejo/' ><img src='https://" + reqDto.Url + "/Assets/img/btn-manejalo.jpg'></a></p>";
              strreturn += "  </td>";
              strreturn += "</tr>";
              strreturn += "</tbody>";
              strreturn += "</table>";
              strreturn += "</td>";
              strreturn += "</tr>";
          }
          if (EmailPara == 7)//CLIENTE INGRESO
          {
              strreturn += "<tr>";
              strreturn += "<td width='100%' height='300' bgcolor='white' align ='center' >";
              strreturn += "<table width='90%' border='0' cellspacing='0' cellpadding='3' >";
              strreturn += "<tbody>";
              strreturn += "<tr>";
              strreturn += "  <td width='50%'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Modelo + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Version + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><img src='https://" + reqDto.Url + "/Assets/img/correo/" + DTSolicitud.ClaveGen + ".jpg' /></ p >";
              strreturn += "  </td>";
              strreturn += "  <td width='50%' style='text-align: left;'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>Cliente</b></'p'>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.FullName + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Email + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Phone + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Comentarios + "</b></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 11px;color: black;' align='center'><a href='" + reqDto.Url + "/" + reqDto.Modelo.replace(/ /g, "-") + "/" + reqDto.Anio + "/' ><img src='https://" + reqDto.Url + "/Assets/img/btn-conocelo.jpg'></a></p>";
              strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 11px;color: black;' align='center'><a href='" + reqDto.Url + "/" + reqDto.Modelo.replace(/ /g, "-") + "/" + reqDto.Anio + "/Pruebademanejo/' ><img src='https://" + reqDto.Url + "/Assets/img/btn-manejalo.jpg'></a></p>";
              strreturn += "  </td>";
              strreturn += "</tr>";
              strreturn += "</tbody>";
              strreturn += "</table>";
              strreturn += "</td>";
              strreturn += "</tr>";
          }
      }
      else if (Tiposol == "SER")
      {
          strreturn += "<tr>";
          strreturn += "<td width='100%' height='300' bgcolor='white' align ='center' >";
          strreturn += "<table width='90%' border='0' cellspacing='0' cellpadding='3' >";
          strreturn += "<tbody>";
          strreturn += "<tr>";
          strreturn += "  <td width='50%'>";
          strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Modelo + " " + reqDto.Anio + "</b></p>";
          strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>Fecha: " + reqDto.DateReservation + "</b></p>";
          strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>Hora: " + reqDto.DateReservation + "</b></p>";
          strreturn += "  </td>";
          strreturn += "  <td width='50%' style='text-align: left;'>";
          strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>Cliente</b></'p'>";
          strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.FullName + "</b></p>";
          strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Email + "</b></p>";
          strreturn += "      <p style='font-family: Verdana, Geneva, sans-serif;font-size: 14px;color: black;font-weight: bold;' align='center'><b>" + reqDto.Phone + "</b></p>";
          strreturn += "  </td>";
          strreturn += "</tr>";
          strreturn += "</tbody>";
          strreturn += "</table>";
          strreturn += "<p style='font-family: \"Century Gothic\", CenturyGothic, AppleGothic, sans-serif; font-size: 16px; color: #000000; text-align: center; font-weight: bold;' >¡Gracias por su preferencia!</p>";
          //if (EmailPara == 1 || EmailPara == 2 || EmailPara == 3 || EmailPara == 6 || EmailPara == 7)
          //{
          strreturn += "<p style='font-family: \"Century Gothic\", CenturyGothic, AppleGothic, sans-serif; font-size: 16px; color: #000000; text-align: center; font-weight: bold;' >Servicio: " + reqDto.Url + "</p>";
          //}
          strreturn += "</td>";
          strreturn += "</tr>";
      }
      else if (Tiposol == "COM")
      {
      }
      else if (Tiposol == "BT")
      {
          strreturn += "<tr>";
          strreturn += "<td width='100%' height='300' bgcolor='white' align ='center' >";
          strreturn += "<p style='font-family: Gotham, \"Helvetica Neue\", Helvetica, Arial, \"sans-serif\";font-size: 30px;color: #001D50;text-align: center; font-weight: bold;' >¡Gracias por su preferencia!</p>";
          strreturn += "</td>";
          strreturn += "</tr>";
      }
      else if (Tiposol == "ARCO")
      {
          strreturn += "<tr>";
          strreturn += "<td width='100%' height='100' bgcolor='white' align ='center' >";
          strreturn += "<p style='font-family: Gotham, \"Helvetica Neue\", Helvetica, Arial, \"sans-serif\";font-size: 30px;color: #001D50;text-align: center; font-weight: bold;' >¡Gracias por su preferencia!</p>";
          strreturn += "</td>";
          strreturn += "</tr>";
      }
      return strreturn;
    }

    CorreoFormatearFechaHora(fecha, hora) {
      try {
        const fechaConvertida = fecha.toLocaleDateString("es-ES", opcionesFecha);
        const horaConvertida = hora.toLocaleTimeString("en-US", opcionesHora);
        // Capitalizar primera letra
        return `${fechaConvertida.charAt(0).toUpperCase()}${fechaConvertida.slice(1)}, ${horaConvertida}`;
      } catch {
        return "";
      }
    }

    MensajeCorreo(reqDto,Tiposol, esEnvioCliente, item, Url = null) {
      let strreturn = "";
      const cliente = item?.[0] ?? {};

      try {
        if (esEnvioCliente) {
          if (Tiposol === "COT") {
            strreturn += `
              <tr width="350" align="center">
                <td width="350" align="center" style="width:350px;text-align:center;color:#fff;font-size:16px;margin-top:15px;display:block;">
                  Hola ${reqDto.FullName?.trim() ?? ""}, hemos recibido tu <br /><b>${reqDto.TipoSolicitud}</b> correctamente.
                  Nuestro <br /> especialista se contactará contigo para darte <br /> mayor información del producto.
                </td>
              </tr>
              <tr>
                <td width="350" align="center" style="margin-top:15px;padding:15px 0;text-align:center;color:#fff;font-size:16px;display:block;width:350px;margin:15px auto;background-color:#1A3A83;border-radius:15px;">
                  <p>Número de orden: ${reqDto.dataInsertedCotization.consecutivoDisID}.</p>
                </td>
              </tr>`;
          }

          if (Tiposol === "COMPRA") {
            const tituloDescriptivo = cliente.compraLinea?.toLowerCase() === "si" ? "Compra Exitosa" : "Solicitud de compra";
            strreturn += `
              <tr width="350" align="center">
                <td width="350" align="center" style="width:350px;text-align:center;color:#fff;font-size:16px;margin-top:15px;display:block;">
                  Hola ${reqDto.FullName?.trim() ?? ""}, hemos recibido tu <br /><b>${tituloDescriptivo}</b> correctamente.
                </td>
              </tr>
              <tr>
                <td width="350" align="center" style="margin-top:15px;padding:15px 0;text-align:center;color:#fff;font-size:16px;display:block;width:350px;margin:15px auto;background-color:#1A3A83;border-radius:15px;">
                  <p>Tu cita: ${this.CorreoFormatearFechaHora(new Date(reqDto.DateReservation), new Date(reqDto.DateReservation))}.</p>
                  ${cliente.compraLinea?.toLowerCase() === "si" ? `<p>Número de seguimiento: ${cliente.orden}.</p>
                  <p><a href="https://${Url}/Seguimiento/Default.aspx?orden=${cliente.orden}" target="_blank" style="color:white;">Ver seguimiento</a></p>` : ""}
                </td>
              </tr>`;
          }

          if (Tiposol === "SER") {
            strreturn += `
              <tr>
                <td style="text-align:center;color:#fff;font-size:16px;margin-top:15px;display:block;">
                  Hola ${reqDto.FullName ?? ""}, hemos recibido tu <br /><b>Cita de Servicio</b> correctamente.
                </td>
              </tr>
              <tr>
                <td style="margin-top:15px;padding:15px 0;text-align:center;color:#fff;font-size:16px;display:block;width:350px;margin:15px auto;background-color:#1A3A83;border-radius:15px;">
                  <p>Número de orden: ${reqDto.dataInsertedCotization.consecutivoDisID}.</p>
                  <p>Tu cita: ${this.CorreoFormatearFechaHora(new Date(reqDto.DateReservation), new Date(reqDto.DateReservation))}.</p>
                </td>
              </tr>`;
          }
        } else {
          // ENVÍO DISTRIBUIDOR
          if (Tiposol === "COT") {
            strreturn += `
              <tr width="350" align="center">
                <td width="350" align="center" style="width:350px;text-align:center;color:#fff;font-size:16px;margin-top:15px;display:block;">
                  Hola, se ha registrado una <b>${cliente.textoTipoSolicitud}</b>.
                </td>
              </tr>
              <tr>
                <td width="350" align="center" style="margin-top:15px;padding:15px 0;text-align:center;color:#fff;font-size:16px;display:block;width:350px;margin:15px auto;background-color:#1A3A83;border-radius:15px;">
                  <p>Número de orden: ${reqDto.dataInsertedCotization.consecutivoDisID}.</p>
                </td>
              </tr>`;
          }

          if (Tiposol === "COMPRA") {
            const tituloDescriptivo = cliente.compraLinea?.toLowerCase() === "si" ? "Compra Exitosa" : "Solicitud de compra";
            strreturn += `
              <tr width="350" align="center">
                <td width="350" align="center" style="width:350px;text-align:center;color:#fff;font-size:16px;margin-top:15px;display:block;">
                  Hola, se ha registrado una <b>${tituloDescriptivo}</b>.
                </td>
              </tr>
              <tr>
                <td width="350" align="center" style="margin-top:15px;padding:15px 0;text-align:center;color:#fff;font-size:16px;display:block;width:350px;margin:15px auto;background-color:#1A3A83;border-radius:15px;">
                  <p>Información de cita: ${this.CorreoFormatearFechaHora(new Date(reqDto.DateReservation), new Date(reqDto.DateReservation))}.</p>
                  ${cliente.compraLinea?.toLowerCase() === "si" ? `<p>Número de seguimiento: ${cliente.orden}.</p>
                  <p><a href="https://${Url}/Seguimiento/Default.aspx?orden=${cliente.orden}" target="_blank" style="color:white;">Ver seguimiento</a></p>` : ""}
                </td>
              </tr>`;
          }

          if (Tiposol === "SER") {
            strreturn += `
              <tr>
                <td style="text-align:center;color:#fff;font-size:16px;margin-top:15px;display:block;">
                  Hola, se ha registrado una <b>Cita de Servicio</b>.
                </td>
              </tr>
              <tr>
                <td style="margin-top:15px;padding:15px 0;text-align:center;color:#fff;font-size:16px;display:block;width:350px;margin:15px auto;background-color:#1A3A83;border-radius:15px;">
                  <p>Número de orden: ${reqDto.dataInsertedCotization.consecutivoDisID}.</p>
                  <p>Tu cita: ${this.CorreoFormatearFechaHora(new Date(reqDto.DateReservation), new Date(reqDto.DateReservation))}.</p>
                </td>
              </tr>`;
          }
        }
      } catch (err) {
        console.error("Error en MensajeCorreo:", err.message);
      }

      return strreturn;
    }

    ArmaBodyGEN(Tipo, esEnvioCliente, item, DisTel, Url, Directorio, UrlFacebook, UrlInstagram, UrlTwitter, UrlYouTube) {
      const cliente = item?.[0] ?? {};
      let body = "";
      let imgTitulo = "";

      // leer plantilla local
      //const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const relativePath = path.join(__dirname, "Resource","template", "template.html");

      try {
        body = fs.readFileSync(relativePath, "utf8");
      } catch (err) {
        console.error("Error leyendo plantilla:", err.message);
      }

      // logo
      imgTitulo = `<img width="270" src="http://${Url}/Distribuidores/${Directorio}/img/mailing_logo.png" style="width:270px;">`;

      // reemplazos
      body = body.replaceAll("@@@URL", Url);
      body = body.replaceAll("@@@IMGTITULO", imgTitulo);
      body = body.replaceAll("@@@MENSAJE", this.MensajeCorreo(Tipo, esEnvioCliente, item, Url));
      body = body.replaceAll("@@@TABLA", this.TablaCorreo(Tipo, esEnvioCliente, []/*item*/)); // esta función la conviertes igual como antes
      body = body.replaceAll("@@@TEXTOFOOTER", this.textoFooter(Tipo, esEnvioCliente));

      if (["COT", "COMPRA", "SER"].includes(Tipo)) {
        body = body.replaceAll("@@@TELD", cliente.telefonoSucursal ?? "");
        body = body.replaceAll("@@@EMAD", cliente.mailSucursal ?? "");
      }

      body = body.replaceAll("@@@FACE", UrlFacebook ? `<a style="width:30px;margin-right:10px;text-align:center;" href="${cliente.urlFacebook}"><img width="30px;" style="width:30px !important;margin-right:10px;" src="http://${Url}/Correos/imgMail/RS-facebook.png"></a>` : (cliente.urlFacebook ?? ""));
      body = body.replaceAll("@@@INST", UrlInstagram ? `<a style="width:30px;margin-right:10px;" href="${cliente.urlInstagram}"><img style="width:30px;margin-right:10px;" src="http://${Url}/Correos/imgMail/RS-instagram.png"></a>` : (cliente.urlInstagram ?? ""));
      body = body.replaceAll("@@@TWIT", UrlTwitter ? `<a style="width:30px;margin-right:10px;" href="${cliente.urlTwitter}"><img style="width:30px;margin-right:10px;" src="http://${Url}/Correos/imgMail/RS-twitter.png"></a>` : (cliente.urlTwitter ?? ""));
      body = body.replaceAll("@@@YOUT", UrlYouTube ? `<a style="width:30px;margin-right:10px;" href="${cliente.urlYoutube}"><img style="width:30px;margin-right:10px;" src="http://${Url}/Correos/imgMail/RS-youtube.png"></a>` : (cliente.urlYoutube ?? ""));

      return body;
    }

    PasswordEncrypt(passToEncrypt) {
      if (!passToEncrypt) return '';

      // Buffer.from(string, encoding) convierte la cadena a bytes
      const buffer = Buffer.from(passToEncrypt, 'utf16le');
      return buffer.toString('base64');
    }

    // Desencripta una cadena desde Base64 usando codificación UTF-16LE
    PasswordDecrypt(passToDecrypt) {
      if (!passToDecrypt) return '';

      const buffer = Buffer.from(passToDecrypt, 'base64');
      return buffer.toString('utf16le');
    }

    TablaAqui(link) {
      let strreturn = "";
      strreturn += "<p style='text-align:center'>";
      strreturn += "<table style='margin: 0 auto;'>";
      strreturn += "<tbody>";
      strreturn += "<tr>";
      strreturn += "<td style='font-family: Helvetica,Arial,sans-serif;background-color: #001D50;padding: 10px;border-radius: 5px;font-weight: bold;padding-left: 30px;padding-right: 30px;'>";
      strreturn += `<a style='text-decoration: none;color: #fff;' href='${link}'>Aquí</a>`;
      strreturn += "</td>";
      strreturn += "</tr>";
      strreturn += "</tbody>";
      strreturn += "</table>";
      strreturn += "</p>";
      return strreturn;
    }
    
    encriptarSolID(solID) {
        const textBytes = Buffer.from(solID.toString(), "utf8");
        const key = this.getTripleDesKey("#$634ilnv1!099");
        const cipher = crypto.createCipheriv("des-ede3", key, null);
        cipher.setAutoPadding(true);
    
        const encrypted = Buffer.concat([cipher.update(textBytes), cipher.final()]);
        const base64Encrypted = encrypted.toString("base64");
    
        // Original
        //return querystring.escape(base64Encrypted);
    
        // Adaptado
        return base64Encrypted;
      }
    
      getTripleDesKey(keyStr) {
        const md5Hash = crypto.createHash("md5").update(keyStr).digest(); // 16 bytes
        // Expandimos a 24 bytes (Triple DES necesita 24)
        return Buffer.concat([md5Hash, md5Hash.slice(0, 8)]); // 16 + 8 = 24
      }

    async ArmaBodyCOT(reqDto,templatePath, nombreUs, tipo, ToEmail, status, asesor) {
      const idSol = reqDto.dataInsertedCotization.solicitudID;
      const idCli = reqDto.ClienteId;
      const marca = reqDto.Marca;
      const modelo = reqDto.Modelo;
      const version = reqDto.Version;
      let comentario = reqDto.Comentarios|| '';
      const cantAttach = "0";

      const DisDirect = reqDto.dataDist.Distribuidor[0].Directorio;
      const NombreComercial = reqDto.dataDist.Distribuidor[0].Municipio;
      const Url = reqDto.Url;
      const MailGen = reqDto.dataDist.Distribuidor[0].MailGral;
      const MailCot = reqDto.dataDist.Distribuidor[0].MailCotizaciones;
      const DisCalle = reqDto.dataDist.Distribuidor[0].Calle;
      const DisCol = reqDto.dataDist.Distribuidor[0].Colonia;
      const DisMuni = reqDto.dataDist.Distribuidor[0].Municipio;
      const DisCP = reqDto.dataDist.Distribuidor[0].Cp;
      const DisEstado = reqDto.dataDist.Distribuidor[0].EstID;
      const DisTel = reqDto.dataDist.Distribuidor[0].Telefono;

      const TCot = reqDto.TipoIdCompra || '';
      const TCont = reqDto.TipoIdContacto || '';
      const consecutivoDisID = reqDto.dataInsertedCotization.consecutivoDisID;

      const encryptedPassword = encodeURIComponent(this.PasswordEncrypt(reqDto.dataInsertedCotization.usrPassword || ''));

      let body = '', imgTitulo = '';

      const relativePath = path.join(__dirname, "Resource","template", "mailDatos.html");

      try {
        body = fs.readFileSync(relativePath, "utf8");
      } catch (err) {
        console.error("Error leyendo plantilla:", err.message);
      }
      const reemplazosBase = {
        "@@@URL": Url,
        "@@@NUMCITA": consecutivoDisID,
        "@@@DISTD": NombreComercial,
        "@@@CALLED": DisCalle,
        "@@@COLONIAD": DisCol,
        "@@@MUNICIPIOD": DisMuni,
        "@@@ESTADOD": DisEstado,
        "@@@TELD": DisTel,
        "@@@EMAD": MailGen,
        "@@@FECHAHORA": new Date().toLocaleString(),
        "@@@TEXTOLINK": "",
        "@@@ADJUNTOS": "",
        "@@@Archivos": "",
        "@@@AdjuntosT": ""
      };

      if (tipo === 1 && status === 1) {
        // CLIENTE INGRESO
        imgTitulo = `<img src='http://${Url}/Correos/imgMail/mailing_02.jpg' width='720'>`;
        reemplazosBase["@@@IMGTITULO"] = imgTitulo;
        reemplazosBase["@@@TITULO"] = "AVISO DE REGISTRO DE COTIZACIÓN";
        reemplazosBase["@@@MENSAJE"] = this.MensajeCorreo(reqDto,"COT", tipo, status);
        reemplazosBase["@@@TEXTOLINK"] = "Si desea añadir información adicional, modificarla o enviar un mensaje al asesor, puede hacerlo desde";
        reemplazosBase["@@@LINK"] = this.TablaAqui(`http://${Url}/Seguimiento/?reg=${this.encriptarSolID(idSol)}`);
        reemplazosBase["@@@TABLA"] = this.TablaCorreo(reqDto,"COT", tipo, status);
        comentario = comentario.replace(/<br>/gi, "/br/").replace(/br\//gi, "/br/");
      } 
      else if (tipo === 2) {
        // ASESOR
        imgTitulo = `<img src='http://${Url}/Correos/imgMail/mailing_02.jpg' width='720'>`;
        reemplazosBase["@@@IMGTITULO"] = imgTitulo;
        reemplazosBase["@@@LINK"] = this.TablaAqui(`http://${Url}/admin/Cotizacion/cotizacion.aspx?id=${idSol}&usu=${ToEmail}&pass=${encryptedPassword}`);
        reemplazosBase["@@@TABLA"] = this.TablaCorreo(reqDto,"COT", tipo, status);
        reemplazosBase["@@@MENSAJE"] = this.MensajeCorreo(reqDto,"COT", tipo, status);

        switch (status) {
          case -1:
            reemplazosBase["@@@TITULO"] = "AVISO DE SEGUIMIENTO EN COTIZACIÓN";
            reemplazosBase["@@@AdjuntosT"] = "Archivos Adjuntos:";
            reemplazosBase["@@@ADJUNTOS"] = cantAttach;
            reemplazosBase["@@@Archivos"] = "Archivos:";
            break;
          case 1:
            reemplazosBase["@@@TITULO"] = "CONFIRMACIÓN DE COTIZACIÓN";
            break;
          case 2:
            reemplazosBase["@@@TITULO"] = "ASIGNACIÓN PARA SEGUIMIENTO";
            reemplazosBase["@@@AdjuntosT"] = "Archivos Adjuntos:";
            reemplazosBase["@@@ADJUNTOS"] = cantAttach;
            reemplazosBase["@@@Archivos"] = "Archivos:";
            break;
        }
      } 
      else if (tipo === 3 || tipo === 6 || tipo === 7) {
        // DISTRIBUIDOR, GERENTES, USUARIOS EXTERNOS
        imgTitulo = `<img src='http://${Url}/Correos/imgMail/mailing_02.jpg' width='720'>`;
        reemplazosBase["@@@IMGTITULO"] = imgTitulo;
        reemplazosBase["@@@MENSAJE"] = this.MensajeCorreo(reqDto,"COT", tipo, status);
        reemplazosBase["@@@TABLA"] = this.TablaCorreo(reqDto,"COT", tipo, status);
        reemplazosBase["@@@LINK"] = `http://${Url}/admin/Cotizacion/cotizacion.aspx?id=${idSol}`;
      }

      // Reemplazos finales
      for (const key in reemplazosBase) {
        body = body.replace(new RegExp(key, 'g'), reemplazosBase[key]);
      }

      // Reemplazo de comentarios
      if (comentario) {
        body = body.replace("@@@COMENCLI", `<tr>
          <td><span style='font-family: Verdana, Geneva, sans-serif; font-size: 12px; font-weight: bold; color: #000000'>Comentario:</span></td>
          <td><span style='font-family: Verdana, Geneva, sans-serif; font-size: 14px; color: #000000'>${comentario}</span></td>
        </tr>`);
      } else {
        body = body.replace("@@@COMENCLI", "");
      }

      return body;
    }

    async ArmaBodyPM(reqDto,templatePath, nombreUs, tipo, ToEmail, status, asesor) {
      const idSol = reqDto.dataInsertedCotization.solicitudID;
      const idCli = reqDto.ClienteId;
      const marca = reqDto.Marca;
      const modelo = reqDto.Modelo;
      const version = reqDto.Version;
      let comentario = reqDto.Comentarios|| '';
      const cantAttach = "0";

      const DisDirect = reqDto.dataDist.Distribuidor[0].Directorio;
      const NombreComercial = reqDto.dataDist.Distribuidor[0].Municipio;
      const Url = reqDto.Url;
      const MailGen = reqDto.dataDist.Distribuidor[0].MailGral;
      const MailCot = reqDto.dataDist.Distribuidor[0].MailCotizaciones;
      const DisCalle = reqDto.dataDist.Distribuidor[0].Calle;
      const DisCol = reqDto.dataDist.Distribuidor[0].Colonia;
      const DisMuni = reqDto.dataDist.Distribuidor[0].Municipio;
      const DisCP = reqDto.dataDist.Distribuidor[0].Cp;
      const DisEstado = reqDto.dataDist.Distribuidor[0].EstID;
      const DisTel = reqDto.dataDist.Distribuidor[0].Telefono;

      const TCot = reqDto.TipoIdCompra || '';
      const TCont = reqDto.TipoIdContacto || '';
      const consecutivoDisID = reqDto.dataInsertedCotization.consecutivoDisID;

      const encryptedPassword = encodeURIComponent(this.PasswordEncrypt(reqDto.dataInsertedCotization.usrPassword || ''));

      let body = '', imgTitulo = '';

      const relativePath = path.join(__dirname, "Resource","template", "mailDatos.html");

      try {
        body = fs.readFileSync(relativePath, "utf8");
      } catch (err) {
        console.error("Error leyendo plantilla:", err.message);
      }
      const reemplazosBase = {
        "@@@URL": Url,
        "@@@NUMCITA": consecutivoDisID,
        "@@@DISTD": NombreComercial,
        "@@@CALLED": DisCalle,
        "@@@COLONIAD": DisCol,
        "@@@MUNICIPIOD": DisMuni,
        "@@@ESTADOD": DisEstado,
        "@@@TELD": DisTel,
        "@@@EMAD": MailGen,
        "@@@FECHAHORA": new Date().toLocaleString(),
        "@@@TEXTOLINK": "",
        "@@@ADJUNTOS": "",
        "@@@Archivos": "",
        "@@@AdjuntosT": ""
      };

      if (tipo === 1 && status === 1) {
        // CLIENTE INGRESO
        imgTitulo = `<img src='http://${Url}/Correos/imgMail/mailing_02.jpg' width='720'>`;
        reemplazosBase["@@@IMGTITULO"] = imgTitulo;
        reemplazosBase["@@@TITULO"] = "AVISO DE REGISTRO DE COTIZACIÓN";
        reemplazosBase["@@@MENSAJE"] = this.MensajeCorreo(reqDto,"COT", tipo, status);
        reemplazosBase["@@@TEXTOLINK"] = "Si desea añadir información adicional, modificarla o enviar un mensaje al asesor, puede hacerlo desde";
        reemplazosBase["@@@LINK"] = this.TablaAqui(`http://${Url}/Seguimiento/?reg=${this.encriptarSolID(idSol)}`);
        reemplazosBase["@@@TABLA"] = this.TablaCorreo(reqDto,"COT", tipo, status);
        comentario = comentario.replace(/<br>/gi, "/br/").replace(/br\//gi, "/br/");
      } 
      else if (tipo === 2) {
        // ASESOR
        imgTitulo = `<img src='http://${Url}/Correos/imgMail/mailing_02.jpg' width='720'>`;
        reemplazosBase["@@@IMGTITULO"] = imgTitulo;
        reemplazosBase["@@@LINK"] = this.TablaAqui(`http://${Url}/admin/Cotizacion/cotizacion.aspx?id=${idSol}&usu=${ToEmail}&pass=${encryptedPassword}`);
        reemplazosBase["@@@TABLA"] = this.TablaCorreo(reqDto,"COT", tipo, status);
        reemplazosBase["@@@MENSAJE"] = this.MensajeCorreo(reqDto,"COT", tipo, status);

        switch (status) {
          case -1:
            reemplazosBase["@@@TITULO"] = "AVISO DE SEGUIMIENTO EN COTIZACIÓN";
            reemplazosBase["@@@AdjuntosT"] = "Archivos Adjuntos:";
            reemplazosBase["@@@ADJUNTOS"] = cantAttach;
            reemplazosBase["@@@Archivos"] = "Archivos:";
            break;
          case 1:
            reemplazosBase["@@@TITULO"] = "CONFIRMACIÓN DE COTIZACIÓN";
            break;
          case 2:
            reemplazosBase["@@@TITULO"] = "ASIGNACIÓN PARA SEGUIMIENTO";
            reemplazosBase["@@@AdjuntosT"] = "Archivos Adjuntos:";
            reemplazosBase["@@@ADJUNTOS"] = cantAttach;
            reemplazosBase["@@@Archivos"] = "Archivos:";
            break;
        }
      } 
      else if (tipo === 3 || tipo === 6 || tipo === 7) {
        // DISTRIBUIDOR, GERENTES, USUARIOS EXTERNOS
        imgTitulo = `<img src='http://${Url}/Correos/imgMail/mailing_02.jpg' width='720'>`;
        reemplazosBase["@@@IMGTITULO"] = imgTitulo;
        reemplazosBase["@@@MENSAJE"] = this.MensajeCorreo(reqDto,"COT", tipo, status);
        reemplazosBase["@@@TABLA"] = this.TablaCorreo(reqDto,"COT", tipo, status);
        reemplazosBase["@@@LINK"] = `http://${Url}/admin/Cotizacion/cotizacion.aspx?id=${idSol}`;
      }

      // Reemplazos finales
      for (const key in reemplazosBase) {
        body = body.replace(new RegExp(key, 'g'), reemplazosBase[key]);
      }

      // Reemplazo de comentarios
      if (comentario) {
        body = body.replace("@@@COMENCLI", `<tr>
          <td><span style='font-family: Verdana, Geneva, sans-serif; font-size: 12px; font-weight: bold; color: #000000'>Comentario:</span></td>
          <td><span style='font-family: Verdana, Geneva, sans-serif; font-size: 14px; color: #000000'>${comentario}</span></td>
        </tr>`);
      } else {
        body = body.replace("@@@COMENCLI", "");
      }

      return body;
    }

    

}

module.exports = new MailService();

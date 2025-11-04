class DistributorRepository {
    constructor({DBDistribuidoresV3,Sql}) {
      this.DBDistribuidoresV3 = DBDistribuidoresV3;
      this.Sql = Sql;
    }
    
    // * Listo
    async getDistributor(reqDistributorDto) {
      try {
            const result = await this.DBDistribuidoresV3.request()
            .input('URL', this.Sql.VarChar, reqDistributorDto.Url)
            .input('masID', this.Sql.Int, reqDistributorDto.MasID)
            .input('marca', this.Sql.VarChar, reqDistributorDto.Marca)
            .execute('dbo.proConsultaDatosDistribuidorV7');

            const tabla1 = result.recordsets[0]; // Esta es ds.Tables[0] en C#
            const tabla2 = result.recordsets[1]; // Esta es ds.Tables[1] (dtMenu)
            const tabla3 = result.recordsets[2]; // Esta es ds.Tables[2] (dtSubMenu)
            const tabla4 = result.recordsets[3];
            const tabla5 = result.recordsets[4];
            const tabla6 = result.recordsets[5];
            const tabla7 = result.recordsets[6];
            const tabla8 = result.recordsets[7];
            const tabla9 = result.recordsets[8];

            const listResultsTabla1 = [];
            const listResultsTabla2 = [];
            const listResultsTabla3 = [];
            const listResultsTabla4 = [];
            const listResultsTabla5 = [];
            const listResultsTabla6 = [];
            const listResultsTabla7 = [];
            const listResultsTabla8 = [];
            const listResultsTabla9 = [];
            
            if (tabla1 && tabla1.length > 0) {
                tabla1.forEach(row => {
                  listResultsTabla1.push({
                    Id: row.id?.toString(),
                    MasID: row.masID?.toString(),
                    NombreComercial: row.nombreComercial?.toString(),
                    DisID: row.disID?.toString(),
                    MarID: row.marID?.toString(),
                    RazonSocial: row.razonSocial?.toString(),
                    Url: row.url?.toString(),
                    UrlAlternativo: row.urlAlternativo?.toString(),
                    MailCotizaciones: row.mailCotizaciones?.toString(),
                
                    Calle: row.Calle?.toString(),
                    Colonia: row.Colonia?.toString(),
                    Ciudad: row.Ciudad?.toString(),
                    Municipio: row.Municipio?.toString(),
                    Cp: row.Cp?.toString(),
                    EstID: row.estID?.toString(),
                    ZonaID: row.zonaID?.toString(),
                    Telefono: row.Telefono?.toString(),
                    MailGral: row.mailGral?.toString(),
                    ChatFacebook: row.chatFacebook?.toString(),
                    Urlyoutube: row.urlyoutube?.toString(),
                    Urlfacebook: row.urlfacebook?.toString(),
                    UrlTwitter: row.urlTwitter?.toString(),
                    UrlInstagram: row.urlInstagram?.toString(),
                    UrlTiktok: row.urlTiktok?.toString(),
                
                    ClaveCorporativo: row.claveCorporativo?.toString(),
                    Claveasociacion: row.claveasociacion?.toString(),
                    IdseminuevosExterno: row.claveasociacion?.toString(), // mismo valor
                    GrpSemID: row.grpSemID?.toString(),
                    Directorio: row.Directorio?.toString(),
                    Latitud: row.Latitud?.toString(),
                    Longitud: row.Longitud?.toString(),
                    HorarioVentas: row.horarioVentas?.toString(),
                    HorarioServicio: row.horarioServicio?.toString(),
                    HorarioCaja: row.horarioCaja?.toString(),
                    MailPdeManejo: row.mailPdeManejo?.toString(),
                    MailCitasServ: row.mailPdeManejo?.toString(),
                    MailQuejas: row.mailPdeManejo?.toString(),
                    MailSeminuevos: row.mailSeminuevos?.toString(),
                    MailVentas: row.mailVentas?.toString(),
                    MailRefacciones: row.mailRefacciones?.toString(),
                    MailServicio: row.mailServicio?.toString(),
                    MailPrivacidad: row.mailPrivacidad?.toString(),
                    MailSeguros: row.mailSeguros?.toString(),
                    Googletrack: row.googletrack?.toString(),
                    GoogleTrackExa: row.googleTrackExa?.toString(),
                    TagManagerDist: row.tagManagerDist?.toString(),
                    TagManagerExa: row.tagManagerExa?.toString(),
                    PixelFacebook: row.pixelFacebook?.toString(),
                    ClaveDMS: row.claveDMS?.toString(),
                    Descripcion: row.descripcion?.toString(),
                    Keywords: row.keywords?.toString(),
                    DirSuc: row.dirSuc?.toString().replace(/\r?\n/g, ' '),
                    ClaveMarca: row.masID2?.toString(), // mismo valor
                    DirTaller: row.dirTaller?.toString().replace(/\r?\n/g, ' '), // mismo valor
                    DirSeminuevos: row.dirSeminuevos?.toString().replace(/\r?\n/g, ' '), // mismo valor
                    ChatActivo: row.chatActivo?.toString(), // mismo valor
                    DirTallerExpres: row.dirTallerExpres?.toString().replace(/\r?\n/g, ' '),
                    MailExpres: row.mailExpres?.toString(),
                    MailBolsaTrabajo: row.mailBolsaTrabajo?.toString(),
                    MailAutoCuenta: row.mailAutoCuenta?.toString(),
                    SoloComercial: row.soloComercial === null ? "":row.soloComercial.toString(),
                    GrpID: row.grpID?.toString()
                });
              });
            }

            if (tabla5.length > 0) {
              tabla5.forEach(row => {
                listResultsTabla5.push({
                  Tipo: row["Tipo"] || "",
                  LunesViernesInicial: row["LunesViernesInicial"] ? row["LunesViernesInicial"].toString() : "",
                  LunesViernesFinal: row["LunesViernesFinal"] ? row["LunesViernesFinal"].toString() : "",
                  SabadoInicial: row["SabadoInicial"] ? row["SabadoInicial"].toString() : "",
                  SabadoFinal: row["SabadoFinal"] ? row["SabadoFinal"].toString() : "",
                  DomingoInicial: row["DomingoInicial"] ? row["DomingoInicial"].toString() : "",
                  DomingoFinal: row["DomingoFinal"] ? row["DomingoFinal"].toString() : "",
                  // ComidaLunesViernesInicial: row["ComidaLunesViernesInicial"] || "",
                  // ComidaLunesViernesFinal: row["ComidaLunesViernesFinal"] || "",
                  // ComidaSabadoInicial: row["ComidaSabadoInicial"] || "",
                  // ComidaSabadoFinal: row["ComidaSabadoFinal"] || "",
                  // ComidaDomingoInicial: row["ComidaDomingoInicial"] || "",
                  // ComidaDomingoFinal: row["ComidaDomingoFinal"] || ""
                });
              });
            }

            if (tabla2.length > 0) {
              tabla2.forEach(row => {
                listResultsTabla2.push({
                  IdMenu: parseInt(row["idMenu"]),
                  Menu: row["Menu"] || "",
                  Liga: row["Liga"] || "",
                  Imagen: row["Imagen"] || "",
                  Target: row["Target"] || "",
                  Orden: parseInt(row["orden"])
                });
              });
            }

            if (tabla3.length > 0) {
              tabla3.forEach(row => {
                listResultsTabla3.push({
                  Menu: row["Menu"] || "",
                  Nombre: row["Nombre"] || "",
                  Liga: row["Liga"] || "",
                  Imagen: row["Imagen"] || "",
                  Target: row["Target"] || "",
                  Orden: parseInt(row["orden"]),
                  Descripcion: row["Descripcion"] || ""
                });
              });
            }

            if (tabla4.length > 0) {
              tabla4.forEach(row => {
                listResultsTabla4.push({
                  Telefono: row["Telefono"] || "",
                  Mensaje: row["Mensaje"] || "",
                  Extension: row["Extension"] || "",
                  Descripcion: row["Descripcion"] || ""
                });
              });
            }

            if (tabla6.length > 0) {
              tabla6.forEach(row => {
                listResultsTabla6.push({
                  Titulo: row["Titulo"] || "",
                  Textos: row["Textos"] || "",
                  Link: row["Link"] || "",
                  ImgNombre: row["ImgNombre"] || "",
                  ImgPosicion: row["ImgPosicion"] || "",
                  Color: row["Color"] || "",
                  FechaInicio: row["FechaInicio"] || "",
                  FechaVigencia: row["FechaVigencia"] || "",
                  IsNuevo: row["Nuevo"] || "",
                  EsGlobal: row["EsGlobal"] || "",
                  EsGrupal: row["EsGrupal"] || "",
                  SlideDistribuidor: row["EsDistribuidor"] ? row["EsDistribuidor"] : "0",
                  ListaDist: row["Distribuidores"] || ""
                });
              });
            }

            if (tabla7.length > 0) {
              tabla7.forEach(row => {
                listResultsTabla7.push({
                  Id: row["autoID"] || "",
                  IdClaveVersion: row["idClaveVersion"] || "",
                  JatoID: row["jatoID"] || "",
                  XsID: row["xsID"] || "",
                  Catalogo: row["catalogo"] || "",
                  Marca: row["marca"] || "",
                  ModeloJato: row["modeloJato"] || "",
                  ModeloXS: row["modeloXS"] || "",
                  ModeloShift: row["modeloShift"] || "",
                  VersionJato: row["versionJato"] || "",
                  VersionXS: row["versionXS"] || "",
                  VersionShift: row["versionShift"] || "",
                  Anio: row["anio"] || "",
                  PrecioContado: row["precioContado"] || 0,
                  PrecioLista: row["precioLista"] || 0,
                  PrecioCredito: row["precioCredito"] || 0,
                  PrecioIVA: row["precioIVA"] || 0,
                  PrecioGobierno: row["precioGobierno"] || 0,
                  PrecioAutofin: row["precioAutofin"] || 0,
                  PrecioConauto: row["precioConauto"] || 0,
                  PrecioAutopcion: row["precioAutopcion"] || 0,
                  Descuento: row["Descuento"] || 0,
                  Promocion: row["Promocion"] || 0,
                  Orden: row["orden"] || 0,
                  Tipo: row["tipo"] || "",
                  Activo: row["activo"] || "",
                  EsNuevo: row["esNuevo"] || "",
                  Moneda: row["moneda"] || "",
                  CC: row["cc"] || "",
                  Litros: row["Litros"] || "",
                  Nocilindros: row["nocilindros"] || "",
                  Config: row["config"] || "",
                  HPPS: row["hp_PS"] || "",
                  TorqMaxlbPie: row["torq_maxlb_pie"] || "",
                  TipoTrans: row["Tipo_trans"] || "",
                  TransAutomatica: row["Trans_automatica"] || "",
                  Carroceria: row["Carroceria"] || "",
                  NoPuertas: row["Nopuertas"] || 0,
                  AC: row["AC"] || "",
                  ABS: row["ABS"] || "",
                  Contreletrac: row["Contreletrac"] || "",
                  CtrlEstab: row["ctrl_estab"] || "",
                  RuedasMotrices: row["Ruedas_motrices"] || "",
                  Tapicasientos: row["Tapicasientos"] || "",
                  Radio: row["radio"] || "",
                  Bocinas: row["bocinas"] || "",
                  CristElectr: row["Cristelectr"] || "",
                  PerfilLlanta: row["perfil_llanta"] || "",
                  Largo: row["Largo"] || 0,
                  Ancho: row["Ancho"] || 0,
                  Alto: row["Alto"] || 0,
                  PesoBruto: row["Peso_Bruto"] || "",
                  AsientoDelAjusteAltura: row["Asiento_del_ajuste_altura"] || "",
                  AsientoDelNumAjusteElectric: row["Asiento_del_numajelectric"] || "",
                  AsientosTras: row["Asientos_tras"] || "",
                  EquipoAudio: row["Equipo_audio"] || "",
                  BolsaAire: row["Bolsa_aire"] || "",
                  SensorestacTipo: row["Sensorestac_tipo"] || "",
                  Computadora: row["Computadora"] || "",
                  ControlCrucero: row["Control_crucero"] || "",
                  No1Toque: row["No1_toque"] || "",
                  ControlRemoto: row["Control_remoto"] || "",
                  DesemTras: row["Desem_tras"] || "",
                  Funcionamiento: row["Funcionamiento"] || "",
                  CapCarga: row["Cap_carga"] || 0,
                  FNieblaDel: row["F_niebla_del"] || "",
                  Direccion: row["Direccion"] || "",
                  SistemaNavegacion: row["Sistema_Navegacion"] || "",
                  DistanciaEjes: row["Distancia_ejes"] || "",
                  CapPasajeros: row["Cap_pasajeros"] || 0,
                  CapTanque: row["Cap_tanque"] || "",
                  Rin: row["Rin"] || "",
                  SuspensionDelantera: row["Suspension_delantera"] || "",
                  SuspensionTrasera: row["Suspension_trasera"] || "",
                  SistemaAlarma: row["Sistema_Alarma"] || "",
                  DefensaDelantera: row["Defensa_Delantera"] || "",
                  LuzTrasera: row["Luz_Trasera"] || "",
                  FrenoDelantero: row["Freno_Delantero"] || "",
                  FrenoTrasero: row["Freno_Trasero"] || "",
                  CinturonSeguridad: row["Cinturon_Seguridad"] || "",
                  Consola: row["Consola"] || "",
                  Emblemas: row["Emblemas"] || "",
                  Guantera: row["Guantera"] || "",
                  LlantaRefaccion: row["Llanta_Refaccion"] || "",
                  Pantalla: row["Pantalla"] || "",
                  CabecerasDelanteras: row["Cabeceras_Delanteras"] || "",
                  CabecerasTraseras: row["Cabeceras_Traseras"] || "",
                  PortaVasos: row["Porta_Vasos"] || "",
                  EspejosExteriores: row["Espejos_Exteriores"] || "",
                  Volante: row["Volante"] || "",
                  ColumnaDireccion: row["Columna_Direccion"] || "",
                  Cubierta: row["Cubierta"] || "",
                  Limpiadores: row["Limpiadores"] || "",
                  SistemaMultimedia: row["Sistema_Multimedia"] || "",
                  SmartEntryKeyless: row["Smart_Entry_Keyless"] || "",
                  PalancaVelocidades: row["Palanca_Velocidades"] || "",
                  Bluetooth: row["Bluetooth"] || "",
                  FarosIluminacion: row["Faros_Iluminacion"] || "",
                  AnchoFrontal: row["AnchoFrontal"] || "",
                  AlimentacionCombustible: row["Alimentacion_Combustible"] || "",
                  CinturonSeguridadDelanteros: row["Cinturon_Seguridad_Delanteros"] || "",
                  CinturonSeguridadTraseros: row["Cinturon_Seguridad_Traseros"] || "",
                  ColumnaDireccionColapsable: row["Columna_Direccion_Colapsable"] || "",
                  ParasolesVanidad: row["Parasoles_Vanidad"] || "",
                  CuadroInstrumentos: row["Cuadro_Instrumentos"] || "",
                  EmblemaTrasera: row["Emblema_Trasera"] || "",
                  LimpiadorTrasero: row["Limpiador_Trasero"] || "",
                  FuncionVerano: row["Funcion_Verano"] || "",
                  SmartStartEngine: row["Smart_Start_Engine"] || "",
                  CombustibleCiudad: row["Combustible_Ciudad"] || "",
                  CombustibleCarretera: row["Combustible_Carretera"] || "",
                  CombustibleCombinado: row["Combustible_Combinado"] || "",
                  RecordatorioCinturonSeguridad: row["Recordatorio_Cinturon_Seguridad"] || ""
                });
              });
            }

            if (tabla8.length > 0) {
              tabla8.forEach(row => {
                listResultsTabla8.push({
                  IdRPro: row["idRPro"] || "",
                  IdPro: row["idPro"] || "",
                  Tipo: row["xsID"] || "",
                  Vigencia: row["subtitulo"] || "",
                  Descripcion: row["descripcion"] || "",
                  Legales: row["legales"] || "",
                  FechaAlta: row["fechaAlta"] || "",
                  FechaVigencia: row["fechaVigencia"] || "",
                  Img: row["img"] || "",
                  Activo: row["activo"] || "",
                  DisID: row["disID"] || "",
                  Corporativa: row["corporativa"] || "",
                  FechaVigenciaDesde: row["fechaVigenciaDesde"] || "",
                  ImgPromos: row["imgPromos"] || "",
                  ImgPromosMov: row["imgPromosMov"] || "",
                  Orden: row["orden"] || "",
                  link: row["link"] || "",
                  ListaDist: row["ListaDist"] || "",
                  Exclusiva: row["exclusiva"] || "",
                  Modelo: row["Modelo"] || "",
                  Anio: row["Anio"] || "",
                  Orden: row["orden"] || ""
                });
              });
            }

            if (tabla9.length > 0) {
              tabla9.forEach(row => {
                listResultsTabla9.push({
                  Id: row["id"] || "",
                  MasID: row["masID"] || "",
                  Tipo: row["tipo"] || "",
                  Vigencia: row["Vigencia"] || "",
                  Descripcion: row["descripcion"] || ""
                });
              });
            }
            
            const data = {
              Distribuidor: listResultsTabla1,
              Horarios: listResultsTabla5,
            
              Menu: listResultsTabla2,
              SubMenu: listResultsTabla3,
            
              Telefonos: listResultsTabla4,
            
              Slider: listResultsTabla6,
              AutosNuevos: listResultsTabla7,

              Promociones: listResultsTabla8,
              Vigencias: listResultsTabla9
            };
            
            //console.log(data);

            return (data)?data:null;
      } catch (error) {
        throw {isSuccess: false, message: 'Error Generico al obtener los datos en el repository. Error: | '+error+'|',statusCode: 404 };
      }
    }
    
    // * Listo
    async getInfoDistributor(resTokenDto) {
      try {
            const result = await this.DBDistribuidoresV3.request()
            .input('url', this.Sql.VarChar, resTokenDto.Url)
            .input('masID', this.Sql.Int, resTokenDto.MasID)
            .execute('dbo.proGetInfoDistributorByToken');

            const tabla1 = result.recordsets[0]; // Esta es ds.Tables[0] en C#

            const listResultsTabla1 = [];
            
             if (tabla1.length > 0) {
              tabla1.forEach(row => {
                listResultsTabla1.push({
                  MasID: row["masID"],
                  DisID: row["disID"] || "",
                  MarID: row["marID"] || "",
                  Url: row["Url"] || "",
                  MasNombre: row["masNombre"] || "",
                  MasID2: row["masID2"] || ""
                });
              });
            }

            //console.log(data);
            
            return (listResultsTabla1 && listResultsTabla1.length > 0)?listResultsTabla1[0]:null;
      } catch (error) {
        throw {isSuccess: false, message: 'Error Generico al obtener los datos en el repository. Error: | '+error+'|',statusCode: 500 };
      }
    } 
    
    // * Listo
    async getDistributorByUrl(ReqDto) {
      try {

        let MarID = ReqDto.MarID;
        let Url = ReqDto.Url;

        if(ReqDto.showAllData){
          MarID = 0;
          Url = '';
        }

        const result = await this.DBDistribuidoresV3.request()
          .input("MAR_ID", this.Sql.Int, MarID)
          .input("URL", this.Sql.VarChar, Url)
          .execute("spGetDistribuidorUrl");

        const distribuidores = result.recordset.map(row => ({
          DisID: parseInt(row.disID) || 0,
          masID: parseInt(row.masID) || 0,
          marID: parseInt(row.marID) || 0,
          ClaveCorporativo: row.claveCorporativo || "",
          NombreComercial: row.nombreComercial || "",
          Url: row.Url || "",
          UrlAlternativo: row.urlAlternativo || ""
        }));

        return {
          isSuccess: true,
          data: distribuidores
        };

      } catch (error) {
        throw {
          isSuccess: false,
          message: `Error al cargar distribuidores por URL: ${error.message}`,
          statusCode: 500
        };
      }
    }
    
  }
  
module.exports = DistributorRepository;
const { By, Key, until } = require('selenium-webdriver');
const fs = require('fs');
//const { url } = require('inspector');
const path = require('path');
const delay = require('../common/delay');
const folders = require('../files/folders');
require('dotenv').config();
const user = process.env.LOGIN_USER;
const password = process.env.LOGIN_PASS;


async function getDistribuidoraSelenium(driver, nameMarca) {
    try {
        console.log("Iniciando la extracción de distribuidores...");
        const dominios_No_Deseados = [
            'demo',
            'netcar',
            'citystore',
            'usadosqueretaro.com',
            'grupohuerta',
            'prueba',
            'localhost',
        ];
        const urlDirectorio = 'https://reportes.netcar.mx/Admin/Default.aspx', datos = [];
        const outputDir = path.resolve(__dirname, '../../dist');
        await folders(outputDir);
        
        // 1. Ingresar al sitio
        await driver.get('https://reportes.netcar.mx/'); 

        // 2. Iniciar sesión
        await driver.findElement(By.id('txtUsuario')).sendKeys(user);
        await driver.findElement(By.id('txtPassword')).sendKeys(password, Key.RETURN);
        await driver.wait(until.urlIs(urlDirectorio), 15000);

        const urlDeDestino = 'https://reportes.netcar.mx/Admin/Reportes/repDistribuidores.aspx';
        await driver.get(urlDeDestino);
        
        //await driver.findElement(By.id('ContentPlaceHolder1_ddlMarca')).sendKeys(marcaDist);
        await driver.findElement(By.id('ContentPlaceHolder1_ddlMarca')).sendKeys(nameMarca);
        await driver.findElement(By.id('ContentPlaceHolder1_btnConsultar')).click();
        await delay(5000); // Esperar a que se cargue la tabla
        const tabla = await driver.wait(until.elementLocated(By.id('ContentPlaceHolder1_gvDatos')), 10000);
        const filas = await tabla.findElements(By.css('tbody tr'));

        for (const fila of filas) {
            const cols = await fila.findElements(By.css('td'));
            if (cols.length >= 7) {
                const distID = await cols[0].getText();
                const distribuidora = await cols[2].getText();
                const url = await cols[6].getText();

                if (!dominios_No_Deseados.some(bloqueado => url.includes(bloqueado)) && url.trim() !== '') {
                    datos.push({ 
                        Marca: nameMarca, 
                        idDist: distID, 
                        nameDist: distribuidora, 
                        urlDist: url 
                    });
                }
            }
        }
        console.log(`✅ Total de Distribuidores encontrados en ${nameMarca}: ${datos.length}`);
        // Guardar en archivo JSON
        if (datos.length === 0) {
            console.warn(`⚠️ No se encontraron distribuidores para la marca: ${nameMarca}`);
        }  
        const dateStr = new Date()
                .toISOString()                // "2025-04-05T14:30:25.123Z"
                .slice(0, 19)                 // "2025-04-05T14:30:25"
                .replace('T', '_')            // "2025-04-05_14:30:25"
                .replace(/:/g, '-');          // "2025-04-05_14-30-25"
        const outputPath = path.resolve(outputDir, `${nameMarca}_${dateStr}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(datos, null, 2), 'utf-8');
        console.log(`✅ Datos guardados en ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.log('❌ Error durante la extracción de Distribuidores: ', error);
    } 
}
module.exports = getDistribuidoraSelenium;

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const delay = require('../common/delay');
require('dotenv').config();

const user = process.env.LOGIN_USER;
const password = process.env.LOGIN_PASS;

/**
 * Extrae distribuidores de una marca desde Netcar, usando una página Puppeteer existente.
 *
 * @param {import('puppeteer').Page} page - Instancia de Puppeteer ya inicializada.
 * @param {string} nameMarca - Nombre de la marca a consultar (ej. 'Volkswagen').
 * @param {string} outputDir - Ruta de la carpeta donde guardar el json del listado de Distribuidoras
 * @returns {Promise<string>} Ruta del archivo JSON generado.
 */

async function getDistribuidoraPuppeteer(page, nameMarca, outputDir) {
    try {
        
        console.log(`Iniciando extracción de distribuidores para la marca: ${nameMarca}`);

        const dominios_No_Deseados = [
            'demo',
            'netcar',
            'citystore',
            'usadosqueretaro.com',
            'grupohuerta',
            'prueba',
            'localhost',
        ];

        const urlLogin = 'https://reportes.netcar.mx/';
        //const urlDirectorio = 'https://reportes.netcar.mx/Admin/Default.aspx';
        const urlDeDestino = 'https://reportes.netcar.mx/Admin/Reportes/repDistribuidores.aspx';

        // 1. Ir al login
        await page.goto(urlLogin, { waitUntil: 'networkidle2' });

        // 2. Iniciar sesión
        await page.type('#txtUsuario', user);
        await page.type('#txtPassword', password);
        await Promise.all([
            page.click('#btnEntrar'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        // Verificar que se redirigió correctamente
        const currentUrl = page.url();
        if (!currentUrl.includes('Default.aspx')) {
            throw new Error('❌ Login fallido: No se redirigió al dashboard.');
        }

        // 3. Navegar al reporte de distribuidores
        await page.goto(urlDeDestino, { waitUntil: 'networkidle2' });

        // 4. Escribir la marca
        await page.type('#ContentPlaceHolder1_ddlMarca', nameMarca);
        // 4. Seleccionar marca
        //await page.select('#ContentPlaceHolder1_ddlMarca', nameMarca);

        // 5. Hacer clic en Consultar
        await page.click('#ContentPlaceHolder1_btnConsultar');

        // Esperar carga de la tabla
        //await delay(5000); // Espera explícita para renderizado

        await page.waitForSelector('#ContentPlaceHolder1_gvDatos', { timeout: 10000 });

        // Extraer filas de la tabla
        const datos = await page.evaluate((dominios_No_Deseados, nameMarca) => {
            const tabla = document.querySelector('#ContentPlaceHolder1_gvDatos');
            const filas = tabla.querySelectorAll('tbody tr');
            const resultados = [];

            filas.forEach(fila => {
                const celdas = fila.querySelectorAll('td');
                if (celdas.length >= 7) {
                    const distID = celdas[0].innerText.trim();
                    const distribuidora = celdas[2].innerText.trim();
                    const url = celdas[6].innerText.trim();

                    // Filtrar URLs no deseadas
                    if (
                        url &&
                        !dominios_No_Deseados.some(bloqueado => url.includes(bloqueado))
                    ) {
                        resultados.push({
                            Marca: nameMarca,
                            idDist: distID,
                            nameDist: distribuidora,
                            urlDist: url
                        });
                    }
                }
            });

            return resultados;
        }, dominios_No_Deseados, nameMarca);

        console.log(`✅ Total de Distribuidores encontrados en ${nameMarca}: ${datos.length}`);

        if (datos.length === 0) {
            console.warn(`⚠️ No se encontraron distribuidores para la marca: ${nameMarca}`);
        }

        // Guardar en JSON
        const dateStr = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
        const outputPath = path.resolve(outputDir, `${nameMarca}_${dateStr}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(datos, null, 2), 'utf-8');
        console.log(`✅ Datos guardados en ${outputPath}`);

        return outputPath;

    } catch (error) {
        console.error('❌ Error durante la extracción de Distribuidores:', error);
        //await browser.close();
        throw error;
    }
}

module.exports = getDistribuidoraPuppeteer;
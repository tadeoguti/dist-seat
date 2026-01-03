// src/services/marcaScraper.service.js
const puppeteer = require("puppeteer");
const user = process.env.LOGIN_USER;
const password = process.env.LOGIN_PASS;
const urlLogin = process.env.URL_REPORTES;
const urlDeDestino = process.env.URL_DISTRIBUIDORES;

async function scrapeMarcas() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // 1. Ir al login
    await page.goto(urlLogin, { timeout: 60000, waitUntil: 'networkidle2' });
    await page.type('#txtUsuario', user);
    await page.type('#txtPassword', password);
    await Promise.all([
        page.click('#btnEntrar'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    // 2. Validar login
    if (!page.url().includes("Default.aspx")) {
        throw new Error("❌ Login fallido: No se redirigió al dashboard.");
    }

    // 4. Navegar al reporte de distribuidores
    await page.goto(urlDeDestino, { waitUntil: 'networkidle2' });
    await page.waitForSelector("#ContentPlaceHolder1_ddlMarca", { timeout: 15000 });
    
    // 6. Extrae las opciones
    const marcas = await page.evaluate(() => {
        const select = document.querySelector("#ContentPlaceHolder1_ddlMarca");
        return Array.from(select.options)
            .filter(opt => opt.value && opt.value !== "0")
            .map(opt => ({
                id: opt.value,
                nombre: opt.textContent.trim()
            }));
    });

    // 5. Ordenar alfabéticamente
    marcas.sort((a, b) => a.nombre.localeCompare(b.nombre));

    await browser.close();
    return marcas;
}

module.exports = { scrapeMarcas };

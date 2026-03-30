// src/services/marcaScraper.service.js
const puppeteer = require("puppeteer");

const user = process.env.LOGIN_USER;
const password = process.env.LOGIN_PASS;
const urlLogin = process.env.URL_REPORTES;
const urlDeDestino = process.env.URL_DISTRIBUIDORES;

if (!user || !password || !urlLogin || !urlDeDestino) {
  throw new Error(
    "❌ Variables de entorno faltantes: LOGIN_USER, LOGIN_PASS, URL_REPORTES o URL_DISTRIBUIDORES",
  );
}

async function scrapeMarcas() {
  let browser; //   para poder cerrarlo en caso de error

  try {
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
        "--disable-dev-shm-usage", // Evita errores de memoria en entornos limitados
      ],
    });
    const page = await browser.newPage();
    //   Logs para depuración
    console.log("🔐 Iniciando login en:", urlLogin);

    // 1. Ir al login
    await page.goto(urlLogin, { timeout: 60000, waitUntil: "networkidle2" });
    await page.type("#txtUsuario", user);
    await page.type("#txtPassword", password);
    await Promise.all([
      page.click("#btnEntrar"),
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }),
    ]);

    // 2. Validar login
    if (!page.url().includes("Default.aspx")) {
      throw new Error("❌ Login fallido: No se redirigió al dashboard.");
    }

    // 3. Navegar al reporte de distribuidores
    console.log("📄 Navegando a página de distribuidores:", urlDeDestino);
    await page.goto(urlDeDestino, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // 4. Esperar el selector de marcas
    await page.waitForSelector("#ContentPlaceHolder1_ddlMarca", {
      timeout: 20000,
      visible: true,
    });

    // Validar que el selector exista
    const exists = await page.$("#ContentPlaceHolder1_ddlMarca");
    if (!exists) {
      throw new Error("❌ No se encontró el selector de marcas en la página.");
    }

    // 5. Obtener las opciones del selector
    const marcas = await page.evaluate(() => {
      const select = document.querySelector("#ContentPlaceHolder1_ddlMarca");
      if (!select) return [];
      return Array.from(select.options)
        .filter((opt) => opt.value && opt.value !== "0")
        .map((opt) => ({
          id: parseInt(opt.value, 10),
          nombre: opt.textContent.trim(),
        }));
    });

    if (marcas.length === 0) {
      throw new Error(
        "⚠️ Se encontró el selector pero no contiene marcas (o solo tiene la opción por defecto).",
      );
    }

    // 6. Ordenar alfabéticamente
    marcas.sort((a, b) => a.nombre.localeCompare(b.nombre));

    //   Log de cantidad de marcas
    console.log("📦 Marcas extraídas:", marcas.length);

    return marcas;
  } catch (error) {
    console.error("❌ Error en scrapeMarcas:", error.message);
    console.log("❌ Error en scrapeMarcas:", error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.log("✅ Navegador cerrado correctamente.");
      } catch (closeError) {
        console.error("⚠️ Error al cerrar el navegador:", closeError.message);
      }
    }
  }
}

module.exports = { scrapeMarcas };

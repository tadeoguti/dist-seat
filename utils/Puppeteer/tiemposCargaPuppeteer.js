/**
 * Mide los tiempos de carga de la página actual usando la API de Performance Navigation.
 * @param {import('puppeteer').Page} page - Página de Puppeteer.
 * @returns {Promise<{tiempoDOM: {ms:number, s:number}, tiempoTotal: {ms:number, s:number}}>}
 */
async function tiemposCargaPuppeteer(page) {
  const timing = await page.evaluate(() => {
    const navs = performance.getEntriesByType("navigation");
    if (navs.length > 0) {
      const nav = navs[0];
      return {
        start: nav.startTime || 0,
        domComplete: nav.domComplete || 0,
        loadEventEnd: nav.loadEventEnd || 0
      };
    }
    return null;
  });

  if (!timing) {
    console.warn("⚠️ No se pudo obtener métricas de navegación.");
    return { 
      tiempoDOM: { ms: -1, s: -1 }, 
      tiempoTotal: { ms: -1, s: -1 } 
    };
  }

  const tiempoDOMms = timing.domComplete - timing.start;
  const tiempoTotalms = timing.loadEventEnd - timing.start;

  const tiempoDOMs = (tiempoDOMms / 1000).toFixed(2);
  const tiempoTotals = (tiempoTotalms / 1000).toFixed(2);

  console.log(`⏱ Tiempo DOM listo: ${tiempoDOMms} ms (${tiempoDOMs} s)`);
  console.log(`⏱ Tiempo total carga: ${tiempoTotalms} ms (${tiempoTotals} s)`);

  return { 
    tiempoDOM: { ms: tiempoDOMms, s: parseFloat(tiempoDOMs) },
    tiempoTotal: { ms: tiempoTotalms, s: parseFloat(tiempoTotals) }
  };
}

module.exports = tiemposCargaPuppeteer;


/**
 * Calcula y muestra el tiempo total y promedio de un proceso.
 * @param {number} startProcessTime - Timestamp de inicio del proceso (Date.now()).
 * @param {number} totalItems - El número total de elementos procesados.
 */
function reportarTiempo(startProcessTime, totalItems, totalSecciones) {
    if (startProcessTime === undefined || totalItems === undefined) {
        console.error("❌ Error: Se requiere un tiempo de inicio y el número total de elementos.");
        return;
    }

    const endProcessTime = Date.now();
    const totalMilisegundos = endProcessTime - startProcessTime;
    const totalSegundos = Math.floor(totalMilisegundos / 1000);

    // Cálculo del tiempo total
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    
    console.log(`\n--- Reporte de Tiempo ---`);
    console.log(`Total de Distribuidoras: ${totalItems}`);
    console.log(`Total de Secciones por Distribuidora: ${totalSecciones}`);
    console.log(`⏱️ Tiempo total de ejecución: ${horas} h, ${minutos} min, ${segundos} s`);

    // Cálculo del tiempo promedio
    const promedioSegundos = totalMilisegundos / 1000 / totalItems;
    const horasProm = Math.floor(promedioSegundos / 3600);
    const minutosProm = Math.floor((promedioSegundos % 3600) / 60);
    const segundosProm = Math.round(promedioSegundos % 60);
    
    console.log(`⏱️ Tiempo promedio por Distribuidora: ${horasProm} h, ${minutosProm} min, ${segundosProm} s`);
    console.log(`-`.repeat(60));
    console.log(`\n`);
}
module.exports = reportarTiempo;

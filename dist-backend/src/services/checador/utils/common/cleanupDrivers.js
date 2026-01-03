// Función para cerrar todos los drivers pendientes
const activeDrivers = new Set(); // Usamos Set para evitar duplicados

// Función para agregar un driver a la lista de activos
function addDriver(driver) {
    activeDrivers.add(driver);
}
async function cleanup() {
    console.log('\n\n🛑 Señal de interrupción recibida. Cerrando navegadores pendientes...');

    // Convertimos a array porque vamos a modificar el Set
    const drivers = [...activeDrivers];

    for (const driver of drivers) {
        if (!driver || !activeDrivers.has(driver)) continue;

        try {
            // ⚠️ Verificamos si la sesión aún está activa
            await driver.getCurrentUrl().catch(() => null); // Prueba ligera
            await driver.quit();
            console.log('✔️ Navegador cerrado correctamente.');
        } catch (error) {
            // Ignoramos errores comunes de conexión o sesión perdida
            if (error.name === 'NoSuchSessionError' || error.message.includes('ECONNREFUSED')) {
                console.warn('🔸 El navegador ya estaba cerrado o sin sesión.');
            } else {
                console.warn('⚠️ Error inesperado al cerrar driver:', error.message);
            }
        } finally {
            activeDrivers.delete(driver); // Elimina del seguimiento
        }
    }

    console.log('✅ Todos los navegadores han sido gestionados. Saliendo...');
    process.exit(0);
}

// Escucha las señales de interrupción
process.on('SIGINT', cleanup);  // Ctrl + C
process.on('SIGTERM', cleanup); // Apagado desde sistema (ej. Docker, servidores)

module.exports = { activeDrivers, addDriver, cleanup };
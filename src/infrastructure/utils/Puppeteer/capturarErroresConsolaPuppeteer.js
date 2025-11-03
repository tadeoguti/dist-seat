/**
 * Registra un listener en la página de Puppeteer para capturar 
 * todos los mensajes de consola de tipo 'error' y 'warning'.
 * * Se recomienda llamar a esta función ANTES de page.goto().
 * * @param {import("puppeteer").Page} page - Instancia de Puppeteer Page.
 */
async function capturarErroresConsolaPuppeteer(page) {
    // 1. Inicializar la variable de almacenamiento en el objeto page
    // Usamos un símbolo o una propiedad no estándar para evitar colisiones
    // con propiedades internas de Puppeteer.
    page._capturedConsoleMessages = []; 
    
    // 2. Definir el Listener de la Consola
    page.on('console', (msg) => {
        const type = msg.type();
        
        // Solo capturamos mensajes de error y warning
        if (type === 'error' || type === 'warning') {
            let message = '';
            
            // Intentar obtener el texto del mensaje (puede ser un objeto JSHandle)
            try {
                // Obtener el texto del mensaje
                const text = msg.text(); 
                
                // Si el mensaje es un JSHandle (objeto complejo), intentar serializarlo.
                // En la mayoría de los casos, msg.text() ya es suficiente.
                message = text;

            } catch (e) {
                // Fallback si la obtención del texto falla
                message = `[Error getting message text]: ${e.message}`;
            }

            // Almacenar el mensaje con su tipo
            page._capturedConsoleMessages.push({
                type: type === 'warning' ? 'WARN' : 'ERROR',
                text: message,
                // Puedes agregar el URL de origen: msg.location().url
            });
        }
    });

    console.log("✅ Listener de Consola de Puppeteer registrado.");
}

module.exports = capturarErroresConsolaPuppeteer;
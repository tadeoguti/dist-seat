const fs = require('fs');
const path = require('path');

/**
 * Redirige todas las impresiones de la consola a un archivo de log en un directorio específico.
 * @param {string} logDirectory - El directorio donde se guardará el archivo de log.
 * @param {string} logFileName - El nombre del archivo de log.
 */
function setupLoggingToFile(logDirectory, logFileName = 'ejecucion_logs.txt') {
    // Aquí es donde se une la ruta del directorio y el nombre del archivo.
    const logFilePath = path.join(logDirectory, logFileName);
    //para adjuntar el texto en el mismo archivo se usa  flags: 'a' 
    //const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
    
    //para sobreescribir el texto en el mismo archivo se usa  flags: 'w' 
    const logStream = fs.createWriteStream(logFilePath, { flags: 'w' });

    // (El resto de la lógica de console.log y console.error sigue siendo la misma)

    console.log = function() {
        const timestamp = new Date().toISOString();
        const args = Array.from(arguments);
        const formattedMessage = require('util').format.apply(null, args);
        
        logStream.write(`${timestamp} - ${formattedMessage}\n`);
        process.stdout.write(`${formattedMessage}\n`);
    };

    console.error = function() {
        const timestamp = new Date().toISOString();
        const args = Array.from(arguments);
        const formattedMessage = require('util').format.apply(null, args);
        
        logStream.write(`${timestamp} - ERROR - ${formattedMessage}\n`);
        process.stderr.write(`${formattedMessage}\n`);
    };
    
    console.log('-------------------------------------------');
    console.log('Inicio de la ejecución del script.');
    console.log('-------------------------------------------');
}

module.exports = setupLoggingToFile;
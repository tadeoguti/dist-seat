const { poolPromise } = require('../db/sqlserver/connection');

async function obtenerIPPorMarca(marca) {
    try {
        const marcaNormalizada = marca.trim().toLowerCase();
        const pool = await poolPromise;
        const result = await pool.request()
            .input('marca', marcaNormalizada)
            .query('SELECT ip FROM ips_autorizadas WHERE LOWER(marca) = @marca');
        return result.recordset.length > 0 ? result.recordset[0].ip : null;
    } catch (error) {
        console.error(`❌ Error al obtener IP para la marca "${marca}":`, error.message);
        return null;
    }
}

module.exports = { obtenerIPPorMarca };

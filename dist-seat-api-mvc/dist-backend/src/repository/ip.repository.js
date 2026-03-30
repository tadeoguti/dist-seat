const db = require('../db/mysql/connection');

async function obtenerIPPorMarca(marca) {
    try {
        const marcaNormalizada = marca.trim().toLowerCase();
        const [rows] = await db.execute(
            'SELECT ip FROM ips_autorizadas WHERE LOWER(marca) = ?',
            [marcaNormalizada]
        );
        return rows.length > 0 ? rows[0].ip : null;
    } catch (error) {
        console.error(`❌ Error al obtener IP para la marca "${marca}":`, error.message);
        return null;
    }
}

module.exports = { obtenerIPPorMarca };

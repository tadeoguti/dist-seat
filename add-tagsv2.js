const fs = require('fs');
const path = require('path');

const swaggerFile = './swagger-output.json';
const routesBaseFolder = './src/routes'; // Carpeta base de rutas
const authMiddlewareName = 'authMiddleware.authenticateToken'; // Middleware de autenticación

// Leer el archivo Swagger generado
const swaggerDoc = JSON.parse(fs.readFileSync(swaggerFile, 'utf-8'));

// Función para buscar archivos dentro de cada carpeta de versión
const getProtectedRoutes = (baseFolder) => {
    const protectedRoutes = [];

    // Leer todas las versiones (V1, V2, etc.)
    fs.readdirSync(baseFolder).forEach(versionFolder => {
        const versionPath = path.join(baseFolder, versionFolder);
        if (fs.lstatSync(versionPath).isDirectory()) { // Verifica si es una carpeta

            // Leer archivos dentro de la versión (testRoute.js, loginRoute.js, etc.)
            fs.readdirSync(versionPath).forEach(file => {
                if (file.endsWith('.js')) {
                    const filePath = path.join(versionPath, file);
                    const fileContent = fs.readFileSync(filePath, 'utf-8');

                    // Buscar rutas que usan `authMiddleware.authenticateToken`
                    const regex = /router\.(get|post|put|delete)\(['"]([^'"]+)['"],\s*authMiddleware\.authenticateToken/g;
                    let match;

                    while ((match = regex.exec(fileContent)) !== null) {
                        const method = match[1].toLowerCase(); // Método HTTP (get, post, etc.)
                        const routePath = `/api/${versionFolder.toLowerCase()}${match[2]}`; // Genera la ruta correcta
                        protectedRoutes.push({ path: routePath, method });
                    }
                }
            });
        }
    });

    return protectedRoutes;
};

// Obtener las rutas protegidas
const protectedRoutes = getProtectedRoutes(routesBaseFolder);

// Función para extraer la versión y formatear el nombre del tag
const generateTagName = (path) => {
    const pathParts = path.split('/');
    const version = pathParts.includes('v1') ? 'V1' : pathParts.includes('v2') ? 'V2' : 'Otros';

    const indexVersion = pathParts.findIndex(part => /^v\d+$/i.test(part));
    let resourceName = indexVersion !== -1 ? pathParts[indexVersion + 1] : 'Otros';

    resourceName = resourceName
        .replace(/Route$/i, '')
        .replace(/\.js$/i, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();

    resourceName = resourceName.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    return `${resourceName} ${version}`;
};

// Actualizar Swagger con `tags` y `security`
const updateSwaggerPaths = (swaggerDoc, protectedRoutes) => {
    for (const path in swaggerDoc.paths) {
        for (const method in swaggerDoc.paths[path]) {
            const endpoint = swaggerDoc.paths[path][method];

            // Agregar etiquetas (tags)
            if (!endpoint.tags || endpoint.tags.length === 0) {
                endpoint.tags = [generateTagName(path)];
            }

            // Verificar si la ruta necesita BearerAuth
            const isProtected = protectedRoutes.some(route => route.path === path && route.method === method);

            if (isProtected) {
                endpoint.security = [{ BearerAuth: [] }]; // Agrega BearerAuth solo a rutas protegidas
            }
        }
    }
};

// Aplicar cambios en Swagger
updateSwaggerPaths(swaggerDoc, protectedRoutes);

// Guardar el archivo actualizado
fs.writeFileSync(swaggerFile, JSON.stringify(swaggerDoc, null, 2));

console.log('✔️ Tags y seguridad actualizados en swagger-output.json');

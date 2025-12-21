const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// =================================================================
// ⚠️ CONFIGURACIÓN IMPORTANTE ⚠️
// Esta URL es la base de donde el Launcher intentará descargar los archivos.
// Por ahora, pondremos un ejemplo. En el siguiente paso te enseñaré a obtener la real.
// DEBE TERMINAR SIEMPRE EN / (barra)
const BASE_URL = "https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/main/admin_tools/archivos_del_pack/"; 
// =================================================================

const SOURCE_DIR = path.join(__dirname, 'archivos_del_pack');
const OUTPUT_FILE = path.join(__dirname, 'manifest.json');

// Función matemática que crea la "Huella Digital" (SHA1) del archivo
function getFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha1');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

// Función que explora todas las subcarpetas
function scanDirectory(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            scanDirectory(filePath, fileList);
        } else {
            // Ignoramos archivos basura de Mac o Windows
            if(file === '.DS_Store' || file === 'Thumbs.db') return;

            // Convertimos la ruta de Windows (\) a Web (/)
            let relativePath = path.relative(SOURCE_DIR, filePath).replace(/\\/g, '/');

            console.log(`Detectado: ${relativePath}`);

            fileList.push({
                path: relativePath, // Ej: "mods/jei.jar"
                url: BASE_URL + relativePath, // Ej: "https://.../mods/jei.jar"
                hash: getFileHash(filePath), // La huella digital única
                size: stat.size // Tamaño en bytes
            });
        }
    });

    return fileList;
}

// --- EJECUCIÓN ---
console.log("--- ESCANEANDO TUS MODS ---");

if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`¡ERROR! No encontré la carpeta: ${SOURCE_DIR}`);
    console.error("Asegúrate de haber creado 'archivos_del_pack' y poner los mods dentro.");
    process.exit(1);
}

const files = scanDirectory(SOURCE_DIR);

const manifest = {
    version: "1.0", // Puedes cambiar esto manualmente si quieres llevar control
    generatedAt: new Date().toISOString(),
    files: files
};

// Guardamos el archivo final
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

console.log(`\n¡ÉXITO! Se generó el archivo 'manifest.json'.`);
console.log(`Contiene ${files.length} archivos listos para sincronizar.`);
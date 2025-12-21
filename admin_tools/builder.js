const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// === 1. TU URL BASE ===
// Esta es la dirección para los archivos pequeños de la carpeta
const BASE_URL = "https://raw.githubusercontent.com/maxgreg360-beep/Launcher-Clor0/main/admin_tools/archivos_del_pack/"; 

// === 2. ARCHIVOS GIGANTES (CONFIGURADOS) ===
const EXTRA_FILES = [
    {
        // Archivo 1: CATACLYSM
        path: "mods/L_Enders_Cataclysm-3.16.jar", 
        url: "https://github.com/maxgreg360-beep/Launcher-Clor0/releases/download/v1/L_Enders_Cataclysm-3.16.jar", 
        hash: "25D84C486A817BA54362EA1F4B82B6D3802CC074", // Tu código SHA1
        size: 0 
    },
    {
        // Archivo 2: LIBCEF (Ruta exacta configurada)
        path: "mods/mcef-libraries/windows_amd64/libcef.dll",
        url: "https://github.com/maxgreg360-beep/Launcher-Clor0/releases/download/v1/libcef.dll",
        hash: "2DA4A461C74C723707A0207F2CE02BCC7701589D", // Tu código SHA1
        size: 0 
    }
];

const SOURCE_DIR = path.join(__dirname, 'archivos_del_pack');
const OUTPUT_FILE = path.join(__dirname, 'manifest.json');

// --- FUNCIONES INTERNAS ---
function getFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha1');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

function scanDirectory(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            scanDirectory(filePath, fileList);
        } else {
            if(file === '.DS_Store' || file === 'Thumbs.db') return;
            // Convertir barras invertidas a normales para web
            let relativePath = path.relative(SOURCE_DIR, filePath).replace(/\\/g, '/');
            console.log(`Detectado: ${relativePath}`);
            fileList.push({
                path: relativePath,
                url: BASE_URL + relativePath,
                hash: getFileHash(filePath),
                size: stat.size
            });
        }
    });
    return fileList;
}

// --- EJECUCIÓN ---
console.log("--- GENERANDO MANIFIESTO ---");

// 1. Escanear archivos normales
let files = scanDirectory(SOURCE_DIR);

// 2. Añadir los gigantes
console.log(`Agregando ${EXTRA_FILES.length} archivos externos...`);
files = files.concat(EXTRA_FILES);

const manifest = {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    files: files
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
console.log(`\n¡LISTO! Manifiesto creado con ${files.length} archivos.`);
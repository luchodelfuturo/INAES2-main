const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { procesarArchivos } = require('./procesarArchivos');

const app = express();
const port = process.env.PORT || 3001;

// Configuración de CORS correcta
// Middleware CORS
app.use(cors({
    origin: 'https://inaest-front.vercel.app',
    methods: ['GET', 'POST', 'OPTIONS'],  // Agregar 'OPTIONS' por si se requiere en preflight requests
    allowedHeaders: ['Content-Type', 'Authorization'],  // Puedes agregar más si tu solicitud necesita más cabeceras
    credentials: true,
    optionsSuccessStatus: 200  // Algunas veces ayuda con navegadores antiguos
}));

// Aumentar el límite de carga en Express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ruta de prueba para verificar la conexión
app.get('/api/test', (req, res) => {
    res.json({ message: 'Conexión exitosa con el backend!' });
});

// Configuración de multer para el manejo de archivos, con límite de tamaño
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024  // Límite de 10MB por archivo
    }
});

// Middleware para servir archivos estáticos
app.use('/generated_files', express.static(path.join(__dirname, 'generated_files'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.txt')) {
            res.setHeader('Content-Disposition', 'attachment');
        }
    }
}));

// Ruta para manejar la carga de archivos
app.post('/api/upload', upload.fields([{ name: 'socios' }, { name: 'prestamos' }]), async (req, res) => {
    console.log("Llegó al upload");

    if (!req.files || Object.keys(req.files).length === 0) {
        console.error('No files were uploaded.');
        return res.status(400).send('No files were uploaded.');
    }

    let sociosFile = req.files.socios[0];
    let prestamosFile = req.files.prestamos[0];

    console.log("Archivos recibidos:", req.files);

    try {
        const filePath = path.join(__dirname, 'generated_files', 'alta_deudores.txt');
        console.log("Generando el archivo en:", filePath);
        const result = procesarArchivos(sociosFile.buffer, prestamosFile.buffer, filePath);
        console.log("Resultado del procesamiento:", result);
        res.json({ message: 'Files processed and text file generated!', filePath: '/generated_files/alta_deudores.txt' });
    } catch (error) {
        console.error('Error processing files:', error);
        res.status(500).send('Error processing files.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
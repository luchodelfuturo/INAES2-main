const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { procesarArchivos } = require('./procesarArchivos');

const app = express();
const port = 5000;

// Configuración de CORS
app.use(cors());

// Configuración de multer para el manejo de archivos
const upload = multer({
    storage: multer.memoryStorage(),
});

// Middleware para servir archivos estáticos
app.use('/generated_files', express.static(path.join(__dirname, 'generated_files'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.txt')) {
            res.setHeader('Content-Disposition', 'attachment');
        }
    }
}));

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


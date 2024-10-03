const fs = require('fs');

function generarArchivoAlta(data, filePath) {
    console.log("Generando archivo de alta con los datos:", data);

    const stream = fs.createWriteStream(filePath, { encoding: 'ascii' });

    data.forEach(row => {
        const linea = `${(row['NRO. de CUIL'] || '').toString().padStart(11, ' ')}`
                    + `${(row['TIPO DOC'] || '').toString().padStart(3, ' ')}`
                    + `${(row['NUMERO'] || '').toString().padStart(20, ' ')}`
                    + `${(row['Apellido y Nombres'] || '').toString().padStart(70, ' ')}`
                    + `${(row['Fecha Ing Mutal'] || '').toString().padStart(8, ' ')}`
                    + `${(row['Sexo'] || '').toString().padStart(1, ' ')}`
                    + `${(row['ESTADO DE PMOS '] || '').toString().padStart(1, ' ')}`
                    + `${(row['Domicilio'] || '').toString().padStart(40, ' ')}`
                    + `${(row['LOCALIDAD'] || '').toString().padStart(20, ' ')}`
                    + `${(row['PROVINCIA.'] || '').toString().padStart(1, ' ')}`
                    + `${(row['CODIGO POSTAL'] || '').toString().padStart(8, ' ')}`
                    + `${(row['TELEFONO_FIJO'] || '').toString().padStart(14, ' ')}`
                    + `${(row['TELEFONO_CELULAR'] || '').toString().padStart(14, ' ')}`
                    + `${(row['NACIONALIDAD'] || '').toString().padStart(1, ' ')}`
                    + `${(row['RETORNO'] || '').toString().padStart(2, ' ')}`
                    + `${''.padStart(69, ' ')}\r\n`;  // Agregar espacios en blanco para completar los 300 caracteres
        stream.write(linea);
    });

    stream.end();
}

module.exports = { generarArchivoAlta };

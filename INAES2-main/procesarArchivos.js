const XLSX = require('xlsx');
const fs = require('fs');

function procesarArchivos(sociosFile, prestamosFile, filePath) {
    console.log('Entrando a procesarArchivos'); // Registro de depuración

    // Leer archivos Excel
    const sociosWorkbook = XLSX.read(sociosFile, { type: 'buffer' });
    const prestamosWorkbook = XLSX.read(prestamosFile, { type: 'buffer' });


    // Seleccionar la primera hoja de cada archivo
    const sociosSheet = sociosWorkbook.Sheets[sociosWorkbook.SheetNames[0]];
    const prestamosSheet = prestamosWorkbook.Sheets[prestamosWorkbook.SheetNames[0]];

    // Convertir las hojas a formato JSON
    const sociosData = XLSX.utils.sheet_to_json(sociosSheet);
    const prestamosData = XLSX.utils.sheet_to_json(prestamosSheet, { range: 4 });  // Saltamos las primeras 4 filas


    // Filtrar los registros de socios que tienen valores válidos en 'LEGAJO BBVA' y 'Apellido y Nombres'
    const sociosDataFiltrados = sociosData.filter(row => row['LEGAJO BBVA'] && row['Apellido y Nombres']);

    // Crear un mapa para una búsqueda rápida de socios por 'LEGAJO BBVA'
    const sociosMap = sociosData.reduce((map, socio) => {
        const key = socio['LEGAJO BBVA'];
        if (key === undefined) {
            console.log('Objeto de socio sin LEGAJO BBVA:', socio);
        }
        map[key] = socio;
        return map;
    }, {});

    //console.log('Mapa de Socios:', sociosMap);


    // Filtrar los registros de préstamos que tienen valores válidos en 'LEGAJO'
    const prestamosDataFiltrados = prestamosData.filter(row => row['LEGAJO']);

    console.log('Prestamos :', prestamosDataFiltrados);


    // Unir los datos por el número de legajo y asegurarse de que el resultado tenga la cantidad de registros de `prestamosData`
    const mergedData = prestamosData.map(prestamo => {
        const socio = sociosMap[prestamo.LEGAJO] || {};
        return { ...prestamo, ...socio };
    });

    console.log('Datos Unificados:', mergedData);

    generarArchivoAlta(mergedData, filePath);
}

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

module.exports = { procesarArchivos };




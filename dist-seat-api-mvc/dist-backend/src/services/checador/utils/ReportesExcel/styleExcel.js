

async function columnNumberToLetter(column) {
    let temp = "";
    let letter = "";
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}

async function sheetStyles(sheet) {
    const lastColumnLetter = await columnNumberToLetter(sheet.columns.length);
    // ✅ Congelar la primera fila (encabezado)
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    // ✅ Estilo del encabezado
    const headerRow = sheet.getRow(1); // Obtiene la primera fila
    headerRow.font = {
        bold: true,
        size: 12,
        color: { argb: "FF000000" }, // Negro
    };
    // --- Aplicar bordes a todas las celdas del encabezado ---
    headerRow.eachCell((cell) => {
        cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" }, // Gris claro para encabezado
        };
        cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
        };
    });

    // Colores alternados para filas de datos (tonos pastel amigables)
    const color1 = "FFF0F8FF"; // Azul muy claro (AliceBlue)
    const color2 = "FFFFFFFF"; // Blanco puro

    // ✅ Estilo para el resto de las filas (datos), sin modificar alineación
    sheet.eachRow({ includeEmpty: true }, function (row) {
        // Excluye la primera fila para no sobrescribir el estilo del encabezado
        if (row.number !== 1) {
        const fillColor = row.number % 2 === 0 ? color1 : color2;
        row.eachCell({ includeEmpty: true }, (cell) => {
            // Fuente para las celdas de datos
            cell.font = {
            name: "Arial",
            size: 11,
            color: { argb: "FF000000" },
            };

            // Bordes para todas las celdas
            cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
            };
            // Color de fondo alternado
            cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: fillColor },
            };
        });
        }
    });
    // ✅ Ajustar wrapText, centrado y ancho dinámico en cada columna
    sheet.columns.forEach((col, colIndex) => {
        const column = sheet.getColumn(colIndex + 1);
        column.alignment = {
        wrapText: true,
        vertical: "middle",
        horizontal: "center",
        };

        let maxLength = col.header ? col.header.toString().length : 10;
        column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        if (cellValue.length > maxLength) maxLength = cellValue.length;
        });
        column.width = Math.min(maxLength + 10, 70);
    });

    // ✅ Aplicar filtro automático en el encabezado
    sheet.autoFilter = {
        from: "A1",
        to: `${lastColumnLetter}1`,
    };
}

module.exports = sheetStyles;
import ExcelJS from "exceljs";

/**
 * Genera un reporte de ventas en formato .xlsx a partir de un array de
 * comandas y devuelve el archivo como Buffer.
 *
 * Importante: este service NO conoce ni toca `req`/`res`. Solo recibe datos
 * y devuelve un Buffer. Es el controlador quien decide qué headers HTTP
 * poner y cómo enviarlo. Esto hace que el service sea reutilizable (por
 * ejemplo, para adjuntarlo en un correo en vez de descargarlo por HTTP)
 * y fácil de testear sin levantar un servidor.
 *
 * @param {Array<{orderNumber, table, waiter, items: Array<{name, quantity, price}>, total, status, date}>} orders
 * @returns {Promise<Buffer>}
 */
async function generateSalesReport(orders = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistema de Comandas";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Reporte de Ventas");

  // Definimos las columnas UNA sola vez: `key` es el nombre de la propiedad
  // que exceljs va a buscar en cada objeto que le pasemos a `sheet.addRow`.
  sheet.columns = [
    { header: "N° Comanda", key: "orderNumber", width: 14 },
    { header: "Mesa", key: "table", width: 10 },
    { header: "Mozo/a", key: "waiter", width: 20 },
    { header: "Items", key: "items", width: 45 },
    { header: "Total", key: "total", width: 14 },
    { header: "Estado", key: "status", width: 14 },
    { header: "Fecha", key: "date", width: 20 },
  ];

  // Le damos estilo a la fila de encabezados para que se distinga de los datos.
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4CAF50" },
  };
  headerRow.alignment = { vertical: "middle" };

  let totalGeneral = 0;

  for (const order of orders) {
    const itemsText = (order.items || [])
      .map((item) => `${item.quantity}x ${item.name}`)
      .join(", ");

    const orderTotal = Number(order.total) || 0;
    totalGeneral += orderTotal;

    sheet.addRow({
      orderNumber: order.orderNumber,
      table: order.table,
      waiter: order.waiter,
      items: itemsText,
      total: orderTotal,
      status: order.status,
      date: order.date ? new Date(order.date).toLocaleString("es-AR") : "",
    });
  }

  // Formato moneda para toda la columna "total" (aplica también a la fila
  // de totales que agregamos abajo).
  sheet.getColumn("total").numFmt = '"$"#,##0.00';

  // Fila en blanco + fila de total general, para que quede visualmente
  // separada de los datos.
  sheet.addRow({});
  const totalRow = sheet.addRow({ items: "TOTAL GENERAL", total: totalGeneral });
  totalRow.font = { bold: true };

  // ExcelJS entrega el archivo directamente como Buffer/ArrayBuffer,
  // sin necesidad de escribirlo primero a disco.
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export { generateSalesReport };

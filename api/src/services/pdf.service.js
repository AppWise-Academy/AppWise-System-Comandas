import PDFDocument from "pdfkit";

/**
 * Genera el ticket de una comanda en PDF (formato angosto, tipo impresora
 * térmica de 80mm) y devuelve el archivo como Buffer.
 *
 * pdfkit trabaja por streaming: en vez de "devolver" un archivo, va
 * emitiendo eventos `data` con pedazos (chunks) del PDF a medida que lo
 * arma. Por eso envolvemos todo en una Promise: la resolvemos recién en el
 * evento `end`, cuando ya tenemos el PDF completo armado en un solo Buffer.
 *
 * @param {{orderNumber, table, waiter, items: Array<{name, quantity, price}>, total, date}} order
 * @returns {Promise<Buffer>}
 */
function generateOrderTicket(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [227, 500], margin: 10 }); // ~80mm de ancho
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const divider = "-".repeat(32);

    // --- Encabezado ---
    doc.fontSize(14).font("Helvetica-Bold").text("Sistema de Comandas", { align: "center" });
    doc.fontSize(9).font("Helvetica").text("Ticket de Comanda", { align: "center" });
    doc.moveDown(0.5);
    doc.text(divider, { align: "center" });

    // --- Datos generales ---
    doc.fontSize(9);
    doc.text(`N° Comanda: ${order.orderNumber ?? "-"}`);
    doc.text(`Mesa: ${order.table ?? "-"}`);
    doc.text(`Mozo/a: ${order.waiter ?? "-"}`);
    doc.text(`Fecha: ${new Date(order.date ?? Date.now()).toLocaleString("es-AR")}`);
    doc.text(divider);

    // --- Items ---
    // OJO acá: `text(a, { continued: true })` seguido de `text(b, { align:
    // "right" })` NO alinea "b" contra el borde derecho de la página, lo
    // alinea dentro del propio flujo de texto (un error común de pdfkit).
    // La forma correcta de simular dos columnas (nombre a la izquierda,
    // precio a la derecha) es fijar explícitamente la misma coordenada `y`
    // para ambos `text()` y darle a cada uno su propio `width`.
    for (const item of order.items || []) {
      const y = doc.y;
      const priceText = `$${(item.price * item.quantity).toFixed(2)}`;

      doc.text(`${item.quantity}x ${item.name}`, doc.page.margins.left, y, {
        width: contentWidth * 0.65,
      });
      doc.text(priceText, doc.page.margins.left, y, {
        width: contentWidth,
        align: "right",
      });
    }

    doc.text(divider);

    // --- Total ---
    doc.fontSize(11).font("Helvetica-Bold").text(
      `TOTAL: $${Number(order.total ?? 0).toFixed(2)}`,
      { align: "right" }
    );

    doc.moveDown();
    doc.fontSize(8).font("Helvetica").text("¡Gracias por su visita!", { align: "center" });

    doc.end();
  });
}

export { generateOrderTicket };

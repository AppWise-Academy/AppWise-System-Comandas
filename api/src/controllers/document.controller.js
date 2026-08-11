import { generateSalesReport } from "../services/excel.service.js";
import { generateOrderTicket } from "../services/pdf.service.js";

// Estos dos controladores no usan `shared/apiResponse.js` (que devuelve
// JSON): acá la respuesta ES el archivo binario, así que seteamos los
// headers HTTP a mano y mandamos el Buffer directo con `res.send`.

async function generateSalesReportController(req, res) {
  const { orders } = req.validated.body;

  const buffer = await generateSalesReport(orders);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="reporte-ventas-${Date.now()}.xlsx"`
  );

  res.send(buffer);
}

async function generateOrderTicketController(req, res) {
  const order = req.validated.body;

  const buffer = await generateOrderTicket(order);

  res.setHeader("Content-Type", "application/pdf");
  // "inline" (en vez de "attachment"): el navegador/Postman puede
  // previsualizarlo directamente, sin forzar la descarga.
  res.setHeader(
    "Content-Disposition",
    `inline; filename="ticket-comanda-${order.orderNumber ?? Date.now()}.pdf"`
  );

  res.send(buffer);
}

export { generateSalesReportController, generateOrderTicketController };

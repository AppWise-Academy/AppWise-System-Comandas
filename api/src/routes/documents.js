import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { salesReportSchema, orderTicketSchema } from "../schemas/document.schema.js";
import {
  generateSalesReportController,
  generateOrderTicketController,
} from "../controllers/document.controller.js";

const router = Router();

// Se monta automáticamente en /api/documents.
router.post("/excel/sales-report", validate(salesReportSchema), generateSalesReportController);
router.post("/pdf/ticket", validate(orderTicketSchema), generateOrderTicketController);

export default router;

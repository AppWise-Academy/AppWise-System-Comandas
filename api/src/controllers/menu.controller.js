import { cartaQuerySchema, masVendidosQuerySchema } from "../schemas/menu.schema.js";
import { getActiveMenu, getBestSelling } from "../services/menu.service.js";
import { SuccessResponse } from "../shared/responses/SuccessResponse.js";

export async function getCarta(req, res) {
  const { ordenar } = cartaQuerySchema.parse(req.query);
  const carta = await getActiveMenu(ordenar);

  const response = new SuccessResponse("Active menu retrieved", 200, carta);

  return res.status(200).json(response);
}

export async function getMasVendidos(req, res) {
  const { limite, periodo } = masVendidosQuerySchema.parse(req.query);
  const productos = await getBestSelling({
    limit: limite,
    period: periodo,
  });

  const response = new SuccessResponse("Best-selling products retrieved", 200, productos);

  return res.status(200).json(response);
}

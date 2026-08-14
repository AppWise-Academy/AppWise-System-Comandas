import { cartaQuerySchema } from "../schemas/menu.schema.js";
import { getActiveMenu } from "../services/menu.service.js";
import { SuccessResponse } from "../shared/responses/SuccessResponse.js";

export async function getCarta(req, res) {
  const { ordenar } = cartaQuerySchema.parse(req.query);
  const carta = await getActiveMenu(ordenar);

  const response = new SuccessResponse("Active menu retrieved", 200, carta);

  return res.status(200).json(response);
}

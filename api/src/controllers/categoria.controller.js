import { create } from "../services/categoria.service.js";
import { SuccessResponse } from "../shared/responses/SuccessResponse.js";

export async function createCategoria(req, res) {
  const categoria = await create(req.validated.body);
  const response = new SuccessResponse("Category created", 201, categoria);

  return res.status(201).json(response);
}

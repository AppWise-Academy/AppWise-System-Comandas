import { create, list } from "../services/categoria.service.js";
import { SuccessResponse } from "../shared/responses/SuccessResponse.js";
import { parseNonNegativeInteger, parsePositiveInteger } from "../utils/pagination.js";

export async function createCategoria(req, res) {
  const categoria = await create(req.validated.body);
  const response = new SuccessResponse("Category created", 201, categoria);

  return res.status(201).json(response);
}

export async function listCategorias(req, res) {
  // Parseo la query param "activas" a un booleano si vino como str
  const activeCategoryFilter = req.query.activas === "false" || req.query.activas === false ? false : true;

  const result = await list({
    skip: parseNonNegativeInteger(req.query.skip, 0),
    limit: parsePositiveInteger(req.query.limit, 20),
    activas: activeCategoryFilter,
  });
  const response = new SuccessResponse("Categories retrieved", 200, result);

  return res.status(200).json(response);
}

import { create, deactivate, getById, getAll, update } from "../services/categoria.service.js";
import { createCategoriaSchema, updateCategoriaSchema } from "../schemas/categoria.schema.js";
import { SuccessResponse } from "../shared/responses/SuccessResponse.js";
import { normalizeCategoriaBody } from "../utils/categoria.js";
import { parseNonNegativeInteger, parsePositiveInteger } from "../utils/pagination.js";

export async function createCategoria(req, res) {
  const data = createCategoriaSchema.parse(normalizeCategoriaBody(req));
  const categoria = await create(data);

  const response = new SuccessResponse("Category created", 201, categoria);

  return res.status(201).json(response);
}

export async function updateCategoria(req, res) {
  const data = updateCategoriaSchema.parse(normalizeCategoriaBody(req));
  const categoria = await update(req.params.id, data);

  const response = new SuccessResponse("Category updated", 200, categoria);

  return res.status(200).json(response);
}

export async function deleteCategoria(req, res) {
  await deactivate(req.params.id);

  return res.status(204).send();
}

export async function getAllCategorias(req, res) {
  // Parseo la query param "activas" a un booleano si vino como str
  const activeCategoryFilter = req.query.activas === "false" || req.query.activas === false ? false : true;

  const result = await getAll({
    skip: parseNonNegativeInteger(req.query.skip, 0),
    limit: parsePositiveInteger(req.query.limit, 20),
    activas: activeCategoryFilter,
  });
  const response = new SuccessResponse("Categories retrieved", 200, result);

  return res.status(200).json(response);
}

export async function getCategoriaById(req, res) {
  const categoria = await getById(req.params.id);
  const response = new SuccessResponse("Category retrieved", 200, categoria);

  return res.status(200).json(response);
}

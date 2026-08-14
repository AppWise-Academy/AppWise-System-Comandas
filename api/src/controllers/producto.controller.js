import { create, getAll, getById, update } from "../services/producto.service.js";
import { createProductoSchema, updateProductoSchema } from "../schemas/producto.schema.js";
import { SuccessResponse } from "../shared/responses/SuccessResponse.js";
import { destroyCloudinaryImage } from "../utils/cloudinary.js";
import { parseNonNegativeInteger, parsePositiveInteger } from "../utils/pagination.js";
import { normalizeProductoBody } from "../utils/producto.js";

export async function createProducto(req, res) {
  try {
    const data = createProductoSchema.parse(normalizeProductoBody(req));
    const producto = await create(data);

    const response = new SuccessResponse("Product created", 201, producto);

    return res.status(201).json(response);
  } catch (error) {
    await destroyCloudinaryImage(req.file?.filename);
    throw error;
  }
}

export async function getAllProductos(req, res) {
  const activeProductFilter = req.query.active === "false" || req.query.active === false ? false : true;
  const availableProductFilter = req.query.available === "true"
    ? true
    : req.query.available === "false"
      ? false
      : undefined;

  const result = await getAll({
    skip: parseNonNegativeInteger(req.query.skip, 0),
    limit: parsePositiveInteger(req.query.limit, 20),
    category: req.query.category,
    available: availableProductFilter,
    active: activeProductFilter,
  });

  const response = new SuccessResponse("Products retrieved", 200, result);

  return res.status(200).json(response);
}

export async function updateProducto(req, res) {
  let data;

  try {
    data = updateProductoSchema.parse(normalizeProductoBody(req));
  } catch (error) {
    await destroyCloudinaryImage(req.file?.filename);
    throw error;
  }

  const producto = await update(req.params.id, data);
  const response = new SuccessResponse("Product updated", 200, producto);

  return res.status(200).json(response);
}

export async function getProductoById(req, res) {
  const producto = await getById(req.params.id);

  const response = new SuccessResponse("Product retrieved", 200, producto);

  return res.status(200).json(response);
}

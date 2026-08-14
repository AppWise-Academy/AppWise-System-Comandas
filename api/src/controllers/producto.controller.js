import { create } from "../services/producto.service.js";
import { createProductoSchema } from "../schemas/producto.schema.js";
import { SuccessResponse } from "../shared/responses/SuccessResponse.js";
import { destroyCloudinaryImage } from "../utils/cloudinary.js";
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

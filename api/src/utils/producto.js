/**
 * Normaliza los datos de un producto recibidos por la API.
 *
 * En las peticiones multipart, los campos no binarios llegan como strings.
 * Esta función convierte los campos numéricos y booleanos a sus tipos
 * esperados y toma las referencias generadas por CloudinaryStorage cuando
 * se adjunta una nueva imagen.
 *
 * @param {import("express").Request} req Request de Express.
 * @returns {Record<string, unknown>} Body normalizado para validación con Zod.
 */
export function normalizeProductoBody(req) {
  const body = { ...req.body };

  if (req.is("multipart/form-data")) {
    for (const field of ["price", "cost", "stock", "sold", "order"]) {
      if (body[field] !== undefined && body[field] !== "") {
        body[field] = Number(body[field]);
      }
    }

    for (const field of ["available", "active"]) {
      if (body[field] === "true") {
        body[field] = true;
      } else if (body[field] === "false") {
        body[field] = false;
      }
    }
  }

  const uploadedImageUrl = req.file?.path ?? req.file?.secure_url ?? req.file?.url;
  if (uploadedImageUrl) {
    body.image = uploadedImageUrl;
  }

  if (req.file?.filename) {
    body.imagePublicId = req.file.filename;
  }

  return body;
}

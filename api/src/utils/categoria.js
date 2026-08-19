/**
 * Normaliza los datos de una categoría recibidos por la API.
 *
 * En las peticiones multipart, los campos no binarios llegan como strings.
 * Esta función convierte `order` y `active` a sus tipos esperados y toma la
 * URL generada por CloudinaryStorage cuando se adjunta una nueva imagen.
 *
 * @param {import("express").Request} req Request de Express.
 * @returns {Record<string, unknown>} Body normalizado para validación con Zod.
 */
export function normalizeCategoriaBody(req) {
  const body = { ...req.body };

  if (req.is("multipart/form-data")) {
    if (body.order !== undefined) {
      body.order = Number(body.order);
    }

    if (body.active === "true") {
      body.active = true;
    } else if (body.active === "false") {
      body.active = false;
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

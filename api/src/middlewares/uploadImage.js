import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { extname } from "node:path";
import cloudinary from "../config/cloudinary.js";
import { ValidationError } from "../shared/errors/index.js";

export const IMAGE_FIELD_NAME = "image";
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jfif",
  "image/png",
  "image/webp",
];
export const ALLOWED_IMAGE_FORMATS = ["jpg", "jpeg", "jfif", "png", "webp"];

/**
 * Valida el MIME type del archivo antes de enviarlo a Cloudinary.
 *
 * Multer ejecuta este filtro por cada archivo recibido. Los tipos no
 * permitidos se convierten en un error controlado por el errorHandler global.
 */
function imageFileFilter(_req, file, callback) {
  const extension = extname(file.originalname).slice(1).toLowerCase();
  const hasAllowedMimeType = ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype);
  const hasAllowedExtension = ALLOWED_IMAGE_FORMATS.includes(extension);

  if (!hasAllowedMimeType && !hasAllowedExtension) {
    return callback(
      new ValidationError(
        "Only JPG, JPEG, JFIF, PNG and WebP images are allowed",
        "INVALID_IMAGE_TYPE",
      ),
    );
  }

  return callback(null, true);
}

/**
 * Crea un middleware Multer configurado para subir una imagen a una carpeta
 * específica de Cloudinary.
 *
 * El middleware acepta un único archivo en el campo `image`, limita el
 * tamaño a 5 MB y utiliza CloudinaryStorage para evitar guardar archivos en
 * el disco local.
 *
 * @param {string} folder Carpeta destino dentro de Cloudinary.
 * @returns {import("express").RequestHandler} Middleware de subida.
 */
function createImageUpload(folder) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ALLOWED_IMAGE_FORMATS,
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: MAX_IMAGE_SIZE },
    fileFilter: imageFileFilter,
  }).single(IMAGE_FIELD_NAME);

  return upload;
}

export const uploadCategoriaImage = createImageUpload("appwise-comandas/menu/categorias");
export const uploadProductoImage = createImageUpload("appwise-comandas/menu/productos");

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { ValidationError } from "../shared/errors/index.js";

export const IMAGE_FIELD_NAME = "imagen";
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const ALLOWED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];

function imageFileFilter(_req, file, callback) {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    return callback(
      new ValidationError(
        "Only JPG, JPEG, PNG and WebP images are allowed",
        "INVALID_IMAGE_TYPE",
      ),
    );
  }

  return callback(null, true);
}

function createImageUpload(folder) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ALLOWED_IMAGE_FORMATS,
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_IMAGE_SIZE },
    fileFilter: imageFileFilter,
  }).single(IMAGE_FIELD_NAME);
}

export const uploadCategoriaImage = createImageUpload("appwise-comandas/menu/categorias");
export const uploadProductoImage = createImageUpload("appwise-comandas/menu/productos");

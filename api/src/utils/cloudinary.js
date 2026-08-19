import cloudinary from "../config/cloudinary.js";

/**
 * Elimina una imagen de Cloudinary cuando una operación necesita compensar
 * una subida o reemplazo que no pudo persistirse correctamente.
 *
 * Los errores de limpieza se ignoran para no ocultar el error original de la
 * operación principal.
 *
 * @param {string|null|undefined} publicId Identificador público del asset.
 * @returns {Promise<void>} Promesa resuelta después de intentar eliminarlo.
 */
export async function destroyCloudinaryImage(publicId) {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // La limpieza es compensatoria y no debe ocultar el error original.
  }
}

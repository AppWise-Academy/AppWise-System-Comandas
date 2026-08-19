import { ConflictError, ValidationError } from "../shared/errors/index.js";

/**
 * Traduce errores de persistencia de Mongoose a errores controlados por la API.
 *
 * @param {Error & { code?: number }} error Error producido por Mongoose.
 * @param {string} message Mensaje del error controlado.
 * @param {string} [code] Código opcional del error controlado.
 * @throws {ConflictError|ValidationError|Error} Error traducido o error original.
 */
export function translateMongooseError(error, message, code = null) {
  if (error?.code === 11000) {
    throw new ConflictError(message, code);
  }

  if (error?.name === "ValidationError") {
    throw new ValidationError(message, code);
  }

  throw error;
}

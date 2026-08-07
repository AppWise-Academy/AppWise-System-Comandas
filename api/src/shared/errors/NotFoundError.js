import ApiError from "./ApiError.js";

export class NotFoundError extends ApiError {
  constructor(message = "Recurso no encontrado", code = null) {
    super(message, 404, code);
  }
}
import ApiError from "./ApiError.js";

export class NotFoundError extends ApiError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404);
  }
}
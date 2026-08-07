import ApiError from "./ApiError.js";

export class ForbiddenError extends ApiError {
  constructor(message = "No tienes permisos para realizar esta acción", code = null) {
    super(message, 403, code);
  }
}
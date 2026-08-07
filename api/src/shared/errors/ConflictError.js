import ApiError from "./ApiError.js";

export class ConflictError extends ApiError {
  constructor(message = "El recurso ya existe o entra en conflicto", code = null) {
    super(message, 409, code);
  }
}
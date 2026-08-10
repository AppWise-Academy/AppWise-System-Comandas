import ApiError from "./ApiError.js";

export class ValidationError extends ApiError {
  constructor(message = "Petición Invalida", code = null) {
    super(message, 400, code);
  }
}
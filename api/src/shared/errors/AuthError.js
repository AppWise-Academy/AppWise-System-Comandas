import ApiError from "./ApiError.js";

export class AuthError extends ApiError {
  constructor(message = "No autorizado", code = null) {
    super(message, 401, code);
  }
}
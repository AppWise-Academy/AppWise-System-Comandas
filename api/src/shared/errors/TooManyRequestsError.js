import ApiError from "./ApiError.js";

export class TooManyRequestsError extends ApiError {
  constructor(message = "Demasiadas solicitudes. Inténtelo nuevamente más tarde", code = null) {
    super(message, 429, code);
  }
}
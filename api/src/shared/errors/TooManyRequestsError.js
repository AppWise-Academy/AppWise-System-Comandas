import ApiError from "./ApiError.js";

export class TooManyRequestsError extends ApiError {
  constructor(message = "Demasiadas solicitudes. Inténtelo nuevamente más tarde") {
    super(message, 429);
  }
}
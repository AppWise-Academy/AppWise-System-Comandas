import ApiError from "./ApiError";

export class ValidationError extends ApiError {
  constructor(message = "Petición Invalida") {
    super(message, 400);
  }
}
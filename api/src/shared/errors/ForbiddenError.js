import ApiError from "./ApiError";

export class ForbiddenError extends ApiError {
  constructor(message = "No tienes permisos para realizar esta acción") {
    super(message, 403);
  }
}
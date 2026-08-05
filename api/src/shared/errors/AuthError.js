import ApiError from "./ApiError";

export class AuthError extends ApiError {
  constructor(menssage = "No autorizado") {
    super(message, 401);
  }
}
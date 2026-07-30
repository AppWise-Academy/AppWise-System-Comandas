class ApiError extends Error {
  constructor(status, message, code = null) {
    super(message);
    this.status = status;
    // this.message = message;
    this.code = code;
    this.isOptional = true; // lo lanzamos nostros
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = "Petición Invalida", code) {
    return new ApiError(400, msg, code);
  }
  static unauthorized(msg = "No autenticado", code) {
    return new ApiError(401, msg, code);
  }
  static forbidden(msg = "Sin Permiso", code) {
    return new ApiError(403, msg, code);
  }
  static notFound(msg = "Recurso no encontrado", code) {
    return new ApiError(404, msg, code);
  }
  static conflict(msg = "Conflicto", code) {
    return new ApiError(409, msg, code);
  }
  static tooMany(msg = "Demasiadas Peticiones", code) {
    return new ApiError(429, msg, code);
  }
  static internal(msg = "Error interno", code) {
    return new ApiError(500, msg, code);
  }
}

export default ApiError;

class ApiError extends Error {
  constructor(message, statusCode, code = null) {
    super(message); //usamos la prop message que deriva la clase Error
    this.statusCode = statusCode; //codigo de error
    this.code = code; //codigo interno de la api (por el momento no usamos)
    Error.captureStackTrace(this, this.constructor); //captura de donde proviene el error (ignorando este constructor)
  }

  //DESHABILITO LOS FACTORY METHOS PORQUE VAMOS A USAR HERENCIA
  // static badRequest(msg = "Petición Invalida", code) {
  //   return new ApiError(400, msg, code);
  // }
  // static unauthorized(msg = "No autenticado", code) {
  //   return new ApiError(401, msg, code);
  // }
  // static forbidden(msg = "Sin Permiso", code) {
  //   return new ApiError(403, msg, code);
  // }
  // static notFound(msg = "Recurso no encontrado", code) {
  //   return new ApiError(404, msg, code);
  // }
  // static conflict(msg = "Conflicto", code) {
  //   return new ApiError(409, msg, code);
  // }
  // static tooMany(msg = "Demasiadas Peticiones", code) {
  //   return new ApiError(429, msg, code);
  // }
  // static internal(msg = "Error interno", code) {
  //   return new ApiError(500, msg, code);
  // }
}

export default ApiError;

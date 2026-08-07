class ApiError extends Error {
  constructor(message, statusCode, code = null) {
    super(message); //usamos la prop message que deriva la clase Error
    this.statusCode = statusCode; //codigo de error
    this.code = code; //codigo interno de la api, opcional (ej: "EMAIL_DUPLICADA")
    Error.captureStackTrace(this, this.constructor); //captura de donde proviene el error (ignorando este constructor)
  }
}

export default ApiError;

export class ErrorResponse {
  constructor(message, statusCode, errors = null, path, code = null) {
    this.success = false;
    this.message = message;
    this.statusCode = statusCode;
    if (errors) this.errors = errors;
    if (code) this.code = code;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}
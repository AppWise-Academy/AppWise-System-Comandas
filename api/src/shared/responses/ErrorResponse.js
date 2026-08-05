export class ErrorResponse {
  constructor(message, statusCode, errors = null, path) {
    this.success = false;
    this.message = message;
    this.statusCode = statusCode;
    if (errors) this.errors = errors;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}
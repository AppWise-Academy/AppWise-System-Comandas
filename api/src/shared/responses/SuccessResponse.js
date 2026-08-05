export class SuccessResponse {
  constructor(message = "Operación exitosa", statusCode, data) {
    this.success = true;
    this.message = message;
    this.statusCode = statusCode
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}
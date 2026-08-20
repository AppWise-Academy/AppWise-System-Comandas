import ApiError from "./ApiError.js";

// La usamos cuando la falla no es "culpa" del cliente (no es 400) sino de
// un servicio de terceros con el que integramos (SMTP, Resend, y en el
// futuro Mercado Pago). Status 502 = Bad Gateway: "nosotros estamos bien,
// el servicio externo al que llamamos falló o no respondió como esperábamos".
export class ExternalServiceError extends ApiError {
  constructor(message = "Error al comunicarse con un servicio externo", code = null) {
    super(message, 502, code);
  }
}

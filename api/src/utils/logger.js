import winston from "winston";

export const logger = winston.createLogger({
  //LOGGER DE TIPO: error, warn e info
  level: "info",

  //FORMATO DEL LOGGER
  format: winston.format.combine(
    winston.format.timestamp(), //agrega timestamp

    //implementamos el stack trace en todos los errors
    winston.format.errors({
      stack: true 
    }),

    //formato de impresión del log:
    //[fecha] tipo: mensaje
    //[metodo] /ruta/de/peticion
    //stack trace
    winston.format.printf(
      ({ level, message, timestamp, method, path, stack }) => {
        return `[${timestamp}] ${level}: ${message}
        [${method}] ${path}${stack ? `\n${stack}` : ""}`;
      }
    ),
  ),

  transports: [
    new winston.transports.Console(),
  ],
})
import { ZodError } from "zod";
import ApiError from "../shared/errors/ApiError.js";
import { logger } from "../utils/logger.js";
import { ErrorResponse } from "../shared/responses/ErrorResponse.js";

function transformZodErrors(issues){
  return issues.reduce((acc, issue) => {
    const field = issue.path.length ? issue.path.join(".") : "body";
    
    const message = issue.path.length === 0 
    ? "El cuerpo de la petición debe ser un objeto JSON válido" 
    : issue.message;

    if (!acc[field]){
      acc[field] = [];
    }

    acc[field].push(message);

    return acc
  }, {})
}

export function errorHandler(err, req, res, _next){
//-------------
//ERROR LOGGER
//-------------
  logger.error({
    message: err.message,   //se trae del Error
    method: req.method,     //se trae del request 
    path: req.originalUrl,  //se trae del request 
    stack: err.stack,       //se trae del Error
  });


//-------------
//API ERROR
//-------------
  if (err instanceof ApiError) {
    const apiErrorResponse = new ErrorResponse(err.message, err.statusCode, null, req.originalUrl, err.code);
    return res.status(err.statusCode).json(apiErrorResponse);
  }


//-------------
//ZOD ERROR
//-------------
  if (err instanceof ZodError) {
    const zodErrors = transformZodErrors(err.issues);
    const zodErrorResponse = new ErrorResponse("Error de validación de datos", 400, zodErrors, req.originalUrl);

    return res.status(400).json(zodErrorResponse);
  }

//-------------
//GENERAL ERROR
//------------- 
  const internalError = new ErrorResponse("Internal server error", 500, null, req.originalUrl);
  return res.status(500).json(internalError);
}
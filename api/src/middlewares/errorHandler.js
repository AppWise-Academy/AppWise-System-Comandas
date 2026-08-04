import { ZodError } from "zod";
import ApiError from "../shared/errors/ApiError.js";
import { logger } from "../utils/logger.js";

function transformZodErrors(issues){
  return issues.reduce((acc, issue) => {
    const field = issue.path.join(".");

    if (!acc[field]){
      acc[field] = [];
    }

    acc[field].push(issue.message);

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
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    })
  }


//-------------
//ZOD ERROR
//-------------
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Los datos enviados son inválidos",
      errors: transformZodErrors(err.issues),
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    })
  }

//-------------
//GENERAL ERROR
//-------------
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal server error",
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  })
}
//BARREL INDEX
export { default as ApiError } from "./ApiError.js";

export { AuthError } from "./AuthError.js";
export { ConflictError } from "./ConflictError.js";
export { ForbiddenError } from "./ForbiddenError.js";
export { NotFoundError } from "./NotFoundError.js";
export { TooManyRequestsError } from "./TooManyRequestsError.js";
export { ValidationError } from "./ValidationError.js";
export { ExternalServiceError } from "./ExternalServiceError.js";

//para importar cualquier instancia de error:
// import {
//   AuthError,
//   NotFoundError,
//   ConflictError,
// } from "../shared/errors/index.js";
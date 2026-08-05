import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import apiRoutes from "./routes/index.js";
import "dotenv/config"; //para los tests
import { errorHandler } from "./middlewares/errorHandler.js";
import { globalLimiter, authLimiter } from "./middlewares/rateLimiter.js";
import { corsMiddleware } from "./middlewares/cors.js";
import { helmetMiddleware } from "./middlewares/helmet.js";
import { NotFoundError } from "./shared/errors/NotFoundError.js";
import { SuccessResponse } from "./shared/responses/SuccessResponse.js";

const app = express();

//-------------------
//1. Body Parser
//-------------------
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

//-------------------
//2. CORS
//-------------------
app.use(corsMiddleware);

//-------------------
//3. Helmet
//-------------------
app.use(helmetMiddleware);
app.disable('x-powered-by');

//-------------------
//4. Request Logger
//-------------------
app.use(morgan("dev"));

//-------------------
//5 & 6. Rate limiters
//-------------------
app.use(globalLimiter);

app.use("/api/auth", authLimiter);

//-------------------
//8. Rutas de la app
//-------------------
app.get("/health", (req, res) => {
  const uptime = process.uptime().toFixed(2)+" segundos";
  const healthResponse = new SuccessResponse("API online", 200, {uptime})

  res.status(200).json(healthResponse);
});

//ruta para probar un error no controlado (status 500)
app.get("/error", (req, res) => {
  throw new Error("Error de prueba");
});

app.use(`/api`, apiRoutes);

//9. route 404 handler
app.use((req, res, next) => {
  next(new NotFoundError(`Ruta ${req.originalUrl} no encontrada`));
})

//-------------------
//10. Error Handler Global
//-------------------
app.use(errorHandler);

export default app;
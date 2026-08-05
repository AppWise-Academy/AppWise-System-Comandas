import cors from "cors";

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

export const corsMiddleware = cors({
  origin: allowedOrigins,
  credentials: true,
});
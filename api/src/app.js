import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/healt", (req, res) => {
  res.json({ message: "Hola, estamos online" });
});

app.use(`/api`, apiRoutes);

export default app;

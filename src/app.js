import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { modules } from "./modules/index.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    environment: env.nodeEnv,
  });
});

for (const moduleItem of modules) {
  app.use(moduleItem.basePath, moduleItem.router);
}

app.use(notFound);
app.use(errorHandler);

export default app;


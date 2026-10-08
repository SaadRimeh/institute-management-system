import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validations/auth.validation.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts from this IP, please try again after 15 minutes.",
  },
});

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", authenticate, me);

export default router;


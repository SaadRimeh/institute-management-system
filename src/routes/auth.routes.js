import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema } from "../validations/auth.validation.js";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);

export default router;


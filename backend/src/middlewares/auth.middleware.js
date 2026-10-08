import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized", 401));
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
      return next(new AppError("Unauthorized", 401));
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    return next();
  } catch (_error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};


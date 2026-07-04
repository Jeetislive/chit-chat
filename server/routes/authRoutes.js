import express from "express"
import { protectRoutes } from "../middleware/protectRoutes.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { signupSchema, loginSchema, updateProfileSchema, forgotPasswordSchema, verifyResetCodeSchema, resetPasswordSchema } from "../validators/auth.validator.js";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", authLimiter, validate(signupSchema), authController.signup);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/profile", protectRoutes, authController.getProfile);
router.put("/profile", protectRoutes, validate(updateProfileSchema), authController.updateProfile);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/verify-reset-code", authLimiter, validate(verifyResetCodeSchema), authController.verifyResetCode);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post("/refresh", authController.refreshToken);

export default router;

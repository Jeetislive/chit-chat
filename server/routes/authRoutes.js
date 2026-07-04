import express from "express"
import { protectRoutes } from "../middleware/protectRoutes.js";
import { validate } from "../middleware/validate.js";
import { signupSchema, loginSchema, updateProfileSchema } from "../validators/auth.validator.js";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/profile", protectRoutes, authController.getProfile);
router.put("/profile", protectRoutes, validate(updateProfileSchema), authController.updateProfile);

export default router;

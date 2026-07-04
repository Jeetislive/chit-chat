import express from "express"
import { protectRoutes } from "../middleware/protectRoutes.js";
import * as userController from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoutes, userController.getUsers);
router.put("/public-key", protectRoutes, userController.savePublicKey);
router.get("/public-key/:id", protectRoutes, userController.getPublicKey);
router.get("/:id", protectRoutes, userController.getUserProfile);

export default router;

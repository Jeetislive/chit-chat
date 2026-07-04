import express from "express"
import { protectRoutes } from "../middleware/protectRoutes.js";
import * as userController from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoutes, userController.getUsers);
router.get("/:id", protectRoutes, userController.getUserProfile);

export default router;

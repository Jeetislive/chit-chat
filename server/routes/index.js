import express from "express"


import authRoute from "./authRoutes.js";
import messageRoute from "./messageRoutes.js";
import userRoutes from "./userRoutes.js";
import conversationRoutes from "./conversationRoutes.js";

const router = express.Router();

router.use('/auth', authRoute);
router.use('/messages',messageRoute)
router.use('/users',userRoutes)
router.use('/conversations', conversationRoutes)

export default router;
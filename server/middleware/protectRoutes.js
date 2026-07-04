import jwt from "jsonwebtoken"
import User from "../model/userAuthSchema.js";
import { UnauthorizedError, NotFoundError } from "../errors/AppError.js";
import { logger } from "../config/logger.js";

export const protectRoutes = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) throw new UnauthorizedError("Please login to access this route");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) throw new UnauthorizedError("Invalid token or token expired");

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) throw new NotFoundError("User not found");

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: "Invalid token or token expired" });
        }
        if (error.isOperational) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        logger.error({ err: error }, "Auth middleware error");
        res.status(500).json({ error: "Internal server error" });
    }
};

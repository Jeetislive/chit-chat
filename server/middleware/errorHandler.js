import { logger } from "../config/logger.js";
import { AppError } from "../errors/AppError.js";

export function errorHandler(err, req, res, _next) {
    if (err instanceof AppError) {
        logger.warn({ statusCode: err.statusCode, message: err.message, path: req.path });
        return res.status(err.statusCode).json({ success: false, error: err.message });
    }

    logger.error({ err, path: req.path, method: req.method }, "Unhandled error");
    res.status(500).json({ success: false, error: "Internal server error" });
}

export function notFoundHandler(req, res) {
    res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
}

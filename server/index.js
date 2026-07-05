import express from "express"
import dotenv from "dotenv"
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import { connectDB } from "./db/db.js";
import router from "./routes/index.js";
import { setupSocket } from "./socket/socket.js";
import { logger } from "./config/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { sanitizeInput } from "./middleware/sanitize.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 9000;

app.set("trust proxy", 1);

const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
app.use(cors({ origin: clientUrl }));
app.use(express.json({ limit: "1mb" }));
app.use(sanitizeInput);

function requestTimeout(ms) {
    return (req, res, next) => {
        const timer = setTimeout(() => {
            logger.warn({ method: req.method, path: req.path, ip: req.ip }, "Request timeout");
            res.status(408).json({ error: "Request timeout" });
        }, ms);
        res.on("finish", () => clearTimeout(timer));
        next();
    };
}

app.use(requestTimeout(30000));

app.use("/api", router);

app.get("/", (req, res) => {
    res.send("Hello, World!!")
})

app.use(notFoundHandler);
app.use(errorHandler);

const server = createServer(app);
const io = new Server(server, {
    cors: { origin: clientUrl, methods: ["GET", "POST"] },
});

setupSocket(io);

connectDB()
.then(() => {
    server.listen(PORT, () => {
        logger.info({ port: PORT }, "Server started");
    });
})
.catch((err) => {
    logger.fatal({ err }, "Failed to connect to database");
    process.exit(1);
});

function gracefulShutdown(signal) {
    logger.info({ signal }, "Shutting down gracefully");
    server.close(() => {
        logger.info("Server closed");
        process.exit(0);
    });
    setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
    logger.error({ err }, "Unhandled rejection");
});

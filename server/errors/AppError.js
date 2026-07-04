export class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(404, message);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(401, message);
    }
}

export class ValidationError extends AppError {
    constructor(message = "Validation failed") {
        super(400, message);
    }
}

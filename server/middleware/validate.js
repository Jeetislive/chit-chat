import { ValidationError } from "../errors/AppError.js";

export function validate(schema, source = "body") {
    return (req, _res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const messages = result.error.issues.map((issue) => {
                const field = issue.path.join(".");
                return field ? `${field}: ${issue.message}` : issue.message;
            });
            return next(new ValidationError(messages.join(". ")));
        }
        req[source] = result.data;
        next();
    };
}

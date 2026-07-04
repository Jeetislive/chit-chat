import { ValidationError } from "../errors/AppError.js";

export function validate(schema, source = "body") {
    return (req, _res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const first = result.error.issues[0];
            return next(new ValidationError(`${first.path.join(".")}: ${first.message}`));
        }
        req[source] = result.data;
        next();
    };
}

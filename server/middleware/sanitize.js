function stripTags(value) {
    return value.replace(/<[^>]*>/g, "");
}

function sanitizeString(value) {
    if (typeof value !== "string") return value;
    return stripTags(value.trim());
}

function sanitizeObject(obj) {
    if (!obj || typeof obj !== "object") return obj;
    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === "string") {
            obj[key] = sanitizeString(obj[key]);
        } else if (Array.isArray(obj[key])) {
            obj[key] = obj[key].map((item) =>
                typeof item === "string" ? sanitizeString(item) : sanitizeObject(item)
            );
        } else if (obj[key] && typeof obj[key] === "object") {
            sanitizeObject(obj[key]);
        }
    }
    return obj;
}

export function sanitizeInput(req, _res, next) {
    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);
    next();
}

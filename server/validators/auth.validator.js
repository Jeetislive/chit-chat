import { z } from "zod";

export const signupSchema = z.object({
    name: z.string().min(1, "Name is required").max(50),
    username: z.string().min(3, "Username must be at least 3 characters").max(30),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phone: z.string().min(1, "Phone is required"),
    gender: z.enum(["male", "female"]),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
    name: z.string().max(50).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    gender: z.enum(["male", "female"]).optional(),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email"),
});

export const verifyResetCodeSchema = z.object({
    email: z.string().email("Invalid email"),
    code: z.string().length(6, "Code must be 6 digits"),
});

export const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email"),
    code: z.string().length(6, "Code must be 6 digits"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

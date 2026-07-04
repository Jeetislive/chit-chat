import { z } from "zod";

export const signupSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(50, "Name must be under 50 characters"),
    username: z
        .string().trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be under 30 characters"),
    email: z.string().trim().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().trim().min(1, "Phone number is required"),
    gender: z.enum(["male", "female"], { message: "Please select a gender" }),
});

export const loginSchema = z.object({
    username: z.string().trim().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
    name: z.string().trim().max(50, "Name must be under 50 characters").optional(),
    email: z.string().trim().email("Please enter a valid email address").optional(),
    phone: z.string().trim().optional(),
    gender: z.enum(["male", "female"]).optional(),
});

export const forgotPasswordSchema = z.object({
    email: z.string().trim().email("Please enter a valid email address"),
});

export const verifyResetCodeSchema = z.object({
    email: z.string().trim().email("Please enter a valid email address"),
    code: z.string().trim().length(6, "Reset code must be 6 digits"),
});

export const resetPasswordSchema = z.object({
    email: z.string().trim().email("Please enter a valid email address"),
    code: z.string().trim().length(6, "Reset code must be 6 digits"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../model/userAuthSchema.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { UnauthorizedError, ValidationError, NotFoundError } from "../errors/AppError.js";
import { sendWelcomeEmail, sendResetCodeEmail } from "./email.service.js";

function buildUserResponse(user) {
    return {
        token: generateAccessToken(user._id),
        refreshToken: generateRefreshToken(user._id),
        _id: user._id,
        fullName: user.name,
        username: user.username,
        profilePic: user.profilePic,
    };
}

export async function signup(data) {
    const existing = await User.findOne({ username: data.username });
    if (existing) throw new ValidationError("Username already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = new User({
        name: data.name,
        username: data.username,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        gender: data.gender,
    });

    await newUser.save();

    sendWelcomeEmail(data.email, data.name);

    return buildUserResponse(newUser);
}

export async function login(username, password) {
    const user = await User.findOne({ username });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    return buildUserResponse(user);
}

export async function refreshAccessToken(refreshToken) {
    if (!refreshToken) throw new UnauthorizedError("Refresh token required");

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, secret);
    } catch {
        throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.userId);
    if (!user) throw new UnauthorizedError("User not found");

    return { token: generateAccessToken(user._id) };
}

export async function getProfile(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new UnauthorizedError("User not found");
    return user;
}

export async function updateProfile(userId, data) {
    const user = await User.findById(userId);
    if (!user) throw new UnauthorizedError("User not found");

    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.phone) user.phone = data.phone;
    if (data.gender) user.gender = data.gender;

    await user.save();
    return user;
}

export async function forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw new NotFoundError("No account found with this email");

    const code = crypto.randomInt(100000, 999999).toString();
    user.resetCode = code;
    user.resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendResetCodeEmail(email, user.name, code);
}

export async function verifyResetCode(email, code) {
    const user = await User.findOne({ email });
    if (!user) throw new NotFoundError("No account found with this email");
    if (!user.resetCode || !user.resetCodeExpiry) throw new ValidationError("No reset code requested");
    if (user.resetCode !== code) throw new ValidationError("Invalid reset code");
    if (Date.now() > user.resetCodeExpiry.getTime()) throw new ValidationError("Reset code has expired");
}

export async function resetPassword(email, code, newPassword) {
    const user = await User.findOne({ email });
    if (!user) throw new NotFoundError("No account found with this email");
    if (!user.resetCode || !user.resetCodeExpiry) throw new ValidationError("No reset code requested");
    if (user.resetCode !== code) throw new ValidationError("Invalid reset code");
    if (Date.now() > user.resetCodeExpiry.getTime()) throw new ValidationError("Reset code has expired");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();
}

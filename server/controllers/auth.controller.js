import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const signup = asyncHandler(async (req, res) => {
    const data = await authService.signup(req.body);
    res.status(201).json(data);
});

export const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const data = await authService.login(username, password);
    res.json(data);
});

export const logout = asyncHandler(async (req, res) => {
    res.json({ msg: "Logged out successfully" });
});

export const getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user._id);
    res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user._id, req.body);
    res.json(user);
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json({ message: "If an account exists, a reset code has been sent." });
});

export const verifyResetCode = asyncHandler(async (req, res) => {
    const { email, code } = req.body;
    await authService.verifyResetCode(email, code);
    res.json({ message: "Code verified" });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { email, code, newPassword } = req.body;
    await authService.resetPassword(email, code, newPassword);
    res.json({ message: "Password reset successfully" });
});

export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: token } = req.body;
    const data = await authService.refreshAccessToken(token);
    res.json(data);
});

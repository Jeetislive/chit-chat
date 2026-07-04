import * as userService from "../services/user.service.js";
import User from "../model/userAuthSchema.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ValidationError } from "../errors/AppError.js";

export const getUsers = asyncHandler(async (req, res) => {
    const users = await userService.getUsersForSidebar(req.user._id);
    res.json(users);
});

export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await userService.getUserProfile(req.params.id);
    res.json(user);
});

export const savePublicKey = asyncHandler(async (req, res) => {
    const { publicKey } = req.body;
    if (!publicKey || typeof publicKey !== "string") {
        throw new ValidationError("Public key is required");
    }
    await User.findByIdAndUpdate(req.user._id, { publicKey });
    res.json({ message: "Public key saved" });
});

export const getPublicKey = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("publicKey");
    if (!user) throw new ValidationError("User not found");
    res.json({ publicKey: user.publicKey });
});

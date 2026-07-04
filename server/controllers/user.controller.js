import * as userService from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUsers = asyncHandler(async (req, res) => {
    const users = await userService.getUsersForSidebar(req.user._id);
    res.json(users);
});

export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await userService.getUserProfile(req.params.id);
    res.json(user);
});

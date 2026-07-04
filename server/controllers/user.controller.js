import * as userService from "../services/user.service.js";

export async function getUsers(req, res) {
    const users = await userService.getUsersForSidebar(req.user._id);
    res.json(users);
}

export async function getUserProfile(req, res) {
    const user = await userService.getUserProfile(req.params.id);
    res.json(user);
}

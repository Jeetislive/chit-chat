import * as authService from "../services/auth.service.js";

export async function signup(req, res) {
    const data = await authService.signup(req.body);
    res.status(201).json(data);
}

export async function login(req, res) {
    const { username, password } = req.body;
    const data = await authService.login(username, password);
    res.json(data);
}

export async function logout(req, res) {
    res.json({ msg: "Logged out successfully" });
}

export async function getProfile(req, res) {
    const user = await authService.getProfile(req.user._id);
    res.json(user);
}

export async function updateProfile(req, res) {
    const user = await authService.updateProfile(req.user._id, req.body);
    res.json(user);
}

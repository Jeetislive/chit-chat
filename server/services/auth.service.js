import bcrypt from "bcryptjs";
import User from "../model/userAuthSchema.js";
import { generateToken } from "../utils/generateToken.js";
import { UnauthorizedError, ValidationError } from "../errors/AppError.js";

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
    const token = generateToken(newUser._id);

    return {
        token,
        _id: newUser._id,
        fullName: newUser.name,
        username: newUser.username,
        profilePic: newUser.profilePic,
    };
}

export async function login(username, password) {
    const user = await User.findOne({ username });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedError("Invalid credentials");

    const token = generateToken(user._id);

    return {
        token,
        _id: user._id,
        fullName: user.name,
        username: user.username,
        profilePic: user.profilePic,
    };
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

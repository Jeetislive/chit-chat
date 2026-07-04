import User from "../model/userAuthSchema.js";
import { NotFoundError } from "../errors/AppError.js";

export async function getUsersForSidebar(loggedInUserId) {
    return User.find({ _id: { $ne: loggedInUserId } }).select("name username email phone gender profilePic");
}

export async function getUserProfile(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new NotFoundError("User not found");
    return user;
}

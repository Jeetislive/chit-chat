import User from "../model/userAuthSchema.js";

export const getUsersForSidebar = async(req,res) => {
    try {
        const loggedInUserId = req.user._id;
        
        const allUsersExceptLoggedIn = await User.find({
            _id: { $ne: loggedInUserId }
        });
        
        const formattedUsers = allUsersExceptLoggedIn.map(user => ({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            gender: user.gender,
            profilePic: user.profilePic,
        }));
        
        res.json(formattedUsers);
        
    } catch (error) {
        console.error("Error fetching users for sidebar:", error.message);
        res.status(500).json({ error: "Server error" });
    }
}

export const getUserProfile = async(req,res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            gender: user.gender,
            profilePic: user.profilePic,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error("Error fetching user profile:", error.message);
        res.status(500).json({ error: "Server error" });
    }
}
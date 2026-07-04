import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    confirmPassword: {
        type: String,
        minlength: 6
    },
    phone: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        enum: ["male", "female"]
    },
    profilePic: {
        type: String,
        default: ''
    },
    resetCode: {
        type: String,
        default: null,
    },
    resetCodeExpiry: {
        type: Date,
        default: null,
    },
    publicKey: {
        type: String,
        default: null,
    },
    
},{timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { createTokenForUser } = require('../service/auth');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String
    }
}, {timestamps: true});

userSchema.pre("save", async function(next){
    const user = this;

    if(!user.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);

    user.salt = salt;
    user.password = await bcrypt.hash(user.password, salt);
    next(); 
});

userSchema.static("matchUserProvidedPassword", async function(email, password) {
    const user = await this.findOne({ email });

    console.log("Email in matchUserProvidedPassword function",email)

    console.log("user in matchUserProvidedPassword function", user)

    if (!user) {
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        const token = createTokenForUser(user);
        return token;
    } else {
        throw new Error("Password not matched");
    }
});

const User = mongoose.model("user", userSchema);

const otpSchema = new mongoose.Schema({
    email: String,
    otp: String,
    createdAt: { type: Date, expires: '5m', default: Date.now }
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = {
    User,
    OTP
}
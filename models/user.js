const mongoose = require('mongoose');
const { createTokenForUser } = require('../service/auth');
const { comparePasswords, hashPassword } = require('../utils/hashAndComparePassword');

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
    }
}, { timestamps: true });

// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     this.password = await hashPassword(this.password);
//     next();
// });

userSchema.static('matchUserProvidedPassword', async function (email, password) {
    try {
        const user = await this.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await comparePasswords(password, user.password);
        if (!isMatch) {
            throw new Error('PasswordNotMatched');
        }

        return createTokenForUser(user);
    } catch (error) {
        console.error(error);
        throw error;
    }
});

const User = mongoose.model("user", userSchema);

const otpSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: 300,
        default: Date.now
    }
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = {
    User,
    OTP
}
const { User, OTP } = require('../models/user');
const generateOTP = require('../utils/generateOTP');
const sendOTPEmail = require('../utils/sendOTPMail');
const { hashPassword } = require('../utils/hashAndComparePassword');

async function handleUserSignupAndOTP(req, res) {
    const { name, email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "User email already exists" });
        }

        const hashedPassword = await hashPassword(password);
        const otp = generateOTP();
        await OTP.create({ email, otp, hashedPassword });

        await sendOTPEmail(email, name, otp);
        req.session = email;

        res.status(200).json({ message: "OTP sent. Please verify to complete the signup." });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Server error');
    }
};

async function handleResendOTP(req, res) {
    const { email } = req.body;

    try {
        const existingOTP = await OTP.findOne({ email });
        if (!existingOTP) {
            return res.status(404).json({ message: "OTP expired or not found. Please request a new OTP by signing up again." });
        }

        const otpExpirationTime = 5 * 60 * 1000;
        const currentTimestamp = Date.now();

        if (currentTimestamp - existingOTP.createdAt.getTime() > otpExpirationTime) {
            const newOTP = generateOTP();
            existingOTP.otp = newOTP;
            existingOTP.createdAt = new Date();
            await existingOTP.save();
            await sendOTPEmail(email, 'User', newOTP);

            return res.status(200).json({ message: "New OTP has been sent. Please check your email." });
        } else {
            return res.status(400).json({ message: "OTP is still valid. Please wait before requesting a new one." });
        }
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).send('Server error');
    }
};

async function handleOTPVerification(req, res) {
    const otp = req.body;
    const email = req.session;

    try {
        const otpRecord = await OTP.findOne({ email, otp });

        if (otpRecord) {
            await User.create({ name: otpRecord.name, email, password: otpRecord.hashedPassword });
            await OTP.deleteOne({ email });
            res.status(200).json({ message: 'OTP verified successfully. Redirecting to login page...' });
        } else {
            res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).send('Error verifying OTP');
    }
};

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    console.log(`${email} is trying to login | ${new Date(Date.now()).toLocaleString()}`);

    try {
        const token = await User.matchUserProvidedPassword(email, password);

        console.log(`${email} is logged in | ${new Date(Date.now()).toLocaleString()}`);

        res.cookie("uid", token);

        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.error('Error logging in user:', error);
        if (error.message === 'Invalid email or password') {
            res.status(401).json({ message: "Invalid email or password" });
        } else if (error.message === 'PasswordNotMatched') {
            res.status(400).json({ message: "Incorrect Password" });
        } else {
            res.status(500).json({ message: "Internal Server Error. Please try again later." });
        }
    }
};

async function handlerUserProfile(req, res) {
    const { newName } = req.body;

    try {
        const { email } = req.user;

        const user = await User.findOne({ email });

        if (!user) {
            return res.send("User not found");
        }

        user.name = newName;

        await user.save();
        return res.render("userProfile", {
            message: "Profile updated",
            name: user.name,
            email: user.email
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send("An error occurred while updating the profile");
    }
};

module.exports = {
    handleUserSignupAndOTP,
    handleResendOTP,
    handleOTPVerification,
    handleUserLogin,
    handlerUserProfile
}
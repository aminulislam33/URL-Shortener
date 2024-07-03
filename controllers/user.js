const {User, OTP} = require('../models/user');
const {setUser} = require('../service/auth');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');

async function handleUserSignupAndOTP(req, res) {
    const { name, email, password } = req.body;

    try {
        await User.create({
            name,
            email,
            password,
        });

        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });

        await OTP.create({ email, otp });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP for verification is: ${otp}`
        });

        req.session.email = email;

        return res.status(200).render("verify-otp");

    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).render("signup", { error: "Email already exists. Please use a different email." });
        }

        console.error('Error creating user:', error);
        return res.status(500).render("error", { error: "Internal Server Error" });
    }
};

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).render('login', { err: "Invalid email or password" });
        }

        const token = await User.matchUserProvidedPassword(email, password);

        if (!token) {
            return res.status(400).send("Incorrect Password");
        }

        res.cookie("uid", token);
        return res.redirect("/");
    } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).render("error", { error: "Internal Server Error" });
    }
};

async function handleOTPVerification(req, res) {
    const { otp } = req.body;
    const email = req.session.email;

    if (!email) {
        return res.status(400).send('Email not found in session');
    }

    console.log(email, otp)

    try {
        const otpRecord = await OTP.findOne({ email, otp }).exec();

        if (otpRecord) {
            res.status(200).render('otp-success', { message: 'OTP verified successfully. Redirecting to login page...' });

        } else {
            res.status(400).send("Invalid OTP. Please try again.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error verifying OTP');
    }
};

module.exports = {
    handleUserSignupAndOTP,
    handleUserLogin,
    handleOTPVerification
}
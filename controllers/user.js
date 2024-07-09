const { User, OTP } = require('../models/user');
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

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    console.log(`${email} is trying to login | ${new Date(Date.now()).toLocaleString()}`);

    try {
        const token = await User.matchUserProvidedPassword(email, password);

        console.log(`${email} is logged in | ${new Date(Date.now()).toLocaleString()}`);
        
        res.cookie("uid", token);
        return res.redirect(process.env.BASE_URL);
    } catch (error) {
        console.error('Error: logging in user:', error);
        if (error.message === 'Invalid email or password') {
            return res.status(401).render('login', { message: "Invalid email or password" });
        } else if (error.message === 'PasswordNotMatched') {
            return res.status(400).render('login', { message: "Incorrect Password" });
        } else {
            return res.status(500).render('login', { message: "Internal Server Error. Please try again later." });
        }
    }
}

module.exports = {
    handleUserSignupAndOTP,
    handleUserLogin,
    handleOTPVerification
}
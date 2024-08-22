const express = require('express');
const path = require('path');
const { handleUserSignupAndOTP, handleUserLogin, handleOTPVerification } = require('../controllers/user');
const router = express.Router();

router.post("/signup", handleUserSignupAndOTP);
router.post("/login", handleUserLogin);
router.post("/verify-otp", handleOTPVerification)
router.get("/verify-otp", (req, res) => { return res.sendFile(path.resolve(__dirname, "../public", "verify-otp.html")) });
router.get("/signup", (req, res) => { return res.sendFile(path.resolve(__dirname, "../public", "signup.html")) });
router.get("/login", (req, res) => { return res.sendFile(path.resolve(__dirname, "../public", "login.html")) });

module.exports = router;
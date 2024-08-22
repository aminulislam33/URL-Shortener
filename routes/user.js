const express = require('express');
const path = require('path');
const {handleUserSignupAndOTP, handleUserLogin, handleOTPVerification, handlerUserProfile} = require('../controllers/user');
const { restrictToLoggedInUserOnly } = require('../middlewares/auth');
const router = express.Router();

router.post("/signup", handleUserSignupAndOTP);
router.post("/login", handleUserLogin);
router.post("/verify-otp", handleOTPVerification)
router.get("/verify-otp", (req,res)=>{return res.sendFile(path.resolve(__dirname, "../public", "verify-otp.html"))});
router.get("/signup", (req,res)=>{return res.sendFile(path.resolve(__dirname, "../public", "signup.html"))});
router.get("/login", (req,res)=>{return res.sendFile(path.resolve(__dirname, "../public", "login.html"))});
router.get("/logout", (req,res)=>{
    return res.clearCookie("uid").redirect("/");
});
router.get("/profile", restrictToLoggedInUserOnly, (req,res)=>{ 

    return res.render("userProfile", {
        name: req.user.name,
        email: req.user.email
    })
});
router.post("/profile", restrictToLoggedInUserOnly, handlerUserProfile)

module.exports = router;
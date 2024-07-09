const express = require('express');
const Token = require('../models/Temptoken');
const {
    handlePasswordReset,
    handleSendPasswordResetLink,
    handleCheckPasswordResetLink
} = require('../controllers/resetPassword');

const router = express.Router();

router.post("/", handleSendPasswordResetLink)
router.get("/", (req, res) => { return res.render("sendPassowrdResetMail") });
router.post("/:userId/:token", handlePasswordReset);
router.get("/:userId/:token", handleCheckPasswordResetLink);
module.exports = router;
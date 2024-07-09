const Token = require("../models/Temptoken");
const crypto = require('crypto');
const { User } = require("../models/user");
const handleSendEmail = require("../utils/sendMail");

async function handleSendPasswordResetLink(req, res) {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: "User not found" });
        }

        let token = await Token.findOne({ userId: user._id });
        if (!token) {
            token = await Token.create({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            });
        }

        const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`;

        const text = `
Dear ${user.name}
We received a request to reset your password for your account on shorturl.aminuldev.me. If you made this request, please click the link below to reset your password:

${link}

If you did not request a password reset, please ignore this email. Your password will remain unchanged.

For security reasons, this link will expire in 1 hour. If the link expires, you will need to request a new password reset.

If you have any questions or need further assistance, please contact our support team at contact@aminuldev.me

Thank you,
Aminul Islam`

        await handleSendEmail(user.email, "Password Reset Request", text);
        console.log("Password reset link: ", link);

        return res.render("confirmationMail")
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred" });
    }
};

async function handleCheckPasswordResetLink(req, res) {
    const { userId, token: tokenParam } = req.params;
    console.log(`userId is: ${req.params.userId} and token is: ${tokenParam}`);

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ message: "Invalid link or expired" });
        }

        const token = await Token.findOne({
            userId: userId,
            token: tokenParam
        });

        if (!token) {
            return res.json({ message: "Invalid token" });
        }
    } catch (error) {

    }
    return res.render("EnterPassword", { userId, tokenParam });
};

async function handlePasswordReset(req, res) {
    const { userId, token: tokenParam } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ message: "Invalid link or expired" });
        }

        const token = await Token.findOne({
            userId: userId,
            token: tokenParam
        });

        if (!token) {
            return res.json({ message: "Invalid token" });
        }

        user.password = req.body.password;
        await user.save();
        await Token.deleteOne({ _id: token._id });

        return res.status(200).render("passwordResetSuccessfulMessage");
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred" });
    }
};

module.exports = {
    handleSendPasswordResetLink,
    handlePasswordReset,
    handleCheckPasswordResetLink
}
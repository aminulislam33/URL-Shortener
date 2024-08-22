const handleSendEmail = require("./sendMail");

async function sendOTPEmail(email, name, otp) {
    const subject = 'Your One-Time Password (OTP)';
    const text = `
Dear ${name},

Here is your OTP for verification: ${otp}

Please enter this OTP within 5 minutes to complete your verification process.

Thank you,
URL Shortener team
    `;
    await handleSendEmail(email, subject, text);
}

module.exports = sendOTPEmail;
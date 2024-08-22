const bcrypt = require('bcrypt');

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function comparePasswords(userPassword, hashedPassword) {
    return bcrypt.compare(userPassword, hashedPassword);
}

module.exports = {
    hashPassword,
    comparePasswords
};
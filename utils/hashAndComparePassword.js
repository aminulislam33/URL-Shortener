const bcrypt = require('bcrypt');

const salt = bcrypt.genSalt(10);

async function hashPassword(password){
    return bcrypt.hash(password, salt);
}

async function comparePasswords(userPassword, hashedPassword){
    return bcrypt.compare(userPassword, hashedPassword);
}

module.exports = {
    hashPassword,
    comparePasswords
};
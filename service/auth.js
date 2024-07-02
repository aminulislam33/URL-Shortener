const jwt = require('jsonwebtoken');
const secret = "very_secret"

function setUser(user){
    if (!user || !user._id || !user.email) {
        throw new Error('Invalid user object');
    }
    return jwt.sign({
        _id: user._id,
        email: user.email
    }, secret)
};

function getUser(token){
    if(!token) return null;
    return jwt.verify(token, secret);
};

module.exports = {
    setUser,
    getUser
};
const { User } = require('../models/user');
const { getUser } = require('../service/auth');

async function restrictToLoggedInUserOnly(req, res, next) {
    const userUid = req.cookies.uid;

    if (!userUid) {
        return res.redirect("/user/login");
    }

    try {
        const TokenUser = await getUser(userUid);

        if (!TokenUser) {
            return res.redirect("/user/login");
        }

        const user = await User.findOne({ email: TokenUser.email });

        if (!user) {
            return res.redirect("/user/login");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error in restrictToLoggedInUserOnly middleware:', error);
        res.redirect("/user/login");
    }
};

module.exports = {
    restrictToLoggedInUserOnly,
}
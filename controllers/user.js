const User = require('../models/user');
const {setUser} = require('../service/auth');

async function handleUserSignup(req, res) {
    const { name, email, password } = req.body;

    try {
        await User.create({
            name,
            email,
            password,
        });

        return res.render("login");
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).render("signup", { error: "Email already exists. Please use a different email." });
        }

        console.error('Error creating user:', error);
        return res.status(500).render("error", { error: "Internal Server Error" });
    }
}

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).render('login', { err: "Invalid email or password" });
        }

        const token = setUser(user);
        res.cookie("uid", token);
        return res.redirect("/");
    } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).render("error", { error: "Internal Server Error" });
    }
}

module.exports = {
    handleUserSignup,
    handleUserLogin
}
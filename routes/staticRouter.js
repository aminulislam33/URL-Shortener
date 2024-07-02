const express = require('express');
const URL = require('../models/url');

const router = express.Router();

router.get("/", async (req, res)=>{
    if(!req.user) return res.redirect("/user/login");
    const allurls = await URL.find({createdBy: req.user._id});
    res.render("home", {
        urls: allurls,
    });
});

module.exports = router;
const shortid = require("shortid");
const URL = require("../models/url");

async function handleGetShortUrl(req,res){
    
    const body = req.body;
    if(!body.url){
        return res.status(400).json({error: "URL is required"});
    }
    const ShortId = shortid();
    await URL.create({
        shortId: ShortId,
        redirectURL: body.url,
        visitHistory: [],
        createdBy: req.user._id
    });
    return res.render("home", {
        id: ShortId
    });
};

async function handleGetTimeStamp(req, res){
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({ shortId },
        { $push: { visitHistory: { timestamp: Date.now(),},},});
    res.redirect(entry.redirectURL);
};

module.exports = {
    handleGetShortUrl,
    handleGetTimeStamp
};
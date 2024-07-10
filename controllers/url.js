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
        BASE_URL: process.env.BASE_URL,
        name: req.user.name,
        id: ShortId
    });
};

async function handleGetTimeStamp(req, res) {
    const shortId = req.params.shortId;

    try {
        const entry = await URL.findOneAndUpdate(
            { shortId },
            { $push: { visitHistory: { timestamp: Date.now() } } },
            { new: true } 
        );

        if (entry) {
            res.redirect(entry.redirectURL);
        } else {
            res.status(404).send('URL not found');
        }
    } catch (error) {
        console.error('Error updating visit history:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    handleGetShortUrl,
    handleGetTimeStamp
};
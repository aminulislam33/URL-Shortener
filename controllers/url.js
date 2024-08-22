const shortid = require("shortid");
const URL = require("../models/url");

async function handleGetShortUrl(req, res) {
    const { url } = req.body;

    try {
        const shortId = shortid.generate();
        await URL.create({
            shortId,
            redirectURL: url,
            visitHistory: [],
        });
        
        return res.status(200).json({ shortId});
    } catch (error) {
        console.error('Error generating short URL:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}

async function getAllUrls(req, res) {
    try {
        const allUrls = await URL.find();
        
        res.status(200).json(allUrls);
    } catch (error) {
        console.error('Error fetching URLs:', error);
        res.status(500).json({ message: 'Server Error' });
    }
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
    handleGetTimeStamp,
    getAllUrls
};
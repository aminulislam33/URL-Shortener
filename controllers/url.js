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

        return res.status(200).json({ shortId });
    } catch (error) {
        console.error('Error generating short URL:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}

async function getAllUrls(req, res) {
    try {
        const urls = await URL.find();
        const urlsWithClickCounts = urls.map(url => ({
            shortId: url.shortId,
            redirectURL: url.redirectURL,
            clicks: url.visitHistory.length
        }));
        res.json(urlsWithClickCounts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching URLs' });
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
            return res.status(404).json({ message: 'URL not found' });
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
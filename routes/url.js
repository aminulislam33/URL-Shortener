const express = require('express');
const {
    handleGetShortUrl,
    handleGetTimeStamp,
    getAllUrls,
} = require('../controllers/url');

const router = express.Router();
router.get("/urls", getAllUrls)
router.post("/", handleGetShortUrl);
router.get("/:shortId", handleGetTimeStamp);

module.exports = router;
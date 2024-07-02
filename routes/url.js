const express = require('express');
const {
    handleGetShortUrl,
    handleGetTimeStamp
} = require('../controllers/url');

const router = express.Router();

router.post("/", handleGetShortUrl);
router.get("/:shortId", handleGetTimeStamp);

module.exports = router;
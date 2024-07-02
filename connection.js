const {mongoose } = require("mongoose");

async function ConnectToMongoDB(url) {
    mongoose.connect(url);
};

module.exports = {
    ConnectToMongoDB
};
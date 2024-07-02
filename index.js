const express = require('express');
const mongoose = require('mongoose');
const { ConnectToMongoDB } = require('./connection');
const URL = require('./models/url');
const path = require('path');
const urlRouter = require('./routes/url');
const staticRouter = require('./routes/staticRouter');
const UserSignup = require('./routes/user');
const cookieParser = require('cookie-parser');
const {restrictToLoggedInUserOnly, checkAuth} = require('./middlewares/auth');

const app = express();
const port = 8001;

ConnectToMongoDB("mongodb://127.0.0.1:27017/url-short")
    .then(() => {
        console.log("Connected to MongoDB!");
    });

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use("/url", restrictToLoggedInUserOnly, urlRouter);
app.use("/user", UserSignup);
app.use("/", checkAuth, staticRouter);

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.get("/url/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
      {
        shortId,
      },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      }
    );
    res.redirect(entry.redirectURL);
  });

app.listen(port, () => {
    console.log(`Server started on ${port}`);
});
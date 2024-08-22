require('dotenv').config();
const express = require('express');
const { ConnectToMongoDB } = require('./connection');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const urlRouter = require('./routes/url');
const UserRouter = require('./routes/user');
const resetRouter = require('./routes/resetPassword');
const cookieParser = require('cookie-parser');
const restrictToLoggedInOnly = require('./middleware/checkLoggedInUser');

const app = express();
const port = process.env.PORT || 3000;

ConnectToMongoDB(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.use("/url", urlRouter);
app.use("/user", UserRouter);
app.use("/password-reset", resetRouter);

app.use("/", restrictToLoggedInOnly, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
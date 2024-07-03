require('dotenv').config();
const express = require('express');
const { ConnectToMongoDB } = require('./connection');
const URL = require('./models/url');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const urlRouter = require('./routes/url');
const staticRouter = require('./routes/staticRouter');
const UserSignup = require('./routes/user');
const cookieParser = require('cookie-parser');
const { restrictToLoggedInUserOnly } = require('./middlewares/auth');

const app = express();
const port = process.env.PORT;

ConnectToMongoDB("mongodb://127.0.0.1:27017/url-short")
  .then(() => {
    console.log("Connected to MongoDB!");
  });

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use("/url", restrictToLoggedInUserOnly, urlRouter);
app.use("/user", UserSignup);
app.use("/", staticRouter);

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
require('dotenv').config();
const express = require('express');
const { ConnectToMongoDB } = require('./connection');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const urlRouter = require('./routes/url');
const staticRouter = require('./routes/staticRouter');
const UserRouter = require('./routes/user');
const resetRouter = require('./routes/resetPassword');
const cookieParser = require('cookie-parser');
const { restrictToLoggedInUserOnly } = require('./middlewares/auth');

const app = express();
const port = process.env.PORT;

ConnectToMongoDB(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB!");
  });

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use("/url", restrictToLoggedInUserOnly, urlRouter);
app.use("/user", UserRouter);
app.use("/password-reset", resetRouter);
app.use("/", staticRouter);

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
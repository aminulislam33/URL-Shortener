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
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use("/url", urlRouter);
app.use("/", (req, res) => { return res.sendFile(path.join(__dirname, "public", "home.html")) });
app.use("/user", UserRouter);
app.use("/password-reset", resetRouter);

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
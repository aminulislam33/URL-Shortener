Title
-----
URL Shortener

Project Overview
----------------
- Purpose: Shorten URLs, record visit timestamps, and provide user authentication with OTP signup and password reset via email.
- Stack: Node.js, Express, MongoDB (Mongoose), Nodemailer for email, JWT for session token.

TechStack
---------
- Node.js, Express
- MongoDB, Mongoose
- JWT (`jsonwebtoken`)
- Bcrypt (`bcrypt`)
- Nodemailer
- otp-generator, shortid

Project Structure
-----------------
- `index.js` — app entry, middleware, route mounts, static files.
- `connection.js` — MongoDB connect helper.
- `routes/` — Express routes (`user.js`, `url.js`, `resetPassword.js`).
- `controllers/` — Route handlers (`user.js`, `url.js`, `resetPassword.js`).
- `models/` — Mongoose models (`user.js`, `url.js`, `Temptoken.js`).
- `middleware/` — `checkLoggedInUser.js` for protecting `/`.
- `service/` — `auth.js` for JWT creation/verification.
- `utils/` — helpers (`generateOTP.js`, `hashAndComparePassword.js`, `sendMail.js`, `sendOTPMail.js`).
- `public/` — static client pages (`home.html`, `login.html`, `signup.html`).

Database Models
---------------
- `User` (`models/user.js`): `name`, `email` (unique), `password` (hashed). Static helper `matchUserProvidedPassword(email, password)` validates credentials and returns a JWT.
- `OTP` (in `models/user.js`): temporary OTP storage for signup; fields `name`, `email`, `otp`, `hashedPassword`, TTL 5 minutes.
- `URL` (`models/url.js`): `shortId`, `redirectURL`, `visitHistory` (array of timestamp entries).
- `Token` (`models/Temptoken.js`): password-reset token linked to `userId`, TTL 1 hour.

API Routes
----------
- `POST /user/signup` — start signup: create OTP record, send OTP email. (controller: `controllers/user.js`)
- `POST /user/login` — login: validate password and set cookie `uid` with JWT.
- `POST /user/verify-otp` — verify OTP and create user account.
- `GET /user/signup`, `GET /user/login`, `GET /user/verify-otp` — static pages in `public/`.
- `POST /url` — create short URL; response includes `shortId`.
- `GET /url/:shortId` — redirect to original URL and append visit timestamp.
- `GET /url/urls` — list all shortened URLs with click counts.
- `POST /password-reset` — request password reset email with token.
- `GET /password-reset/:userId/:token` — validate token and render password entry.
- `POST /password-reset/:userId/:token` — set new password and invalidate token.

Key features
------------
- OTP-based signup with email verification.
- JWT-based session token set in cookie `uid` for protected routes.
- URL shortening with unique `shortId` and visit timestamp tracking.
- Password reset via time-limited email token.

Data Relations
--------------
- `Token.userId` references `User._id` (password reset).
- `OTP.email` temporarily stores signup data until confirmed.
- `URL` entries are independent documents; visit timestamps are embedded in each URL document.

Utilities
---------
- `generateOTP()` — returns a 4-digit numeric OTP (`utils/generateOTP.js`).
- `hashPassword()` / `comparePasswords()` — `bcrypt` helpers (`utils/hashAndComparePassword.js`).
- `sendMail()` / `sendOTPMail()` — email sending via Nodemailer (`utils/sendMail.js`, `utils/sendOTPMail.js`).
- `service/auth.js` — `createTokenForUser(user)` and `getUser(token)` wrappers around `jsonwebtoken`.

Env variables
-------------
- `MONGODB_URI` — MongoDB connection string.
- `EMAIL` / `PASSWORD` — credentials for Nodemailer (Gmail) used in `utils/sendMail.js`.
- `BASE_URL` — app base URL used for password-reset links.
- `PORT` — optional server port.
- (recommended) `JWT_SECRET` — move JWT secret here instead of hard-coded value.

Security features
-----------------
- Passwords hashed with `bcrypt` before storage.
- OTP and reset tokens use Mongoose TTL indexes for automatic expiry (5 minutes and 1 hour respectively).
- Session cookie `secure` is enabled only in production mode.

Dev commands
------------
Install dependencies:
```bash
npm install
```
Run server:
```bash
npm start
```
Development (with nodemon):
```bash
npm run dev
```

Status and notes
----------------
- Current status: runnable Express app; documentation generated in this file.
- Immediate improvements recommended:
	- Move JWT secret to `process.env.JWT_SECRET` and add token expiry in `service/auth.js`.
	- Add try/catch when verifying JWT in `middleware/checkLoggedInUser.js` to avoid thrown exceptions.
	- Verify env key names used in `utils/sendMail.js` (`from` uses `process.env.USER` while auth uses `process.env.EMAIL`).
	- Consider returning/awaiting the mongoose connection in `connection.js` and handling connection errors more robustly.

If you want, I can implement any of the above improvements now (pick one).* 
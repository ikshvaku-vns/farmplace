const express = require("express");
const router = express.Router();
const { storeReturnTo } = require("../middleware");
const User = require("../models/user");
const users = require("../controllers/users");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
require("../passport-setup");

router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/logout", users.logout);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route after Google authentication
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Redirect to your desired page after login
    res.redirect("/");
  }
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");

const ExpressError = require("./utils/ExpressError");
const passport = require("passport");
const passportSetup = require("./passport-setup");
console.log("Passport setup loaded successfully!");

const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const helmet = require("helmet");
const usersRoutes = require("./routes/users.js");
const farmplaces = require("./routes/farmplaces.js");
const comments = require("./routes/comments.js");
const mongoSanitize = require("express-mongo-sanitize");
require("dotenv").config(); // Load environment variables from .env file

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const dbUrl = process.env.DB_URL;
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "thisshouldbeabettersecret",
  },
});

store.on("error", function (e) {
  console.log("Session Store Error");
});

const sessionConfig = {
  name: "session",
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());
app.use(express.json());
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://js.stripe.com/v3/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
  "https://js.stripe.com/v3/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/douqbebwk/",
        //  //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://res.cloudinary.com/dbs7lbbkj/",
        "https://images.unsplash.com/",
        "https://media.istockphoto.com",
        "https://cdn.pixabay.com",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["'self'", "https://js.stripe.com/"],
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

const authRoutes = require("./routes/users"); // Adjust the path as needed
app.use(authRoutes);

app.use("/", usersRoutes);
app.use("/farmplace", farmplaces);
app.use("/farmplace/:id/comments", comments);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/success", (req, res) => {
  res.render("farmplace/success");
});

app.get("/cancel", (req, res) => {
  res.render("farmplace/cancel");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the database
        let existingUser = await User.findOne({
          email: profile.emails[0].value,
        });

        if (existingUser) {
          console.log("User already exists:", existingUser);
          return done(null, existingUser); // Pass the existing user to Passport
        }

        // If user doesn't exist, create a new one
        const newUser = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
        });

        await newUser.save();
        console.log("New user created:", newUser);
        done(null, newUser); // Pass the new user to Passport
      } catch (error) {
        console.error("Error during Google OAuth:", error);
        done(error, null);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

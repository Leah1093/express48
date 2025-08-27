import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();

export function configureGoogleStrategy() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/entrance/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // כאן תוכלי לחפש את המשתמש במסד או ליצור חדש
          const user = {
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          };
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
}

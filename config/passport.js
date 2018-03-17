const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('./keys');

// Load User model
const User = mongoose.model('users');

module.exports = function(passport) {
    passport.use(
        new GoogleStrategy({
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: "/auth/google/callback",
            proxy: true
        }, (accessToken, refreshToken, profile, done) => {
            const imageStr = profile.photos[0].value;
            const image = imageStr.substring(0, imageStr.indexOf('?'));
            
            const newUser = {
                googleID: profile.id,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
                image: image
            }

            // Check for existing user
            User.findOne({
                googleID: profile.id
            }).then(user => {
                if (user) {
                    done(null, user);
                } else {
                    // Create User
                    new User(newUser)
                        .save()
                        .then(user => {
                            done(null, user);
                        })
                        .catch(err => {
                            done(err, null);
                        })
                }
            })

        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
      
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

}
var User = require('../models').User,
    Team = require('../models').Team,
    Organization = require('../models').Organization,
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = function(app){
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id)
        .lean()
        .exec(function(err, user){
            if (err) {
                return done(err.message, null);
            }
            if (!user) {
                return done("Could not find user "+ id);
            }

            Organization.find({users: id})
            .lean()
            .exec(function(err, orgs){
                user.organizations = orgs;
                done(null, user);
            });
        });
    });

    if (app.conf.auth.google) {
        passport.use(new GoogleStrategy({
                clientID: app.conf.auth.google.clientId,
                clientSecret: app.conf.auth.google.clientSecret,
                callbackURL: app.conf.auth.google.callbackURL
            },
            function(accessToken, refreshToken, profile, done) {
                process.nextTick(function () {
                    User.findOne({google_id: profile.id}, function(err, user){
                        if (err) {
                            return done(err.message, null);
                        }
                        if (user) {
                            return done(null, user);
                        }
                        user = new User({
                            username: profile.displayName,
                            name: profile.displayName,
                            email: profile._json.email,
                            google_id: profile.id
                        });
                        user.save(function (err, user) {
                            if (err) { return done("Could not create user"); }
                            var organization = Organization();
                            organization.name = user.name;
                            organization.users.push(user);
                            organization.save(function (err) {
                                if (err) { return done("Could not create organization"); }
                                return done(null, user);
                            });
                        });
                    });
                });
            }
        ));
    }

    return passport;
};

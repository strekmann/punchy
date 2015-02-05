var User = require('../models').User,
    Team = require('../models').Team,
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = function(app){
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user){
            if (err) {
                return done(err.message, null);
            }
            if (!user) {
                return done("Could not find user "+ id);
            }
            done(null, user);
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
                        else {
                            user = new User({
                                username: profile.displayName,
                                name: profile.displayName,
                                email: profile._json.email,
                                google_id: profile.id
                            });
                            var team = Team();
                            team.name = user.name;
                            team.users.push(user);
                            team.save(function (err, team) {
                                if (err) { return done("Could not create team"); }
                                user.teams.push(team);
                                user.save(function(err){
                                    if (err) {
                                        return done("Could not create user", null);
                                    }
                                    return done(null, user);
                                });
                            });
                        }
                    });
                });
            }
        ));
    }

    return passport;
};

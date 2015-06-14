#!/usr/bin/env node

var shortid = require('shortid'),
    mongoose = require('mongoose'),
    User = require('../server/models').User,
    Project = require('../server/models').Project,
    Organization = require('../server/models').Organization,
    Hours = require('../server/models').Hours,
    _ = require('underscore'),
    async = require('async'),
    settings = require('../server/settings');

mongoose.connect(settings.mongo.servers.join(','), {replSet: {rs_name: settings.mongo.replset}});

async.series([
        // Delete old indexes
        function(cb){
            console.log('Dropping indexes');
            User.collection.dropAllIndexes(function(err, results){
                console.log(results);
                cb(err);
            });
        },

        // Update all users
        function(cb){
            User.find({}).exec(function(err, users){
                if (err) {
                    console.error(err);
                    return cb(err);
                }

                var map = {};
                _.each(users, function(user){
                    map[user._id] = shortid();
                });

                async.eachLimit(users, 5, function(user, done){
                    var newUser = user.toObject();
                    newUser._id = map[user._id];

                    User.create(newUser, function(err){
                        if (err){ return done(err); }

                        Organization.create({_id: newUser._id, name: newUser.name, admins: [newUser._id], users: [newUser._id]}, function (err) {
                            done(err);
                        });

                        user.remove(function(err){

                            // update user hours
                            Hours.update({user: user._id}, {$set: {user: newUser._id}}, {multi: true}, function(err){
                                Project.update({users: user._id}, {$set: {user: [newUser._id]}}, {multi: true}, function (err) {
                                    done(err);
                                });
                            });
                        });
                    });

                }, function(err){
                    cb(err);
                });
            });
        }

    // All done
    ], function(err, res){
        if (err){
            console.error(err);
        }
        process.exit(0);
});

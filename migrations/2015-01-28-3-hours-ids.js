#!/usr/bin/env node

var shortid = require('shortid'),
    mongoose = require('mongoose'),
    User = require('../server/models').User,
    Project = require('../server/models').Project,
    Organization = require('../server/models').Organization,
    Hours = require('../server/models').Hours,
    NewHours = require('../server/models').NewHours,
    _ = require('underscore'),
    async = require('async'),
    settings = require('../server/settings');

mongoose.connect(settings.mongo.servers.join(','), {replSet: {rs_name: settings.mongo.replset}});

async.series([
        // Delete old indexes
        function(cb){
            console.log('Dropping indexes');
            Hours.collection.dropAllIndexes(function(err, results){
                console.log(results);
                cb(err);
            });
        },

        // Update all hours
        function(cb){
            Hours.find({}).exec(function(err, hours){
                if (err) {
                    console.error(err);
                    return cb(err);
                }

                var map = {};
                _.each(hours, function(h){
                    map[h._id] = shortid();
                });

                async.eachLimit(hours, 5, function(h, done){
                    var newH = h.toObject();
                    newH._id = map[h._id];

                    NewHours.create(newH, function(err){
                        return done(err);
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

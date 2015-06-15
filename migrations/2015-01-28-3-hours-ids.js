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

                    Hours.create(newH, function(err){
                        if (err){ return done(err); }

                        if (h._id[0] !== 5) {
                            h.remove(function(err){
                                done(err);
                            });
                        }
                        else {
                            Hours.collection.remove({_id: ObjectId(h._id)}, function(err){
                                done(err);
                            });
                        }
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

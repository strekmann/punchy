#!/usr/bin/env node

var shortid = require('shortid'),
    mongoose = require('mongoose'),
    Project = require('../server/models').Project,
    NewProject = require('../server/models').NewProject,
    Hours = require('../server/models').Hours,
    User = require('../server/models').User,
    Client = require('../server/models').Client,
    _ = require('underscore'),
    async = require('async'),
    settings = require('../server/settings');

mongoose.connect(settings.mongo.servers.join(','), {replSet: {rs_name: settings.mongo.replset}});

async.series([
        // Delete old indexes
        function(cb){
            console.log('Dropping indexes');
            Project.collection.dropAllIndexes(function(err, results){
                console.log(results);
                cb(err);
            });
        },

        // Update all projects
        function(cb){
            Project.find({}).exec(function(err, projects){
                if (err) {
                    console.error(err);
                    return cb(err);
                }

                var map = {};
                _.each(projects, function(project){
                    map[project._id] = shortid();
                });

                async.eachLimit(projects, 5, function(project, done){
                    var newProject = project.toObject();
                    newProject._id = map[project._id];
                    var user = User.findOne({username: project.users[0]}, function (err, user) {
                        if (err) { done(err); }
                        newProject.user = user._id;
                        newProject.organization = user._id;
                        Client.findOne({name: project.client}, function (err, client) {
                            if (!client) {
                                client = new Client();
                            }
                            client.name = project.client;
                            client.user = user._id;
                            client.organization = user._id;

                            client.save(function (err, client) {
                                if (err) { done (err); }
                                newProject.client = client._id;
                                NewProject.create(newProject, function(err){
                                    if (err){ return done(err); }

                                    // update project hours
                                    Hours.update({project: project._id}, {$set: {project: newProject._id}}, {multi: true}, function(err){
                                        done(err);
                                    });
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

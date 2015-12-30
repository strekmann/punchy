#!/usr/bin/env node

var async = require('async'),
    csv = require('fast-csv'),
    fs = require('fs'),
    _ = require('underscore'),
    mongoose = require('mongoose'),
    Hours = require('../server/models').Hours,
    Project = require('../server/models').Project,
    settings = require('../server/settings');

var argv = require('yargs')
    .default("file", "export.csv")
    .example('$0 output_file.csv', 'export data to output_file.csv')
    .help('h')
    .alias('h', 'help')
    .argv;

mongoose.connect(settings.mongo.servers.join(','), {replSet: {rs_name: settings.mongo.replset}});

async.waterfall([
    function (cb) {
        Project.find().select("name client").populate("client", "name").exec(function (err, projects) {
            if (err) {
                return cb(err);
            }
            var p = {};
            _.each(projects, function (project) {
                p[project._id] = project.client.name + "/" + project.name
            })
            cb(null, p);
        });
    },
    function (projects, cb) {
        Hours.aggregate([
            {
                $project: {
                    project: "$project",
                    duration: "$duration",
                    ymd: {$dateToString: {format: "%Y-%m", date: "$date"}}
                }
            }, {
                $group: {_id: {
                    ymd: "$ymd",
                    project: "$project",
                    duration: {$sum: "$duration"}
                }}
            }, {
                $group: {
                    _id: "$_id.ymd",
                    projects: {"$push": {"project": "$_id.project", "duration": "$_id.duration"}},
                    duration: {"$sum": "$_id.duration"}}
            }, {
                $sort: {
                    _id: 1
                }
            }
        ]).exec(function (err, results) {
            if (err) throw err;

            var data = [];
            var headers = ["date", "duration"];
            _.each(results, function (line) {
                var o = {};
                o.date = line._id;
                o.duration = line.duration;
                _.each(line.projects, function (project) {
                    o[projects[project.project]] = project.duration;
                    headers.push(projects[project.project]);
                });
                data.push(o);
            });
            cb(null, {data: data, headers: _.uniq(headers)});
        });
    }
], function (err, res) {
    if (err) {
        console.error(err);
    }

    csv.writeToPath(argv.file, res.data, {headers: res.headers}).on("finish", function () {
        process.exit(0);
    });

});

var express = require('express'),
    _ = require('underscore'),
    moment= require('moment'),
    router = express.Router(),
    User = require('../models').User,
    Project = require('../models').Project,
    Hours = require('../models').Hours,
    ensureAuthenticated = require('../lib/middleware').ensureAuthenticated;

// Util functions
var add_time = function (date, timestring) {
    if (date && timestring) {
        var mdate = moment(date);
        var timearr = _.map(timestring.split(":"), function (item) {
            return parseInt(item, 10);
        });
        mdate.hours(timearr[0]);
        mdate.minutes(timearr[1]);
        return mdate;
    }
};

// Routes
router.get('/', function(req, res, next){
    Project.find().sort('-created').lean().exec(function (err, projects) {
        _.each(projects, function(project) {
            if (project._id.toString() === req.query.project) {
                project.active = true;
            }
            else {
                project.active = false;
            }
        });
        Hours
        .find({user:req.user})
        .populate('project')
        .sort('-created')
        .limit(10)
        .exec(function(err, hours) {
            res.render('index', {
                projects: projects,
                hours: hours
            });
        });
    });
});

router.post('/', function(req, res, next) {
    if (req.user) {

        var start = req.body.start;

        var hours = new Hours();

        hours.user = req.user;
        hours.project = req.body.project;
        hours.date = req.body.date;
        hours.start = add_time(req.body.date, req.body.start);
        hours.end = add_time(req.body.date, req.body.end);
        hours.duration = req.body.duration;
        hours.comments = req.body.comments;

        hours.save(function (err) {
            hours.populate('project', 'name', function(err, hours) {
                res.json(hours);
            });
        });
    }
});

router.get('/projects', function(req, res, next){
    Project.find().sort('-created').exec(function (err, projects) {
        res.render('projects', {projects: projects});
    });
});

router.post('/projects', function(req, res, next) {
    if (req.user) {
        var project = new Project();

        project.name = req.body.name;
        project.client = req.body.client;
        project.users.push(req.user._id);

        project.save(function (err) {
            res.json(project);
        });
    }
    else {
        res.status(403);
    }
});

router.get('/projects/:id', function (req, res, next) {
    Project.findOne({_id: req.params.id, users:req.user}, function (err, project) {
        if (project) {
            Hours.find({project: project._id})
            .populate('user', 'name username')
            .sort('date start')
            .exec(function (err, hours) {
                res.render('project', {project: project, hours: hours});
            });
        }
        else {
            res.status(404);
        }
    });
});

router.put('/projects/:id', function (req, res, next) {
    Project.findOne({_id: req.params.id, users:req.user}, function (err, project) {
        if (err) {
            res.json(500, err);
        }
        if (project) {
            project.name = req.body.name;
            project.client = req.body.client;
            project.save(function (err) {
                res.json(project);
            });
        }
        else {
            res.status(403);
        }
    });
});

router.get('/login', function(req, res, next){
    res.render('login');
});

router.get('/logout', function(req, res, next){
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

router.route('/account')
    .all(ensureAuthenticated)
    .get(function(req, res, next){
        res.render('account');
    })
    .put(function(req, res, next){
        User.findById(req.user._id, function(err, user){
            if (err) {
                return res.json(404, {
                    error: 'Could not find user'
                });
            }

            req.assert('username', 'username is required').notEmpty();
            req.assert('name', 'name is required').notEmpty();
            req.assert('email', 'valid email required').isEmail();

            var errors = req.validationErrors();
            if (errors) {
                return res.json('200', {
                    errors: errors
                });
            }

            user.username = req.body.username;
            user.name = req.body.name;
            user.email = req.body.email;
            return user.save(function(err){
                if (err) { next(err); }

                return res.json(200, {
                    message: 'Changes saved'
                });
            });
        });
    });

module.exports = router;

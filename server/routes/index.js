var express = require('express'),
    _ = require('underscore'),
    router = express.Router(),
    User = require('../models').User,
    Project = require('../models').Project,
    ensureAuthenticated = require('../lib/middleware').ensureAuthenticated;

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
        res.render('index', {
            projects: projects
        });
    });
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

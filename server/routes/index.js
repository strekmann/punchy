var express = require('express'),
    _ = require('underscore'),
    moment= require('moment'),
    router = express.Router(),
    User = require('../models').User,
    Organization = require('../models').Organization,
    Project = require('../models').Project,
    Hours = require('../models').Hours,
    Client = require('../models').Client,
    Invoice = require('../models').Invoice,
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
    if (req.user) {
        Project.find({organization: {$in: req.user.organizations}}).populate('client', 'name').sort('-modified').lean().exec(function (err, projects) {
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
            .populate('project', 'name')
            .sort('-created')
            .limit(10)
            .exec(function(err, hours) {
                res.render('index', {
                    projects: projects,
                    hours: hours
                });
            });
        });
    }
    else { // no user}
        res.render('index');
    }
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
        hours.comment = req.body.comment;

        hours.save(function (err) {
            Project.findById(req.body.project, function (err, project) {
                project.modified = moment();
                project.save();
            });
            hours.populate('project', 'name', function(err, hours) {
                res.json(hours);
            });
        });
    }
});

router.post('/projects', ensureAuthenticated, function(req, res, next) {
    if (req.user) {
        // TODO: Add permission checks
        Organization
        .findById(req.body.project.organization)
        .exec(function (err) {
            if (err) { return next (err); }
            var project = new Project();
            project.name = req.body.project.name;
            project.client = req.body.project.client;
            project.organization = req.body.project.organization;
            project.user = req.user._id;

            project.save(function (err) {
                if (err) { return next (err); }
                res.json(project);
            });
        });
    }
    else {
        res.status(403);
    }
});

router.delete('/projects', ensureAuthenticated, function (req, res, next) {
    // TODO: Add permission check upon delete
    Organization
    .findById(req.body.project.organization)
    .exec(function (err) {
        if (err) { return next (err); }
        Hours.find({'project': req.body.project._id}, function (err, hours) {
            if (err) {
                return res.json(400, err);
            }
            if (hours.length) {
                return res.json(400, 'Project has to be empty');
            }
            Project.findById(req.body.project._id, function (err, project) {
                if (err) {
                    res.json(400, err);
                }
                project.remove(function (err) {
                    if (err) {
                        res.json(500, err);
                    }
                    res.json(200, {});
                });
            });
        });
    });
});


router.get('/projects/:id', function (req, res, next) {
    Project.find({organization: {$in: req.user.organizations}}).sort('-modified').lean().exec(function (err, projects) {
        Project.findOne({_id: req.params.id, organization: {$in:req.user.organizations}}, function (err, project) {
            if (project) {
                Hours.find({project: project._id})
                .populate('user', 'name username')
                .populate('project', 'name')
                .sort('date start')
                .exec(function (err, hours) {
                    res.render('project', {
                        conf: {
                            project: project,
                            projects: projects || [],
                            hours: hours,
                            userid: req.user._id
                        }
                    });
                });
            }
            else {
                res.sendStatus(404);
            }
        });
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

router.route('/clients')
.all(ensureAuthenticated)
.get(function (req, res, next) {
    Client.find({organization: {$in: req.user.organizations}}, function (err, clients) {
        if (err) { return next(err); }
        res.render('clients', {clients: clients});
    });
})
.post(function (req, res, next) {
    // TODO: Add permission checks
    Organization
    .findById(req.body.client.organization)
    .exec(function (err) {
        if (err) { return next (err); }
        var client = new Client();
        client.name = req.body.client.name;
        client.organization = req.body.client.organization;
        client.user = req.user._id;

        client.save(function (err) {
            if (err) { return next (err); }
            res.json(client);
        });
    });
})
.delete(ensureAuthenticated, function (req, res, next) {
    // TODO: Add permission check upon delete
    Organization
    .findById(req.body.client.organization)
    .exec(function (err) {
        if (err) { return next (err); }
        Client.findById(req.body.client._id, function (err, client) {
            if (err) {
                res.json(400, err);
            }
            client.remove(function (err) {
                if (err) {
                    res.json(500, err);
                }
                res.json(200, {});
            });
        });
    });
});

router.route('/companies')
.all(ensureAuthenticated)
.get(function (req, res, next) {
    Organization.find({users: req.user}, function (err, organizations) {
        if (err) { return next (err); }
        res.render('organizations', {organizations: organizations});
    });
});

router.route('/companies/:id')
.all(ensureAuthenticated)
.get(function (req, res, next) {
    Organization
    .findById(req.params.id)
    .exec(function (err, organization) {
        if (err) { return next (err); }
        Project.find({organization: organization}).sort('-created').exec(function (err, projects) {
            if (err) { return next(err); }
            Client.find({organization: organization}, function (err, clients) {
                if (err) { return next(err); }
                res.render('organization', {organization: organization, projects: projects, clients: clients});
            });
        });
    });
});

router.route('/invoice')
.all(ensureAuthenticated)
.get(function (req, res, next) {
    Client
    .find({organization: {$in: req.user.organizations}})
    .exec(function (err, clients) {
        if (err) { return next(err); }
        Invoice.find({client: {$in: clients}})
        .exec(function (err, invoices) {
            if (err) { return next(err); }
            res.render('invoice', {
                clients: clients,
                invoices: invoices
            });
        });
    });
});

router.route('/invoice/:id')
.all(ensureAuthenticated)
.get(function (req, res, next) {
    Project.find({client: req.params.id})
    .exec(function (err, projects) {
        if (err) { return next(err); }
        Hours.find({project: { $in: projects}}, function (err, hours){
            if (err) { return next(err); }
            res.json({projects: projects, hours: hours});
        });
    });
})
.post(function (req, res, next) {
    Project.find({client: req.params.id})
    .exec(function (err, projects) {
        var invoice = new Invoice();
        invoice.hours = req.body.hours;
        invoice.user = req.user;
        invoice.client = req.params.id;
        invoice.save(function (err, invoice) {
            if (err) { return next (err); }
            Hours.update({_id: { $in: invoice.hours }}, { $set: { invoice: invoice._id}});
            res.json({});
        });
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

// hours routes: only for update: put
router.put('/:id', function (req, res, next) {
    if (!req.user) {
        res.json(403, 'Forbidden');
    }
    else {
        Hours.findById(req.params.id, function (err, hours) {
            hours.project = req.body.project;
            hours.date = req.body.date;
            hours.start = add_time(req.body.date, req.body.start);
            hours.end = add_time(req.body.date, req.body.end);
            hours.duration = req.body.duration;
            hours.comment = req.body.comment;

            hours.save(function (err) {
                if (err) {
                    res.json(500, err);
                }
                else {
                    hours.populate('project', 'name').populate('user', 'name', function (err, hours) {
                        res.json(hours);
                    });
                }
            });
        });
    }
});

module.exports = router;

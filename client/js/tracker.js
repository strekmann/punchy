// sum durations
var sum = function () {
    $('.sum').text(function () {
        var sum = 0;
        var table = $(this).parents('table.hours');
        table.find('tbody td:nth-child(4)').each(function (el, cell) {
            sum += parseFloat(cell.innerText);
        });
        return sum;
    });
};

var Tracker = Ractive.extend({
    data: {
        error: [],
        list: [],
        projects: [],
        project: null,
        hours: [],
        own_hours: [],
        active: null,
        duration: 0,
        date: moment().format("YYYY-MM-DD"), // needed for default value - a nice trick by accident
        datetimeformat: function (datetime) {
            if (datetime) {
                return moment(datetime).format('LLL');
            }
        },
        dateformat: function (datetime) {
            if (datetime) {
                return moment(datetime).format('LL');
            }
        },
        timeformat: function (datetime) {
            if (datetime) {
                return moment(datetime).format('HH:mm');
            }
        }
    },

    createProject: function(project){
        return $.ajax({
            type: 'POST',
            url: window.location.href,
            data: project
        });
    },

    updateProject: function (project) {
        return $.ajax({
            type: 'PUT',
            url: window.location.href,
            data: project
        });
    },

    createHours: function (hours) {
        return $.ajax({
            type: 'POST',
            url: window.location.href,
            data: hours
        });
    }
});

module.exports.simple = function (projects, hours) {
    var tracker = new Tracker({
        el: '#simple',
        template: '#template',
        data: {
            projects: projects,
            hours: hours,
            has_project: function (wants) {
                var u = URI(window.location.href);
                if (u.search(true).project) {
                    return wants;
                }
                else {
                    return !wants;
                }
            }
        }
    });

    var startpicker, endpicker;
    startpicker = $('#start.timepicker').pickatime({
        format: 'H:i',
        interval: 15,
        onClose: function () {
            var endp = endpicker.pickatime('picker');
            var end = endp.get();
            var start = this.get();
            if (start) {
                var startarr = _.map(start.split(":"), function (item) {
                    return parseInt(item, 10);
                });
                endp.set('min', startarr);
                if (end) {
                    var endarr = _.map(end.split(":"), function (item) {
                        return parseInt(item, 10);
                    });
                    var duration = moment.duration({
                        hours: endarr[0] - startarr[0],
                        minutes: endarr[1] - startarr[1]
                    });
                    if (duration) {
                        tracker.set('duration', duration.as('hours'));
                    }
                }
            }
        }
    });

    endpicker = $('#end.timepicker').pickatime({
        format: 'H:i',
        interval: 15,
        onClose: function () {
            var startp = startpicker.pickatime('picker');
            var start = startp.get();
            var end = this.get();
            if (end) {
                var endarr = _.map(end.split(":"), function (item) {
                    return parseInt(item, 10);
                });
                startp.set('max', endarr);
                if (start) {
                    var startarr = _.map(start.split(":"), function (item) {
                        return parseInt(item, 10);
                    });
                    var duration = moment.duration({
                        hours: endarr[0] - startarr[0],
                        minutes: endarr[1] - startarr[1]
                    });
                    if (duration) {
                        tracker.set('duration', duration.as('hours'));
                    }
                }
            }
        }
    });

    tracker.on('createHours', function (event) {
        event.original.preventDefault();

        var node = $(event.node),
            hours = {
                project: node.find('#project').val(),
                date: node.find('#date').val(),
                start: node.find('#start').val(),
                end: node.find('#end').val(),
                duration: node.find('#duration').val(),
                comments: node.find('#comments').val()
            };

        tracker.createHours(hours)
            .then(function(data){
                // everything ok
                tracker.get('hours').unshift(data);
            }, function(xhr, status, err){
                tracker.get('error').push(err);
            });
        //$('body').animate({scrollTop: 0}, 'fast');
    });

    return tracker;
};

module.exports.projects = function (projects) {
    var tracker = new Tracker({
        el: '#projects',
        template: '#template',
        data: {
            projects: projects
        }
    });

    tracker.on('createProject', function (event) {
        event.original.preventDefault();

        var node = $(event.node),
            project = {
                name: node.find('#name').val(),
                client: node.find('#client').val()
            };

        tracker.createProject(project)
            .then(function(data){
                // everything ok
                tracker.toggle('expanded');
                tracker.get('projects').unshift(data);
            }, function(xhr, status, err){
                tracker.get('error').push(err);
            });
        //$('body').animate({scrollTop: 0}, 'fast');
    });

    return tracker;
};

module.exports.project = function (project, hours) {
    var all, own;
    var u = URI(window.location.href);
    console.log(u, u.hash());
    if (u.hash() === "#own") {
        own = true;
    }
    else {
        all = true;
    }
    var own_hours = _.filter(hours, function (h) {
        return (h.user._id.match(/^gartmann/));
    });
    var tracker = new Tracker({
        el: '#project',
        template: '#template',
        data: {
            project: project,
            hours: hours,
            own_hours: own_hours,
            own: own,
            all: all
        }
    });

    tracker.on('editToggle', function () {
        tracker.toggle('expanded');
    });

    tracker.on('toggleAll', function () {
        tracker.toggle('own');
        tracker.toggle('all');
        sum();
    });

    tracker.on('updateProject', function (event) {
        event.original.preventDefault();

        var node = $(event.node),
            project = {
                name: node.find('#name').val(),
                client: node.find('#client').val()
            };
        tracker.updateProject(project)
            .then(function(data){
                // everything ok
                tracker.toggle('expanded');
                tracker.set('project', data);
            }, function(xhr, status, err){
                tracker.get('error').push(err);
            });
        //$('body').animate({scrollTop: 0}, 'fast');
    });

    sum();

    return tracker;
};


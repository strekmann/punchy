var Tracker = Ractive.extend({
    data: {
        list: [],
        projects: [],
        active: null,
        duration: 0,
        date: moment().format("YYYY-MM-DD")
    },

    createProject: function(project){
        return $.ajax({
            type: 'POST',
            url: window.location.href,
            data: project
        });
    }
});

module.exports.simple = function (projects, active) {
    var tracker = new Tracker({
        el: '#simple',
        template: '#template',
        data: {
            projects: projects,
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
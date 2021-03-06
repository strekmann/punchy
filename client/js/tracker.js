// sum durations
var sum = function () {
    $('.sum').text(function () {
        var sum = 0;
        var table = $(this).parents('table.hours');
        table.find('tbody td:nth-child(4)').each(function (el, cell) {
            sum += parseFloat($(cell).html());
        });
        return sum;
    });
};

var Tracker = Ractive.extend({
    data: {
        error: [],
        list: [],
        projects: [],
        project: undefined,
        hours: [],
        own_hours: [],
        active: undefined,
        duration: 0,
        date: moment().format("YYYY-MM-DD"), // needed for default value - a nice trick by accident
        isodateformat: function (date) {
            if (date) {
                return moment(date).format("YYYY-MM-DD");
            }
        },
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
        },
        humanformat: function (datetime) {
            if (datetime) {
                return moment(datetime).fromNow();
            }
        }
    },

    updateProject: function (project) {
        return $.ajax({
            type: 'PUT',
            dataType: 'json',
            url: window.location.href,
            data: project
        });
    },

    deleteProject: function (project_id) {
    },

    createHours: function (data) {
        return $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/',
            data: _.pick(data, 'project', 'date', 'start', 'end', 'duration', 'comment')
        });
    },

    updateHours: function (data) {
        return $.ajax({
            type: 'PUT',
            dataType: 'json',
            url: '/' + data._id,
            data: _.pick(data, 'project', 'date', 'start', 'end', 'duration', 'comment')
        });
    },

    create_timepickers: function (start_element, end_element) {
        var tracker = this;
        var startpicker, endpicker;

        startpicker = start_element.pickatime({
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
        endpicker = end_element.pickatime({
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

    tracker.on('toggleNew', function (event) {
        event.original.preventDefault();
        tracker.toggle('expanded');
        if (tracker.get('expanded')) {
            if (!Modernizr.inputtypes.date) {
                $('#date').fdatepicker({language: 'nb', weekStart: 1, format: 'yyyy-mm-dd'});
            }
            if (!Modernizr.touch || !Modernizr.inputtypes.time) {
                tracker.create_timepickers($('#start.timepicker'), $('#end.timepicker'));
            }
        }
    });

    tracker.on('toggleEdit', function (event) {
        event.original.preventDefault();
        tracker.toggle(event.keypath + '.expanded');
        if (tracker.get(event.keypath + '.expanded')) {
            //tracker.create_timepickers($(event.node).find('.start'), $(event.node).find('.end'));
        }
    });

    tracker.on('createHours', function (event) {
        event.original.preventDefault();
        event.context.project = $('#project').val();
        event.context.date = $(event.node).find("#date").val();
        event.context.start = $(event.node).find("#start").val();
        event.context.end = $(event.node).find("#end").val();

        tracker.createHours(event.context)
            .then(function(data){
                // everything ok
                tracker.get('hours').unshift(data);

                // should not reset everything: date and project should stay
                //$('form#createHours').trigger('reset');
                $(event.node).find("#start").val('');
                $(event.node).find("#end").val('');
                $(event.node).find("#duration").val('');
                $(event.node).find("#comment").val('');
                $(event.node).find("#date").focus();
                alerts.get('success').push(data.project.name + ' ' + moment(data.date).format('LL') + ' ' + moment(data.created).fromNow());
            }, function(xhr, status, err){
                tracker.get('error').push(err);
            });
        //$('body').animate({scrollTop: 0}, 'fast');
    });

    tracker.on('updateHours', function (event) {
        event.original.preventDefault();

        event.context.date = $(event.node).find("#date").val();
        event.context.start = $(event.node).find(".start").val();
        event.context.end = $(event.node).find(".end").val();

        tracker.updateHours(event.context)
            .then(function(data) {
                tracker.set(event.keypath, data);
            }, function(xhr, status, err) {
                tracker.get('error').push(err);
            });
    });

    tracker.on('updateDuration', function (event) {
        var form = $(event.node).parents('form');
        var start = $(form).find(".start").val() ;
        var end = $(form).find(".end").val();
        var startarr, endarr;

        if (start) {
            startarr = _.map(start.split(":"), function (item) {
                return parseInt(item, 10);
            });
        }

        if (end) {
            endarr = _.map(end.split(":"), function (item) {
                return parseInt(item, 10);
            });
        }

        if (start && end) {
            var duration = moment.duration({
                hours: endarr[0] - startarr[0],
                minutes: endarr[1] - startarr[1]
            });
            if (duration) {
                tracker.set(event.keypath + '.duration', duration.as('hours'));
            }
        }
    });

    return tracker;
};

module.exports.organization = function (obj) {
    var tracker = new Tracker({
        el: '#organization',
        template: '#template',
        data: obj
    });

    tracker.on('createProject', function (event) {
        event.original.preventDefault();

        var project = tracker.get('project');
        project.organization = tracker.get('organization')._id;

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/projects',
            data: {project: project}
        })
        .then(function(data){
            // everything ok
            tracker.get('projects').unshift(data);
            tracker.set('project', {});
        }, function(xhr, status, err){
            tracker.get('error').push(err);
        });
        //$('body').animate({scrollTop: 0}, 'fast');
    });

    tracker.on('deleteProject', function (event) {
        var project = event.context;
        $.ajax({
            type: 'DELETE',
            dataType: 'json',
            url: '/projects',
            data: {project: project}
        })
        .then(function (data) {
            tracker.get('projects').splice(event.keypath.split('.').pop(), 1);
        }, function (xhr, status, err) {
            tracker.get('error').push(xhr.responseText);
        });
    });

    tracker.on('createClient', function (event) {
        event.original.preventDefault();

        var client = tracker.get('client');
        client.organization = tracker.get('organization')._id;

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/clients',
            data: {client: client}
        })
        .then(function(data){
            // everything ok
            tracker.get('clients').unshift(data);
            tracker.set('client', {});
        }, function(xhr, status, err){
            tracker.get('error').push(err);
        });
    });

    tracker.on('deleteClient', function (event) {
        var client = event.context;

        $.ajax({
            type: 'DELETE',
            dataType: 'json',
            url: '/clients',
            data: {client: client}
        })
        .then(function (data) {
            tracker.get('clients').splice(event.keypath.split('.').pop(), 1);
        }, function (xhr, status, err) {
            tracker.get('error').push(xhr.responseText);
        });
    });


    return tracker;
};

module.exports.project = function (conf) {
    var project = conf.project,
        projects = conf.projects,
        hours = conf.hours,
        userid = conf.userid;

    var all, own;
    var u = URI(window.location.href);
    if (u.hash() === "#all") {
        all = true;
    }
    else {
        own = true;
    }
    var own_hours = _.filter(hours, function (h) {
        return h.user._id === userid;
    });
    var tracker = new Tracker({
        el: '#project',
        template: '#template',
        data: {
            project: project,
            projects: projects,
            hours: hours,
            own_hours: own_hours,
            own: own,
            all: all
        }
    });

    tracker.on('toggleEdit', function (event) {
        event.original.preventDefault();
        event.context.old_project_id = event.context.project._id;

        tracker.toggle(event.keypath + '.expanded');
        if (tracker.get(event.keypath + '.expanded')) {
            //tracker.create_timepickers($(event.node).find('.start'), $(event.node).find('.end'));
        }
    });

    tracker.on('editToggle', function () {
        tracker.toggle('expanded');
    });

    tracker.on('toggleAll', function (event) {
        tracker.toggle('own');
        tracker.toggle('all');
        sum();
    });

    tracker.on('updateHours', function (event) {
        event.original.preventDefault();

        event.context.date = $(event.node).find("#date").val();
        event.context.start = $(event.node).find(".start").val();
        event.context.end = $(event.node).find(".end").val();

        tracker.updateHours(event.context)
            .then(function(data) {
                data.moved = data.project._id !== event.context.old_project_id;
                tracker.set(event.keypath, data);
            }, function(xhr, status, err) {
                tracker.get('error').push(err);
            });
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

module.exports.clients = function (c) {
    var clients = new Ractive({
        el: '#clients',
        template: '#template',
        data: {
            clients: c || [],
            client: {}
        }
    });

    clients.on('createClient', function (event) {
        event.original.preventDefault();

        var client = event.context.client;

        $.ajax({
            dataType: 'json',
            type: 'POST',
            url: window.location.href,
            data: client
        })
        .then(function (client) {
            clients.push('clients', client);
        })
        .fail(function (err) {
            alert(err.responseJSON.error);
        });
    });
};

module.exports.invoice = function (obj) {
    var invoice = new Ractive({
        el: '#create-invoice',
        template: '#create-invoice-template',
        data: {
            clients: obj.clients,
            client: undefined,
            projects: [],
            project: undefined,
            hours: [],
            filteredHours: [],
            selectedHours: [],
            invoices: obj.invoices
        }
    });

    invoice.observe('client', function (value) {
        if (value) {
            $.ajax({
                url: '/invoice/project/' + value,
                type: 'get',
                dataType: 'json'
            })
            .then(function (data) {
                invoice.set('projects', data.projects);
                invoice.set('hours', data.hours);
                invoice.set('filteredHours', data.hours);
            });
        }
    });

    invoice.observe('project', function (value) {
        if (!value) {
            return invoice.set('filteredHours', invoice.get('hours'));
        }
        invoice.set('filteredHours', _.filter(invoice.get('hours'), function (item) {
            return item.project._id === value;
        }));
    });

    invoice.on('prepareInvoice', function (event) {
        event.original.preventDefault();
        invoice.set('selectedHours', event.context.selected);
        //window.location.hash = "#selectedHours";
        $(document.body).animate({
            'scrollTop': $('#selectedHours').offset().top
        }, 1000);
    });

    invoice.on('saveInvoice', function (event) {
        event.original.preventDefault();
        console.log(invoice.data);
        $.ajax({
            url: '/invoice',
            type: 'POST',
            dataType: 'json',
            data: {
                hours: event.context.selectedHours,
                client: invoice.get('client')
            }
        }).then(function (data) {
            window.location.href = '/invoice/' + data.id;
        });
    });
};

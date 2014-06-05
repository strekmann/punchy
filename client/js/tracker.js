// compute duration from start time and end time strings
var compute_duration = function (start, end) {
    if (start && end) {
        var startarr = start.split(":");
        var endarr = end.split(":");
        var duration = moment.duration({
            hours: endarr[0] - startarr[0],
            minutes: endarr[1] - startarr[1]
        });
        return duration.as('hours');
    }
};

var Tracker = Ractive.extend({
    data: {
        list: [],
        date: moment().format("YYYY-MM-DD")
    }
});

module.exports.simple = function () {
    var tracker = new Tracker({
        el: '#simple',
        template: '#template',
        duration: 0
    });

    var startpicker, endpicker;
    startpicker = $('#start.timepicker').pickatime({
        format: 'H:i',
        interval: 15,
        max: moment().add('minutes', 7),
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

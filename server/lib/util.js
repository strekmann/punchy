var moment = require('moment');

module.exports.daterange = function (start, end) {
    var startm, endm, startd, endd;
    if (start && end) {
        startm = moment.utc(start);
        endm = moment.utc(end);
        startd = moment.utc(start).startOf('day');
        endd = moment.utc(end).startOf('day');
        if (startm.isSame(endm, 'day')) {
            // same day
            if (startm.isSame(startd) && endm.isSame(endd)) {
                return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LL') + '</time>';
            }
            return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LLL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LT') + '</time>';
        }
        // saving dates should always set startOf('day') AND later wholeday
        if (startm.isSame(startd) && endm.isSame(endd)) {
            return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LL') + '</time>';
        }
        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LLL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LLL') + '</time>';
    }
    if (start) {
        // only start
        startm = moment(start);
        startd = moment(startm).startOf('day');
        if (startm.isSame(startd, 'second')) {
            return '<time datetime="' + startm.format() + '">' + startm.format('LL') + '</time>';

        }
        return '<time datetime="' + startm.format() + '">' + startm.format('LLL') + '</time>';
    }
    if (end) {
        // only end
        endm = moment(end);
        endd = moment(endm).startOf('day');
        if (endm.isSame(endd, 'second')) {
            return '<time datetime="' + endm.format() + '">' + endm.format('LL') + '</time>';
        }
        return '<time datetime="' + endm.format() + '">' + endm.format('LLL') + '</time>';
    }
};

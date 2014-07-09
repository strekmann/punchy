moment.lang($('html').attr('lang'));

var alerts = function (messages) {
   var ractive = new Ractive({
        el: '#alerts',
        template: '#alerttemplate',
        data: {
            error: messages ? messages.error : [],
            warning: messages ? messages.warning : [],
            success: messages ? messages.success : [],
            info: messages? messages.info : []
        }
    });

    ractive.on('closeMessage', function (event) {
        var key_num = event.keypath.split(".");
        this.data[key_num[0]].splice(key_num[1], 1);
    });

    return ractive;
};

module.exports = {
    tracker: require('./tracker'),
    account: require('./account'),
    alerts: alerts
};

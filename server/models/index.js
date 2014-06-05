var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    _id: {type: String, lowercase: true, trim: true, required: true, unique: true},
    username: {type: String, lowercase: true, trim: true, required: true, unique: true},
    name: {type: String, required: true},
    email: {type: String},
    password: {type: String},
    is_active: {type: Boolean, 'default': true},
    is_admin: {type: Boolean, 'default': false},
    created: {type: Date, required: true, 'default': Date.now},
    google_id: {type: String}
});

var ProjectSchema = new mongoose.Schema({
    name: {type: String, trim: true},
    users: [{type: String, ref: 'User'}],
    created: {type: Date, required: true, 'default': Date.now}
});

var PeriodSchema = new mongoose.Schema({
    user: {type: String, ref: 'User'}, // TODO: Required true
    project: {type: String, ref: 'Project'},
    start: {type: Date}, // use this for date
    end: {type: Date},
    duration: {type: Number},
    comment: {type: String, trim: true},
    created: {type: Date, required: true, 'default': Date.now}
    // TODO: tags
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Project: mongoose.model('Project', ProjectSchema),
    Perod: mongoose.model('Period', PeriodSchema)
};

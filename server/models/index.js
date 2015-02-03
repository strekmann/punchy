var mongoose = require('mongoose'),
    shortid = require('shortid');

// TODO
// Enkeltbrukere opprettes med team. Dette kan man så endre navn på og evt. invitere flere til.
var UserSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true, 'default': shortid.generate},
    username: {type: String, lowercase: true, trim: true, required: true, unique: true},
    name: {type: String, required: true},
    email: {type: String},
    password: {type: String},
    is_active: {type: Boolean, 'default': true},
    is_admin: {type: Boolean, 'default': false},
    created: {type: Date, required: true, 'default': Date.now},
    google_id: {type: String},
    teams: [{type:String, ref: 'Team'}]
});

var ProjectSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true, 'default': shortid.generate},
    name: {type: String, trim: true, required: true},
    client: {type: String, trim: true},
    team: {type: String, ref: 'Team'},
    created: {type: Date, required: true, 'default': Date.now},
    modified: {type: Date, required: true, 'default': Date.now}
});

var HoursSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true, 'default': shortid.generate},
    user: {type: String, ref: 'User', required: true},
    project: {type: String, ref: 'Project', required: true},
    date: {type: Date, required: true},
    start: {type: Date}, // use this for date
    end: {type: Date},
    duration: {type: Number, required: true},
    comment: {type: String, trim: true},
    created: {type: Date, required: true, 'default': Date.now},
    invoice: {type: String, ref: 'Invoice'}
});

var TeamSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true, 'default': shortid.generate},
    name: {type: String, required: true},
    users: [{type: String, ref: 'User'}]
});

var ClientSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true, 'default': shortid.generate},
    user: {type: String, ref: 'User', required: true}, // user who created client
    teams: [{type: String, ref: 'Team'}],
    name: {type: String, required: true},
    projects: [{type: String, ref: 'Project'}]
});

var InvoiceSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true, 'default': shortid.generate},
    user: {type: String, ref: 'User', required: true}, // who made it
    team: {type: String, ref: 'Team'},
    created: {type: Date, required: true, 'default': Date.now},
    hours: [{type: String, ref: 'Hours'}],
    client: {type: String, ref: 'Client'}
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Project: mongoose.model('Project', ProjectSchema),
    Hours: mongoose.model('Hours', HoursSchema),
    Team: mongoose.model('Team', TeamSchema),
    Client: mongoose.model('Client', ClientSchema),
    Invoice: mongoose.model('Invoice', InvoiceSchema)
};

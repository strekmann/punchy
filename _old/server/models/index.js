var mongoose = require('mongoose'),
    shortid = require('shortid');

// TODO
// Enkeltbrukere opprettes med organization.
var UserSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true, 'default': shortid.generate},
    username: {type: String, lowercase: true, trim: true, required: true, unique: true},
    name: {type: String, required: true},
    email: {type: String},
    password: {type: String},
    is_active: {type: Boolean, 'default': true},
    is_admin: {type: Boolean, 'default': false},
    created: {type: Date, required: true, 'default': Date.now},
    google_id: {type: String}
});

var OrganizationSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true, 'default': shortid.generate},
    admins: [{type: String, ref: 'User'}],
    name: {type: String, trim: true, required: true},
    users: [{type: String, ref: 'User'}],
    created: {type: Date, required: true, 'default': Date.now}
});

var ProjectSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true, 'default': shortid.generate},
    name: {type: String, trim: true, required: true},
    client: {type: String, trim: true, ref: 'Client'},
    user: {type: String, ref: 'User', required: true}, // user who created project
    organization: {type: String, ref: 'Organization', required: true},
    users: [{type: String, ref: 'User'}], // deprecated
    active: {type: Date},
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

var ClientSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true, 'default': shortid.generate},
    user: {type: String, ref: 'User', required: true}, // user who created client
    organization: {type: String, ref: 'Organization'},
    name: {type: String, required: true}
});

var InvoiceSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true, 'default': shortid.generate},
    user: {type: String, ref: 'User', required: true}, // who made it
    created: {type: Date, required: true, 'default': Date.now},
    start: {type: Date, required: true},
    end: {type: Date, required: true},
    sum: {type: Number, required: true},
    client: {type: String, ref: 'Client'}
});

module.exports = {
    User: mongoose.model('User', UserSchema),
    Project: mongoose.model('Project', ProjectSchema),
    Hours: mongoose.model('Hours', HoursSchema),
    Organization: mongoose.model('Organization', OrganizationSchema),
    Client: mongoose.model('Client', ClientSchema),
    Invoice: mongoose.model('Invoice', InvoiceSchema)
};

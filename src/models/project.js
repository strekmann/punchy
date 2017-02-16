import mongoose from 'mongoose';
import uuid from 'uuid/v4';

const ProjectSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true, 'default': uuid},
    name: {type: String, trim: true, required: true},
    client: {type: String, trim: true, ref: 'Client'},
    user: {type: String, ref: 'User', required: true}, // user who created project
    organization: {type: String, ref: 'Organization', required: true},
    users: [{type: String, ref: 'User'}], // deprecated
    active: {type: Date},
    created: {type: Date, required: true, 'default': Date.now},
    modified: {type: Date, required: true, 'default': Date.now}
});

const opts = { versionKey: false, virtuals: true };
ProjectSchema.set('toObject', opts);
ProjectSchema.set('toJSON', opts);
ProjectSchema.set('timestamps', true);
ProjectSchema.virtual('$type').get(() => 'Project');
export default mongoose.model('Project', ProjectSchema);

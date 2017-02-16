import mongoose from 'mongoose';
import uuid from 'uuid/v4';

const ClientSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true, 'default': uuid},
    user: {type: String, ref: 'User', required: true}, // user who created client
    organization: {type: String, ref: 'Organization'},
    name: {type: String, required: true}
});

const opts = { versionKey: false, virtuals: true };
ClientSchema.set('toObject', opts);
ClientSchema.set('toJSON', opts);
ClientSchema.set('timestamps', true);
ClientSchema.virtual('$type').get(() => 'Client');
export default mongoose.model('Client', ClientSchema);

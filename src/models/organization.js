import mongoose from 'mongoose';
import uuid from 'uuid/v4';

const OrganizationSchema = new mongoose.Schema({
    _id: { type: String, required: true, unique: true, default: uuid },
    admins: [{ type: String, ref: 'User' }],
    name: { type: String, trim: true, required: true },
    users: [{ type: String, ref: 'User' }],
    created: { type: Date, required: true, default: Date.now },
});

const opts = { versionKey: false, virtuals: true };
OrganizationSchema.set('toObject', opts);
OrganizationSchema.set('toJSON', opts);
OrganizationSchema.set('timestamps', true);
OrganizationSchema.virtual('$type').get(() => {
    return 'Organization';
});
export default mongoose.model('Organization', OrganizationSchema);

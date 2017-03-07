import mongoose from 'mongoose';
import uuid from 'uuid/v4';

const ProjectSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: uuid },
    name: { type: String, trim: true, required: true },
    client: { type: String, trim: true, ref: 'Client' },
    user: { type: String, ref: 'User', required: true }, // user who created project
    organization: { type: String, ref: 'Organization', required: true },
    users: [{ type: String, ref: 'User' }], // deprecated
    active: { type: Date },
}, {
    timestamps: {
        createdAt: 'created',
        updatedAt: 'modified',
    },
});

const opts = { versionKey: false, virtuals: true };
ProjectSchema.set('toObject', opts);
ProjectSchema.set('toJSON', opts);
ProjectSchema.virtual('$type').get(() => {
    return 'Project';
});
export default mongoose.model('Project', ProjectSchema);

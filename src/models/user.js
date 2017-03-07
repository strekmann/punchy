import mongoose from 'mongoose';
import uuid from 'uuid/v4';

const UserSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: uuid },
    username: { type: String, lowercase: true, trim: true, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    password: { type: String },
    is_active: { type: Boolean, default: true },
    is_admin: { type: Boolean, default: false },
    google_id: { type: String },
}, {
    timestamps: {
        createdAt: 'created',
    },
});

const opts = { versionKey: false, virtuals: true };
UserSchema.set('toObject', opts);
UserSchema.set('toJSON', opts);
UserSchema.virtual('$type').get(() => {
    return 'User';
});
export default mongoose.model('User', UserSchema);

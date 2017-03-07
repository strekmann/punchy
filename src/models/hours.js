import mongoose from 'mongoose';
import uuid from 'uuid/v4';

const HoursSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: uuid },
    user: { type: String, ref: 'User', required: true },
    project: { type: String, ref: 'Project', required: true },
    date: { type: Date, required: true },
    start: { type: Date }, // use this for date
    end: { type: Date },
    duration: { type: Number, required: true },
    comment: { type: String, trim: true },
    invoice: { type: String, ref: 'Invoice' },
}, {
    timestamps: {
        createdAt: 'created',
    },
});

const opts = { versionKey: false, virtuals: true };
HoursSchema.set('toObject', opts);
HoursSchema.set('toJSON', opts);
HoursSchema.virtual('$type').get(() => {
    return 'Hours';
});
export default mongoose.model('Hours', HoursSchema);

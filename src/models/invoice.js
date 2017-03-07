import mongoose from 'mongoose';
import uuid from 'uuid/v4';

const InvoiceSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: uuid },
    user: { type: String, ref: 'User', required: true }, // who made it
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    sum: { type: Number, required: true },
    client: { type: String, ref: 'Client' },
}, {
    timestamps: {
        createdAt: 'created',
    },
});

const opts = { versionKey: false, virtuals: true };
InvoiceSchema.set('toObject', opts);
InvoiceSchema.set('toJSON', opts);
InvoiceSchema.virtual('$type').get(() => {
    return 'Invoce';
});
export default mongoose.model('Invoce', InvoiceSchema);

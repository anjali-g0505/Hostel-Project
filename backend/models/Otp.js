const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OtpSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    otpHash: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['signup', 'password-reset'],
        default: 'signup'
    },
    attempts: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

// Expired/abandoned OTPs clean themselves up automatically.
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpModel = mongoose.model('Otp', OtpSchema);
module.exports = OtpModel;

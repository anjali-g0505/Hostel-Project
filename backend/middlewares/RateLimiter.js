const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = rateLimit;

// /send-otp is callable independently and repeatedly (auto-call on page load + resend
// clicks + scripted abuse), so it's rate-limited per-email rather than relying on the
// per-OTP wrong-guess cap in verifyOtp, which is a separate concern.
const sendOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    // Falls back to IP (via the IPv6-safe helper) so requests with a missing/blank
    // email don't all pile into one shared bucket keyed on the empty string.
    keyGenerator: (req) => {
        const email = (req.body?.email || '').trim().toLowerCase();
        return email || ipKeyGenerator(req.ip);
    },
    message: { success: false, message: 'Too many OTP requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    sendOtpLimiter
};

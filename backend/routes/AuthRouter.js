const { signup, login, sendOtp, verifyOtp, forgotPassword, verifyResetOtp, resetPassword } = require('../controllers/AuthController');
const { signupVal, loginVal, forgotPasswordVal, verifyResetOtpVal, resetPasswordVal } = require('../middlewares/AuthValidation');
const { sendOtpLimiter } = require('../middlewares/RateLimiter');

const router=require('express').Router();

router.post('/login', loginVal, login);
router.post('/signup', signupVal, signup); //login and signup flow called only when the validation check is passed
router.post('/send-otp', sendOtpLimiter, sendOtp); // also serves as the resend code endpoint
router.post('/verify-otp', verifyOtp);

// Password reset flow - shares the same sendOtpLimiter
router.post('/forgot-password', sendOtpLimiter, forgotPasswordVal, forgotPassword);
router.post('/verify-reset-otp', verifyResetOtpVal, verifyResetOtp);
router.patch('/reset-password', resetPasswordVal, resetPassword);

module.exports=router;

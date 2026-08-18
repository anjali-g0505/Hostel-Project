const { signup, login, sendOtp, verifyOtp } = require('../controllers/AuthController');
const { signupVal, loginVal } = require('../middlewares/AuthValidation');
const { sendOtpLimiter } = require('../middlewares/RateLimiter');

const router=require('express').Router();

router.post('/login', loginVal, login);
router.post('/signup', signupVal, signup); //login and signup flow called only when the validation check is passed
router.post('/send-otp', sendOtpLimiter, sendOtp); // also serves as the resend code endpoint
router.post('/verify-otp', verifyOtp);

module.exports=router;

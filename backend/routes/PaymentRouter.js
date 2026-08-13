const { processPayment, getKey, paymentVerification } = require('../controllers/ProductController');
const { ensureAuthenticated, checkRole } = require('../middlewares/Auth');

const router=require('express').Router();
router.post("/payment/process", ensureAuthenticated, checkRole(['warden', 'student']), processPayment);
router.get("/getKey", ensureAuthenticated, checkRole(['warden', 'student']), getKey);
router.post("/paymentVerification", paymentVerification);

module.exports=router;

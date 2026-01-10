const { processPayment, getKey } = require('../controllers/ProductController');
const { ensureAuthenticated, checkRole } = require('../middlewares/Auth');

const router=require('express').Router();
router.post("/payment/process", ensureAuthenticated, checkRole(['warden', 'student']), processPayment);
router.get("/getKey", ensureAuthenticated, checkRole(['warden', 'student']), getKey)

module.exports=router;

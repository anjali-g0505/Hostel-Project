const { placeOrder, getPendingOrders, getAccepted, orderLog } = require('../controllers/OrderController');
const { ensureAuthenticated, checkRole } = require('../middlewares/Auth');

const router=require('express').Router();
router.post('/place-order', ensureAuthenticated, checkRole(['student', 'warden']), placeOrder);
router.get('/:category/get-pending-orders', ensureAuthenticated, checkRole('mess'), getPendingOrders);
router.get('/:category/get-accepted-orders', ensureAuthenticated, checkRole('mess'), getAccepted);
router.get('/:category/get-order-logs', ensureAuthenticated, checkRole('mess'), orderLog);

module.exports=router;
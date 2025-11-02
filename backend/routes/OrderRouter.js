const { placeOrder, getPendingOrders, getAccepted, orderLog, changeOrderStatus } = require('../controllers/OrderController');
const { ensureAuthenticated, checkRole } = require('../middlewares/Auth');

const router=require('express').Router();
router.post('/place-order', ensureAuthenticated, checkRole(['student', 'warden']), placeOrder);
router.get('/:category/get-pending-orders', ensureAuthenticated, checkRole('mess'), getPendingOrders);
router.patch('/:id/change-order-status', ensureAuthenticated, checkRole('mess'), changeOrderStatus);
router.get('/:category/get-accepted-orders', ensureAuthenticated, checkRole('mess'), getAccepted);
router.get('/:category/order-log', ensureAuthenticated, checkRole('mess'), orderLog);
module.exports=router;
const { placeOrder, getPendingOrders, getAccepted, orderLog, changeOrderStatus } = require('../controllers/OrderController');
const { ensureAuthenticated, checkRole } = require('../middlewares/Auth');

const router=require('express').Router();
router.post('/place-order', ensureAuthenticated, checkRole(['student', 'warden']), placeOrder);
router.get('/:category/get-pending-orders', ensureAuthenticated, checkRole('mess'), getPendingOrders);
module.exports=router;
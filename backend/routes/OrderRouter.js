const { placeOrder, getPendingOrders, changeOrderStatus } = require('../controllers/OrderController');
const { ensureAuthenticated, checkRole } = require('../middlewares/Auth');

const router=require('express').Router();
router.post('/place-order', ensureAuthenticated, checkRole(['student', 'warden']), placeOrder);
router.get('/:category/get-pending-orders', ensureAuthenticated, checkRole('mess'), getPendingOrders);
router.patch('/:id/change-order-status', ensureAuthenticated, checkRole('mess'), changeOrderStatus);
module.exports=router;
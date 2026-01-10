const { requestOrder, getPendingOrders, getAccepted, orderLog, changeOrderStatus, viewMyOrders } = require('../controllers/OrderController');
const { ensureAuthenticated, checkRole } = require('../middlewares/Auth');

const router=require('express').Router();
router.post('/request-order', ensureAuthenticated, checkRole(['student', 'warden']), requestOrder);
router.get('/:category/get-pending-orders', ensureAuthenticated, checkRole('mess'), getPendingOrders);
router.patch('/:id/change-order-status', ensureAuthenticated, checkRole('mess'), changeOrderStatus);
router.get('/:category/get-accepted-orders', ensureAuthenticated, checkRole('mess'), getAccepted);
router.get('/:category/order-log', ensureAuthenticated, checkRole('mess'), orderLog);
router.get('/view-my-orders', ensureAuthenticated, checkRole(['warden', 'student']), viewMyOrders);
module.exports=router;
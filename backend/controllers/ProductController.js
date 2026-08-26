const instance = require("../razorpayConfig.js");
require('dotenv').config();
const crypto = require("crypto");
const OrderModel = require("../models/orders");
const { emitToMessRoom, emitToUser } = require("../socket/socketEmitter");

const processPayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await OrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        if (order.studentID.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "This order does not belong to you." });
        }
        if (order.status !== 'Accepted') {
            return res.status(400).json({ success: false, message: "Only accepted orders can be paid for." });
        }

        const options = {
            amount: Number(order.totalAmount * 100),
            currency: "INR",
            receipt: order._id.toString()
        };
        const razorpayOrder = await instance.orders.create(options);

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(200).json({ success: true, order: razorpayOrder });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
const getKey=async(req,res)=>{
    res.status(200).json({
        key:process.env.RAZORPAY_API_KEY,
        success:true,
        message:"Key recieved successfully."
    })
}



const paymentVerification = async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const order = await OrderModel.findOne({ razorpayOrderId: razorpay_order_id }).populate('studentID', 'name role mobile');
    const viewCartPath = order?.studentID?.role === 'student' ? '/student/view-cart' : '/warden/view-cart';

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic && order) {
        order.status = 'Paid';
        order.razorpayPaymentId = razorpay_payment_id;
        order.paidAt = new Date();
        await order.save();

        emitToMessRoom('order:paid', order);
        emitToUser(order.studentID._id.toString(), 'order:paid', order);

        return res.redirect(`${viewCartPath}?payment=success`);
    }

    return res.redirect(`${viewCartPath}?payment=failed`);
};

module.exports={
    processPayment,
    getKey,
    paymentVerification
};
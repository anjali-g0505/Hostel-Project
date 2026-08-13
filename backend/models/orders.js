const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * This is a Sub-Document.
 * It stores a snapshot of the item at the time of purchase.
 * The menuItemID isn't actually a reference but an ID to simply show along with the other information a single line of the entire receipt
 * This is crucial so that if the item's price changes later in the MenuItem collection, the price in this order remains the same.
 */
const OrderItemSchema = new Schema({
    menuItemID: {
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1
    }
}, { _id: false }); // _id: false because this is a sub-document


// This is the main Order Model. One document will be created for each complete transaction.
 
const OrderSchema = new Schema({

    studentID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [OrderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        required: true,
        enum: [
            'Pending',         // Student just placed the order
            'Accepted',        // Mess staff accepted the order
            'Paid',            // Student paid for the accepted order
            'Rejected',        // Mess staff rejected the order
            'Ready'            // Order is ready for pickup
        ],
        default: 'Pending'
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    paidAt: {
        type: Date
    },
    specialInstructions: {
        type: String,
        trim: true
    },
    category: {
        type:String,
        trim:true,
        enum: [
            'breakfast',
            'lunch',
            'snacks',
            'dinner'
        ],
        required:true
    }
}, { timestamps: true }); 

const OrderModel = mongoose.model('Order', OrderSchema);
module.exports = OrderModel;

const MenuItemModel = require("../models/menu");
const OrderModel = require("../models/orders");
const { emitToMessRoom, emitToUser } = require("../socket/socketEmitter");

const getPendingOrders=async(req,res)=>{
    try {
        const { category } = req.params;
        if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(category)) {
            return res.status(400).json({
                message: "Invalid category.",
                success: false
            });
        }
        let orders = await OrderModel.find({ "status": "Pending", "category": category }).populate('studentID', 'name role mobile');
        if (orders.length === 0) {
            return res.status(200).json({
                message: `No pending orders found for ${category}.`, 
                success: true,
                orders: []
            });
        }

        return res.status(200).json({
            message: "Pending orders fetched successfully",
            success: true,
            orders: orders
        });
    }
    catch (err) {
        console.error(`Error: ${err}`);
        return res.status(500).json({
            message: "Internal Server Error. Could not fetch documents.",
            success: false
        });
    }
}
const requestOrder= async (req,res)=>{
    try {
        const { items, specialInstructions, category } = req.body;
        const studentID = req.user.id; 

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty." });
        }

        // Array of all unique item IDs from the cart
        const itemIDs = items.map(item => item.menuItemID);

        // Fetch all those items from the database and make an array of each item from the db
        const menuItemsFromDB = await MenuItemModel.find({ _id: { $in: itemIDs } });

        let totalAmount = 0;
        const orderItems = []; //snapshot array

        // Loop through the student's cart
        for (const cartItem of items) {
            // for each menu item fetch the menuItem from the db
            const menuItem = menuItemsFromDB.find(
                (dbItem) => dbItem._id.toString() === cartItem.menuItemID
            );
            if (!menuItem) {
                // This will happen if an ID was in the cart but not in the db
                return res.status(404).json({ success: false, message: `Item not found.` });
            }
            if (menuItem.status === 'Unavailable') {
                return res.status(400).json({ success: false, message: `Sorry, "${menuItem.name}" is currently unavailable.` });
            }
            if (menuItem.price === null || menuItem.price < 0) {
                return res.status(400).json({ success: false, message: `Sorry, "${menuItem.name}" is not for sale.` });
            }

            // Build the order Item Schema array
            const itemSnapshot = {
                menuItemID: menuItem._id,
                name: menuItem.name,       
                price: menuItem.price,     
                quantity: cartItem.quantity
            };
            orderItems.push(itemSnapshot);

            // calculate total amount
            totalAmount += (menuItem.price * cartItem.quantity);
        }

        // Create a new order and save
        const newOrder = new OrderModel({
            studentID,
            items: orderItems, 
            totalAmount: totalAmount,
            specialInstructions: specialInstructions || "",
            status: 'Pending',
            category: category
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            order: newOrder
        });

        await newOrder.populate('studentID', 'name role mobile');
        emitToMessRoom('order:pending', newOrder);

    } catch (err) {
        console.error("Create Order Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
}

const changeOrderStatus = async(req,res)=>{
    try{
        let {status} = req.body;
        let {id} = req.params;
        if (!['Accepted', 'Rejected', 'Ready'].includes(status))
            {
                return res.status(400).json({ //Bad request
                    message: 'Invalid status.',
                    success: false
                });
            }

        // Ready requires the order to currently be Paid; Accepted/Rejected require it to currently be Pending.
        // The find + update happens atomically so that when multiple mess devices race to action the
        // same order, only the first write succeeds - everyone else gets a 409 instead of silently overwriting.
        const requiredCurrentStatus = status === 'Ready' ? 'Paid' : 'Pending';
        let order = await OrderModel.findOneAndUpdate(
            { _id: id, status: requiredCurrentStatus },
            { status },
            { new: true }
        );

        if(!order){
            const existingOrder = await OrderModel.findById(id);
            if(!existingOrder){
                return res.status(404).json({ //Not found
                        message: 'Order not found for the given id.',
                        success: false
                    });
            }
            return res.status(409).json({ //Conflict
                message: 'Order already actioned',
                success: false
            });
        }

        res.status(200).json({
                message: `Status changed successfully to ${status}`,
                success: true,
                order: order
            });

        await order.populate('studentID', 'name role mobile');
        const eventName = `order:${status.toLowerCase()}`;
        emitToMessRoom(eventName, order);
        emitToUser(order.studentID._id.toString(), eventName, order);
    }
    catch(err){
        console.error("Change Status Error:", err);
        res.status(500).json({
            message:"Internal Server Error. Could not change status.",
            success:false,
        })
    }
}

const getPaidOrders = async (req, res) => {
    try {
    const { category } = req.params;
    // Includes 'Ready' too, so orders stay visible on this tab after being marked ready -
    // the mess can still verify them here when the student/warden comes to collect.
    let orders = await OrderModel.find({category, status: { $in: ['Paid', 'Ready'] } }).populate('studentID', 'name role mobile').sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(200).json({
        message: "No paid orders yet.",
        success: true,
        orders
      });
    }

    res.status(200).json({
      message: "Paid orders viewed successfully.",
      success: true,
      orders:orders
    });
    } catch (error) {
    console.error("Paid orders Error:", error);
    res.status(500).json({
      message: "Could not retrieve paid orders. Internal Server Error",
      success: false,
    });
  }
}

const viewMyOrders = async(req,res)=>{
    try{
        const id=req.user.id;
        const orders= await OrderModel.find({studentID:id}).sort({createdAt:-1});
        return res.status(200).json({
            message:"Orders viewed successfully!",
            success: true,
            orders: orders,
        })   
    }
    catch (err){
        console.error("Error:", err);
        return res.status(500).json({
            message:"Could not view application. Internal Server Error.",
            success:false
        })
    }
}

const orderLog = async(req,res) => {
    try {
    const { category } = req.params; 
    let orders = await OrderModel.find({category, status: { $in: ['Accepted', 'Paid', 'Ready'] }}).populate('studentID', 'name role mobile').sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(200).json({
        message: "No orders logs today.",
        success: true,
        orders
      });
    }

    res.status(200).json({
      message: "Order logs viewed successfully.",
      success: true,
      orders:orders
    });
    } catch (error) {
    console.error("Order logs Error:", error);
    res.status(500).json({
      message: "Could not retrieve order logs. Internal Server Error",
      success: false,
    });
  }
}

module.exports = {
    getPendingOrders,
    requestOrder,
    changeOrderStatus,
    getPaidOrders,
    orderLog,
    viewMyOrders
};
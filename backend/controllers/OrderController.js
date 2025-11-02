const MenuItemModel = require("../models/menu");
const OrderModel = require("../models/orders");

const getPendingOrders=async(req,res)=>{
    try {
        const { category } = req.params;
        if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(category)) {
            return res.status(400).json({
                message: "Invalid category.",
                success: false
            });
        }
        let orders = await OrderModel.find({ "status": "Pending", "category": category });
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
const placeOrder= async (req,res)=>{
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

    } catch (err) {
        console.error("Create Order Error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
}

const getAccepted = async (req, res) => {
    try {
    const { category } = req.params; 
    const items = await OrderModel.find({category, status: 'Accepted' })
      .sort({ createdAt: -1 });

    if (items.length === 0) {
      return res.status(200).json({
        message: "No orders accepted today.",
        success: true,
        items
      });
    }

    res.status(200).json({
      message: "Accepted items viewed successfully.",
      success: true,
      items:items
    });
    } catch (error) {
    console.error("Accepted items Error:", error);
    res.status(500).json({
      message: "Could not retrieve accepted items. Internal Server Error",
      success: false,
    });
  }
}

const orderLog = async(req,res) => {
    try {
    const { category } = req.params; 
    const items = await OrderModel.find({category, status: { $in: ['Accepted', 'Ready'] }}).sort({ createdAt: -1 });

    if (items.length === 0) {
      return res.status(200).json({
        message: "No orders logs today.",
        success: true,
        items
      });
    }

    res.status(200).json({
      message: "Order logs viewed successfully.",
      success: true,
      items:items
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
    placeOrder,
    getAccepted,
    orderLog
};
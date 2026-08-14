const MenuItemModel = require("../models/menu");
const OrderModel = require("../models/orders");
const { emitToMenuSubscribers } = require("../socket/socketEmitter");

const addMenuItem = async (req, res) => {
    try {
        const {category, name, price}=req.body;
        if (price === undefined || price === null || price === '' || isNaN(price) || price < 0) {
            return res.status(400).json({
                message: 'A valid price is required.',
                success: false
            });
        }
        const menuItem=await MenuItemModel.findOne({category, name});
        if(menuItem){
            return res.status(409).json({
                message: `"${name}" already exists in the "${category}" category.`,
                success:false
            })
        }
        const status='Unavailable';
        const MenuItem = new MenuItemModel({
            category,
            name,
            status,
            price
        })
        await MenuItem.save();
        res.status(201).json({
            message:"Menu item added successfully.",
            success:true
        })

        emitToMenuSubscribers('menu:updated', { category, item: MenuItem, action: 'added' });
    } catch (error) {
        console.error("Menu Error:", error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

const deleteMenuItem = async (req, res) => {
    try {
        const {id}=req.params;
        const deletedMenu = await MenuItemModel.findByIdAndDelete(id);
        if (!deletedMenu) {
            return res.status(404).json({
                message:"No Menu item found with that id.",
                success:false
            });
        }
       
        res.status(200).json({
            message: 'Menu Deleted!',
            success: true
        });

        emitToMenuSubscribers('menu:updated', { category: deletedMenu.category, item: deletedMenu, action: 'deleted' });
    } catch (error) {
        console.error("Delete Menu Error:", error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

const changeItemStatus = async(req,res)=>{
    try{
        const {id}=req.params;
        const {status:newStatus}=req.body;
        if (!['Available', 'Unavailable'].includes(newStatus)) 
            {
                return res.status(400).json({ //Bad request
                    message: 'Invalid status.',
                    success: false 
                });
            }
        let item = await MenuItemModel.findById(id);
        if (!item) {
            return res.status(404).json({
                message: "Menu item not found for this ID.",
                success: false
            });
        }
        item.status=newStatus;
        await item.save();
        res.status(200).json({
            message:`Status changed successfully to ${newStatus}.`,
            success:true
        });

        emitToMenuSubscribers('menu:updated', { category: item.category, item, action: 'status-changed' });
        return;
    }
    catch(err){
        console.error("Change Status Error:", err);
        res.status(500).json({
            message:"Internal Server Error. Could not change status.",
            success:false,
        })        
    }
}


const viewAbsentees = async (req, res) => {
    try {
        // Logic to find all absentees (e.g., for the current week)
        // const absentees = await Absence.find({ date: { $gte: new Date() } }).populate('user', 'name username');

        res.status(200).json({
            message: 'Absentees list retrieved successfully.',
            success: true,
            absentees: [] // You would send the 'absentees' array here
        });
    } catch (error) {
        console.error("View Absentees Error:", error);
        res.status(500).json({ 
            message: 'could not retrive absentees',
            success: false 
        });
    }
}

const getMenuByCategory = async (req, res) => {
  try {
    const { category } = req.params; // e.g., /menu/breakfast
    const items = await MenuItemModel.find({ category, status: 'Available' })
      .sort({ createdAt: -1 });

    if (items.length === 0) {
      return res.status(200).json({
        message: `No ${category} available today.`,
        success: true,
        items
      });
    }

    res.status(200).json({
      message: "Menu items viewed successfully.",
      success: true,
      items:items
    });
    } catch (error) {
    console.error(`${category} menu items Error:`, error);
    res.status(500).json({
      message: `Could not retrieve ${category} menu items. Internal Server Error`,
      success: false,
    });
  }
};

const getUnavailableItems = async (req, res) => {
  try {
    const { category } = req.params; 
    const items = await MenuItemModel.find({ category, status: 'Unavailable' })
      .sort({ createdAt: -1 });

    if (items.length === 0) {
      return res.status(200).json({
        message: `All items are available in ${category} today.`,
        success: true,
        items:items
      });
    }

    res.status(200).json({
      message: "Menu items viewed successfully.",
      success: true,
      items:items
    });
    } catch (error) {
    console.error(`${category} menu items Error:`, error);
    res.status(500).json({
      message: `Could not retrieve ${category} menu items. Internal Server Error`,
      success: false,
    });
  }
};


module.exports = {
    viewAbsentees,
    addMenuItem,
    changeItemStatus,
    deleteMenuItem,
    getMenuByCategory,
    getUnavailableItems
};
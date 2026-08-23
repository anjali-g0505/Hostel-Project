const ApplicationModel = require("../models/Application");
const MenuItemModel = require("../models/menu");
const OrderModel = require("../models/orders");

const nightoutForm = async(req,res)=>{
    try{
        console.log('Form filled by user:', req.user.username);
        const {mis, fromDate, toDate, parentName, parentMobile, room, address}=req.body;
        const studentID=req.user.id;
        const status='Pending';
        const wardenRemark="";
        const newApplication = new ApplicationModel({
                    studentID,
                    mis,
                    fromDate,
                    toDate,
                    parentName,
                    parentMobile,
                    room,
                    address,
                    status,
                    wardenRemark
                });
        console.log("Application created");
        await newApplication.save();
        res.status(201).json({ //created
                message:`Night-out form for user ${req.user.username} submitted!`,
                success:true
            })
    }
    catch(error){
        console.error("Could not create Application:", error); 
        console.log("Error", error);
        res.status(500).json({ //Internal Server Error
            message:'Internal Server Error',
            success:false
        })           
    }    
}
const markAbsenteeInMess=(req,res)=>{
    res.status(200).json({ 
            message:'Absentee marked successfully',
            success:true
        })
}

// const getMenu=async (req,res)=>{

// }

// const placeOrder=async (req,res)=>{

// }


const viewApplication = async (req,res)=>{
    try{
        const id = req.user.id;
        const application = await ApplicationModel.find({studentID:id}).sort({createdAt:-1});
        // if(application.length==0){  //we take care of this on client-side
        //     return res.status(200).json({
        //         message:"You have not submitted any applications yet.",
        //         success:true,
        //         application:[]
        //     })
        // }
        return res.status(200).json({
            message:"Application viewed successfully!",
            success:true,
            application:application
        })
    }
    catch(err){
        console.error("Error:", err);
        return res.status(500).json({
            message:"Could not view application. Internal Server Error.",
            success:false
        })
    }
}


const viewMenu=(req,res)=>{
    try {
        res.status(200).json({
            message:'Menu viewed successfully.',
            success:true,
            menu:[]
        })
            
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({
            message:'Could not retrieve data',
            success:false
        })            
    }

}

module.exports={
    nightoutForm,
    markAbsenteeInMess,
    viewMenu,
    viewApplication,
}
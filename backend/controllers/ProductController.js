const instance = require("../razorpayConfig.js");
require('dotenv').config();

const processPayment=async(req,res)=>{
    const options={
        amount:Number(req.body.amount*100),
        currency:"INR"
    }
    const order=await instance.orders.create(options);
    return res.status(200).json({
        success:true,
        message:"Order created successfully.",
        order:order
    })
}
const getKey=async(req,res)=>{
    res.status(200).json({
        key:process.env.RAZORPAY_API_KEY,
        success:true,
        message:"Key recieved successfully."
    })
}

module.exports={
    processPayment,
    getKey
};
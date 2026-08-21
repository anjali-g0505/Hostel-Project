//to handle the actual signup flow
const UserModel=require("../models/User");
const OtpModel=require("../models/Otp");
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/sendEmail');

const otp_ttl = 3 * 60 * 1000; // 3 minutes

const signup = async (req,res)=>{
    try {
        console.log(req.body);  
        const {name, username, email, mobile, password, role} = req.body;
        const normalizedUsername = username.toLowerCase();
        const normalizedEmail = email.toLowerCase();

        const existingUser = await UserModel.findOne({
            $or: [{ email: normalizedEmail }, { username: normalizedUsername }, { mobile }]
        });

        if (existingUser) {
            if (existingUser.email === normalizedEmail) {
                return res.status(409).json({ message: 'User with that email id already exists', success: false }); 
            }
            if (existingUser.username === normalizedUsername) {
                return res.status(409).json({ message: 'Username already exists', success: false }); 
            }
            if (existingUser.mobile === mobile) {
                return res.status(409).json({ message: 'Phone number already exists', success: false }); 
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({
            name,
            username,
            email,
            mobile,
            password: hashedPassword, // Save the hashed password
            role,
            isVerified: false
        });

        try {
            await newUser.save();
        } catch (saveErr) {
            // Safety net in case two signups race past the $or check above and both
            // reach save() - Mongo's unique indexes are the real source of truth here.
            if (saveErr.code === 11000) {
                const field = Object.keys(saveErr.keyPattern || {})[0];
                const duplicateFieldMessages = {
                    email: 'User with that email id already exists',
                    username: 'Username already exists',
                    mobile: 'Phone number already exists'
                };
                return res.status(409).json({
                    message: duplicateFieldMessages[field] || 'User already exists',
                    success: false
                });
            }
            throw saveErr;
        }

        // No OTP/email here by design - the frontend triggers /send-otp itself right
        // after this succeeds, and that's the same endpoint the "Resend code" button uses.
        res.status(201).json({ //created
            success: true,
            message: 'Signup successful. Please verify your email.',
            email: newUser.email
        })

    } catch (error) {
        console.error("Signup Error:", error);
        console.log("Errorrr", error);
        res.status(500).json({ //Internal Server Error
            message:'Internal Server Error',
            success:false
        })
    }
}

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = (email || '').trim().toLowerCase();

        const user = await UserModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with that email.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'This account is already verified.' });
        }

        // Invalidates any previously issued code - only the freshest OTP is ever valid.
        await OtpModel.deleteMany({ userId: user._id, purpose: 'signup' });

        const otp = crypto.randomInt(100000, 1000000).toString(); // 6-digit otp
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + otp_ttl);

        await OtpModel.create({
            userId: user._id,
            otpHash,
            purpose: 'signup',
            attempts: 0,
            expiresAt
        });

        try {
            await sendEmail({
                to: user.email,
                subject: 'Verify your account',
                text: `Your verification code is ${otp}. It expires in 3 minutes.`,
                html: `<p>Your verification code is <strong>${otp}</strong>. It expires in 3 minutes.</p>`
            });
        } catch (emailErr) {
            console.error("Send OTP email failed:", emailErr);
            return res.status(500).json({ success: false, message: 'Could not send verification email. Please try again.' });
        }

        return res.status(200).json({ success: true, expiresAt }); //only sends back expiresAt

    } catch (error) {
        console.error("Send OTP Error:", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error. Could not send OTP.' });
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const normalizedEmail = (email || '').trim().toLowerCase();

        const user = await UserModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with that email.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'This account is already verified.' });
        }

        const otpDoc = await OtpModel.findOne({ userId: user._id, purpose: 'signup' });
        if (!otpDoc) {
            return res.status(400).json({ success: false, message: 'No verification code found. Please request a new code.' });
        }

        if (Date.now() > otpDoc.expiresAt.getTime()) {
            await OtpModel.deleteOne({ _id: otpDoc._id });
            return res.status(410).json({ success: false, message: 'This code has expired. Please request a new code.' }); //Gone
        }

        if (otpDoc.attempts >= 5) {
            await OtpModel.deleteOne({ _id: otpDoc._id });
            return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new code.' });
        }

        const isMatch = await bcrypt.compare(otp || '', otpDoc.otpHash);
        if (!isMatch) {
            otpDoc.attempts += 1;
            await otpDoc.save();
            const attemptsRemaining = 5 - otpDoc.attempts;
            return res.status(400).json({
                success: false,
                message: `Incorrect code. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining.`,
                attemptsRemaining
            });
        }

        user.isVerified = true;
        await user.save();
        await OtpModel.deleteOne({ _id: otpDoc._id });

        return res.status(200).json({ success: true, message: 'User has been verified, please login.' });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error. Could not verify OTP.' });
    }
}

const login = async (req,res)=>{
    try {
        // console.log(req.body);  
        const {username, password} = req.body;
        const user=await UserModel.findOne({username: username.toLowerCase()});
        if(!user){
            return res.status(401).json({message: 'User doesn\'t exist, please signup.', success: false});//unauthorized
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(403).json({ message: 'Invalid username or password', success: false });//forbidden
        }
        const payload={
            id: user._id,
            username: user.username,
            role: user.role          
        }
        const jwtToken=jwt.sign( //so that the user doesn't need to prove their identity on every request
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        )
        res.status(200).json({ //OK
            message:'Login Successful',
            success:true,
            jwtToken,
            username,
            name:user.name,
            role:user.role
        })
        
    } catch (error) {
        console.error("Signup Error:", error); 
        res.status(500).json({ //Internal Server Error
            message:'Internal Server Error',
            success:false
        })        
    }
}

module.exports={
    signup,login,sendOtp,verifyOtp
}
const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,         // Removes whitespace from ends
        minlength: 2
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,  
        minlength: 3
    },
    email: {
        type: String,
        required: true,   
        unique: true,
        trim: true,
        lowercase: true,
        // Basic regex to check for valid email format
        match: [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    mobile: {
        type: String,       // Stored as String to keep leading zeros
        required: true,
        unique: true,
        trim: true,
        // Example: Validates a 10-digit Indian mobile number
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number']
    },
    password: {
        type: String,
        required: true,
        minlength: 6       
    },
    role: {
        type: String,
        required: true,
        // Restricts the 'role' field to only these values
        enum: ['student', 'mess', 'warden'],
        default: 'student'  // Automatically sets new users to 'student'
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt' fields

// Auto-deletes unverified accounts 24h after creation; verified accounts are excluded
// once isVerified flips to true, since they no longer match the partial filter.
UserSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 86400, partialFilterExpression: { isVerified: false } }
);

const UserModel=mongoose.model('User', UserSchema); //Creates a collection
module.exports = UserModel;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MenuItemSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['breakfast', 'lunch', 'snacks', 'dinner']
    },
    status: {
        type: String,
        required: true,
        enum: ['Available', 'Unavailable'],
        default: 'Unavailable' 
    },
    price: {
        type: Number,     
        required: true,  
        default: null     
    }
}, { timestamps: true });

MenuItemSchema.index({ name: 1, category: 1 }, { unique: true });//to prevent the same name from being in the same category

const MenuItemModel = mongoose.model('MenuItem', MenuItemSchema);
module.exports = MenuItemModel;
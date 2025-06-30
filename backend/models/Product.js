// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true // Products should ideally have unique names or unique IDs
    },
    image: {
        type: String, // Path to the image file (e.g., 'image/product1.jpg')
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    // You can add more fields like category, weight, etc.
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps automatically

// THIS IS THE CRUCIAL PART: Export the Mongoose Model
module.exports = mongoose.model('Product', productSchema);
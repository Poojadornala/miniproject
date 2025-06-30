// backend/models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    templeId: {
        type: String,
        required: true,
        ref: 'Temple' // This is for logical reference, actual type is String
    },
    userId: { // This will store the user's ID from the JWT payload
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // THIS IS THE CRITICAL LINE: It MUST be 'userName'
    userName: { // <--- ENSURE THIS IS 'userName' (camelCase)
        type: String,
        required: true
    },
    review: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Review', ReviewSchema);
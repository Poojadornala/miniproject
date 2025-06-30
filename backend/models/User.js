// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Don't forget to require bcryptjs

const userSchema = new mongoose.Schema({
    // User's display name or unique handle
    username: {
        type: String,
        required: true,
        unique: true, // Ensures each username is unique
        trim: true // Removes whitespace from both ends of a string
    },
    // User's email, typically used for login and notifications
    email: {
        type: String,
        required: true,
        unique: true, // Ensures each email is unique
        trim: true,
        lowercase: true // Stores emails in lowercase for consistent lookup
    },
    // User's full name (optional, if you want it distinct from username)
    name: {
        type: String,
        required: true, // Assuming name is always required for registration
        trim: true
    },
    // Hashed password for security
    password: {
        type: String,
        required: true,
    },
    // Timestamp for when the user was created
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to hash the password before saving the user document
// 'pre' hook runs before a 'save' event
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        // Generate a salt with 10 rounds
        const salt = await bcrypt.genSalt(10);
        // Hash the password using the generated salt
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Proceed to save the user
    } catch (error) {
        next(error); // Pass any error to the next middleware
    }
});

module.exports = mongoose.model('User', userSchema);
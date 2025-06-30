// backend/server.js - Combined Backend

// --- 1. Import necessary modules ---
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./db'); // Database connection utility
require('dotenv').config(); // Load environment variables from .env file

// --- Import Mongoose Models (Ensure these paths are correct relative to server.js) ---
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Temple = require('./models/Temple');
const Review = require('./models/Review');
const State = require('./models/State');

// --- 2. Initialize Express App ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- 3. Connect to Database ---
connectDB(); // Call the centralized database connection function

// --- 4. Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable parsing of JSON request bodies

// Serve static files from the 'frontend' directory (for your shopping app)
app.use(express.static('frontend'));
// Serve static files from the 'public' directory (for other general assets like temple pages)
app.use(express.static('public'));

// --- 5. JWT Authentication Middleware (Unified) ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// --- 6. TEMPORARY: Populate Products Function (RUN ONCE, THEN REMOVE OR COMMENT OUT) ---
async function populateProducts() {
    try {
        const existingProducts = await Product.countDocuments();
        if (existingProducts === 0) {
            console.log('Populating products...');
            const productsToInsert = [
                { name: 'Krishna Idol (Brass)', image: 'image/product1.jpg', price: 1200, description: "Exquisite brass idol of Lord Krishna, perfect for home altar.", stock: 50 },
                { name: 'Bhagavad Gita (Hardcover)', image: 'image/product2.jpg', price: 450, description: "A beautiful hardcover edition of the Bhagavad Gita.", stock: 100 },
                { name: 'Krishna\'s Flute', image: 'image/product3.jpg', price: 300, description: "Hand-carved bamboo flute, symbolic of Lord Krishna.", stock: 75 }
            ];
            await Product.insertMany(productsToInsert);
            console.log('Products populated successfully!');
        } else {
            console.log('Products already exist in the database. Skipping population.');
        }
    } catch (error) {
        console.error('Error populating products:', error);
    }
}
// Uncomment the line below to run `populateProducts()` once on server start for initial data.
// REMEMBER TO COMMENT IT OUT OR REMOVE IT AFTER THE FIRST SUCCESSFUL RUN!
// populateProducts();

// --- 7. API Routes ---

// --- User Authentication Routes ---
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        let userExistsByEmail = await User.findOne({ email });
        if (userExistsByEmail) {
            return res.status(409).json({ message: 'Email is already registered.' });
        }
        let userExistsByUsername = await User.findOne({ username });
        if (userExistsByUsername) {
            return res.status(409).json({ message: 'Username is already taken.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'Account created successfully! You can now log in.' });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'Server error during registration. Please try again.' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful!',
            token,
            userId: user._id,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login. Please try again.' });
    }
});

app.get('/api/user/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Product Routes ---
app.get('/api/products', async (req, res) => {
    console.log('[PRODUCTS API] Received request for /api/products'); // Added log
    try {
        const products = await Product.find();
        console.log(`[PRODUCTS API] Found ${products.length} products.`); // Added log
        res.json(products);
    } catch (err) {
        console.error('[PRODUCTS API] Error fetching products:', err); // Log the full error object
        res.status(500).json({ message: 'Error retrieving products. Please check server logs for details.' });
    }
});

// --- Order Routes (Requires Authentication) ---
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { items, totalAmount, customerInfo, paymentMethod, paymentStatus } = req.body;
        const userId = req.user.id;

        if (!customerInfo || !customerInfo.fullName || !customerInfo.email || !customerInfo.phone || !customerInfo.address ||
            !customerInfo.address.street || !customerInfo.address.city || !customerInfo.address.state || !customerInfo.address.zipCode ||
            !paymentMethod) {
            return res.status(400).json({ message: 'Missing required customer or payment information.' });
        }
        if (!['Cash On Delivery', 'Online Payment'].includes(paymentMethod)) {
            return res.status(400).json({ message: 'Invalid payment method.' });
        }

        for (let item of items) {
            const product = await Product.findById(item.productId);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ message: `Product "${item.productName}" is out of stock or not found.` });
            }
        }

        const newOrder = new Order({
            userId,
            items,
            totalAmount,
            status: 'Pending',
            customerInfo,
            paymentMethod,
            paymentStatus: paymentStatus
        });

        await newOrder.save();
        res.status(201).json({ message: 'Order created successfully', orderId: newOrder._id });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Internal server error: ' + err.message });
    }
});

app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId }).sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        console.error('Error fetching user orders:', err);
        res.status(500).json({ message: 'Failed to retrieve user orders.' });
    }
});

// --- Temple & State Data Routes ---
app.get('/api/states/:stateId', async (req, res) => {
    try {
        const { stateId } = req.params;
        const uppercaseStateId = stateId.toUpperCase();

        console.log(`[STATE API] Received request for stateId from frontend: "${stateId}"`);
        console.log(`[STATE API] Attempting to find state in DB using stateId: "${uppercaseStateId}"`);

        const stateData = await State.findOne({ stateId: uppercaseStateId });

        // Log the result of the query
        if (stateData) {
            console.log(`[STATE API] State "${uppercaseStateId}" found:`, stateData.name);
        } else {
            console.log(`[STATE API] State "${uppercaseStateId}" NOT FOUND in database.`);
        }

        if (!stateData) {
            return res.status(404).json({ message: 'State data not found' });
        }

        const responseData = {
            stateId: stateData.stateId,
            stateName: stateData.name,
            description: stateData.description,
            // Ensure famousPlaces exists and has elements before accessing imageUrl
            imageUrl: stateData.famousPlaces && stateData.famousPlaces.length > 0 ? stateData.famousPlaces[0].imageUrl : '',
            // If 'capital' or 'climate' are not in your schema or data, they will be 'undefined'
            // in the response, which JavaScript handles gracefully.
            capital: stateData.capital,
            famousPlaces: stateData.famousPlaces,
            climate: stateData.log
        };
        res.json(responseData);
    } catch (error) {
        console.error('[STATE API] Error fetching state data:', error); // Log the full error object
        res.status(500).json({ message: 'Server error: Could not fetch state details.' });
    }
});

app.get('/api/temples/:templeId', async (req, res) => {
    const { templeId } = req.params;
    console.log(`[TEMPLE API] Received GET request for /api/temples/${templeId}`);
    try {
        const temple = await Temple.findOne({ templeId: templeId });
        if (!temple) {
            console.log(`[TEMPLE API] Temple not found for templeId: ${templeId}`);
            return res.status(404).json({ message: 'Temple not found' });
        }
        console.log(`[TEMPLE API] Successfully fetched temple: ${temple.name}`);
        res.json(temple);
    } catch (error) {
        console.error(`[TEMPLE API] Error fetching temple (${templeId}):`, error); // Log the full error object
        res.status(500).json({ message: 'Server error: Could not fetch temple details.' });
    }
});

// --- Review Routes ---
app.get('/api/reviews/:templeId', async (req, res) => {
    try {
        const reviews = await Review.find({ templeId: req.params.templeId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/reviews', authenticateToken, async (req, res) => {
    const { templeId, review } = req.body;
    try {
        const userId = req.user.id;
        const userName = req.user.username;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newReview = new Review({ templeId, userId: userId, userName: userName, review });
        const savedReview = await newReview.save();
        res.status(201).json(savedReview);
    } catch (error) {
        console.error('Error adding review:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/reviews/:reviewId', authenticateToken, async (req, res) => {
    const { review } = req.body;
    try {
        const reviewToUpdate = await Review.findById(req.params.reviewId);
        if (!reviewToUpdate) return res.status(404).json({ message: 'Review not found' });
        if (reviewToUpdate.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this review' });
        }
        reviewToUpdate.review = review;
        await reviewToUpdate.save();
        res.json(reviewToUpdate);
    } catch (error) {
        console.error('Error updating review:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/reviews/:reviewId', authenticateToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this review' });
        }
        await review.deleteOne();
        res.json({ message: 'Review removed' });
    } catch (error) {
        console.error('Error deleting review:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- 8. Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
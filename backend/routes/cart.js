const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// Middleware to get user from token (simplified)
const getUser = (req, res, next) => {
  req.userId = req.headers['x-user-id']; // or decode from JWT/Firebase
  next();
};

// POST /api/cart/add
router.post('/add', getUser, async (req, res) => {
  const { productId } = req.body;
  const userId = req.userId;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, products: [] });
  }

  const existing = cart.products.find(p => p.productId.equals(productId));
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.products.push({ productId });
  }

  await cart.save();
  res.json({ success: true });
});

module.exports = router;

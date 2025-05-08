const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// Use your real keys in production
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/verify', async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userId } = req.body;
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !userId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    // Mark user as premium in your DB
    try {
      await User.findByIdAndUpdate(userId, { premium: true });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'User update failed' });
    }
  } else {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }
});

module.exports = router; 
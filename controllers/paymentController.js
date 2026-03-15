const Razorpay = require('razorpay');
const crypto   = require('crypto');
const db       = require('../config/db');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-order
// Creates a Razorpay order before checkout
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    const options = {
      amount:   Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt:  'receipt_' + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json({
      success:  true,
      order_id: order.id,
      amount:   order.amount,
      currency: order.currency,
      key_id:   process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payment/verify
// Verifies Razorpay signature after payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expected  = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    const isValid   = expected === razorpay_signature;

    if (!isValid) return res.status(400).json({ success: false, message: 'Payment verification failed.' });

    // Mark order as paid
    await db.execute(
      'UPDATE orders SET payment_status=?, razorpay_payment_id=?, status=? WHERE id=?',
      ['paid', razorpay_payment_id, 'confirmed', order_id]
    );

    res.json({ success: true, message: 'Payment verified successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payment/cod-confirm  (Cash on Delivery)
exports.confirmCOD = async (req, res) => {
  try {
    const { order_id } = req.body;
    await db.execute(
      'UPDATE orders SET payment_status=?, status=? WHERE id=? AND user_id=?',
      ['pending', 'confirmed', order_id, req.user.id]
    );
    res.json({ success: true, message: 'Cash on Delivery order confirmed!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── orders.js ──────────────────────────────────
const express = require('express');
const oc      = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const orderRouter = express.Router();
orderRouter.post('/',               protect,              oc.createOrder);
orderRouter.get('/',                protect,              oc.getMyOrders);
orderRouter.get('/admin/all',       protect, adminOnly,   oc.getAllOrders);
orderRouter.get('/:id',             protect,              oc.getOrder);
orderRouter.put('/:id/status',      protect, adminOnly,   oc.updateOrderStatus);
orderRouter.put('/:id/cancel',      protect,              oc.cancelOrder);

// ── payment.js ─────────────────────────────────
const pc = require('../controllers/paymentController');
const payRouter = express.Router();
payRouter.post('/create-order',     protect, pc.createRazorpayOrder);
payRouter.post('/verify',           protect, pc.verifyPayment);
payRouter.post('/cod-confirm',      protect, pc.confirmCOD);

// ── addresses.js ───────────────────────────────
const ac = require('../controllers/addressController');
const addrRouter = express.Router();
addrRouter.get('/',         protect, ac.getAddresses);
addrRouter.post('/',        protect, ac.addAddress);
addrRouter.put('/:id',      protect, ac.updateAddress);
addrRouter.delete('/:id',   protect, ac.deleteAddress);

// ── admin.js ───────────────────────────────────
const adm = require('../controllers/adminController');
const adminRouter = express.Router();
adminRouter.get('/dashboard',  protect, adminOnly, adm.getDashboard);
adminRouter.get('/users',      protect, adminOnly, adm.getUsers);

module.exports = { orderRouter, payRouter, addrRouter, adminRouter };

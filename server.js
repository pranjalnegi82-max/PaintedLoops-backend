const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
dotenv.config();

const app = express();

// ── Middleware ─────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ── Routes ─────────────────────────────────────
const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const { orderRouter, payRouter, addrRouter, adminRouter } = require('./routes/index');

app.use('/api/auth',      authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRouter);
app.use('/api/payment',   payRouter);
app.use('/api/addresses', addrRouter);
app.use('/api/admin',     adminRouter);

// ── Health check ───────────────────────────────
app.get('/', (req, res) => res.json({
  success: true,
  message: '🌸 PaintedLoops API is running!',
  version: '1.0.0',
  endpoints: {
    auth:     '/api/auth',
    products: '/api/products',
    orders:   '/api/orders',
    payment:  '/api/payment',
    addresses:'/api/addresses',
    admin:    '/api/admin',
  }
}));

// ── 404 handler ────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` }));

// ── Global error handler ───────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

// ── Start ──────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌸 PaintedLoops Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

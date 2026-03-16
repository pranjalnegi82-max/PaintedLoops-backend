const db       = require('../config/db');
const mailer   = require('../utils/mailer');
const whatsapp = require('../utils/whatsapp');

const genOrderNumber = () => 'PL-' + Date.now().toString().slice(-6) + Math.floor(Math.random()*100);

// POST /api/orders  (protected)
exports.createOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { address_id, items, payment_method, razorpay_order_id } = req.body;

    if (!items?.length) return res.status(400).json({ success: false, message: 'No items in order.' });

    // Validate stock & calculate totals
    let subtotal = 0;
    for (const item of items) {
      const [[p]] = await conn.execute('SELECT id,name,price,stock FROM products WHERE id=? AND is_active=1', [item.product_id]);
      if (!p) throw new Error(`Product ${item.product_id} not found.`);
      if (p.stock < item.quantity) throw new Error(`"${p.name}" has only ${p.stock} items in stock.`);
      item._price = p.price;
      item._name  = p.name;
      subtotal += p.price * item.quantity;
    }

    const shipping = payment_method === 'cod' ? 50 : 50;
    const total    = subtotal + shipping;
    const order_number = genOrderNumber();

    const [orderResult] = await conn.execute(
      `INSERT INTO orders (order_number,user_id,address_id,subtotal,shipping_charge,total_amount,payment_method,razorpay_order_id)
       VALUES (?,?,?,?,?,?,?,?)`,
      [order_number, req.user.id, address_id, subtotal, shipping, total, payment_method, razorpay_order_id||null]
    );
    const order_id = orderResult.insertId;

    // Insert order items & deduct stock
    for (const item of items) {
      await conn.execute(
        'INSERT INTO order_items (order_id,product_id,product_name,price,quantity,subtotal) VALUES (?,?,?,?,?,?)',
        [order_id, item.product_id, item._name, item._price, item.quantity, item._price * item.quantity]
      );
      await conn.execute('UPDATE products SET stock=stock-? WHERE id=?', [item.quantity, item.product_id]);
    }

    await conn.commit();

    // Send confirmation email (non-blocking)
    const [[user]] = await db.execute('SELECT email,first_name,last_name FROM users WHERE id=?', [req.user.id]);
    mailer.sendOrderConfirmation(user.email, user.first_name, order_number, total).catch(()=>{});

    // Notify shop owner about new order
    const customerName = `${user.first_name} ${user.last_name}`;
    mailer.sendOwnerNotification(order_number, total, customerName, user.email, items).catch(()=>{});

    // WhatsApp notification to owner
    whatsapp.sendOrderWhatsApp(order_number, customerName, user.email, total, items).catch(()=>{});

    res.status(201).json({ success: true, message: 'Order placed!', order_number, order_id, total });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

// GET /api/orders  (protected — own orders)
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*, COUNT(oi.id) AS item_count
       FROM orders o LEFT JOIN order_items oi ON o.id=oi.order_id
       WHERE o.user_id=? GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id  (protected)
exports.getOrder = async (req, res) => {
  try {
    const [[order]] = await db.execute('SELECT * FROM orders WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    const [items] = await db.execute('SELECT * FROM order_items WHERE order_id=?', [order.id]);
    res.json({ success: true, order: { ...order, items } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/admin/all  (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = []; let params = [];
    if (status) { where.push('o.status=?'); params.push(status); }
    const cond = where.length ? 'WHERE ' + where.join(' AND ') : '';
const limitNum = Number(limit);
const offsetNum = Number(offset);
const [orders] = await db.execute(
  `SELECT o.*, u.first_name, u.last_name, u.email FROM orders o JOIN users u ON o.user_id=u.id ${cond} ORDER BY o.created_at DESC LIMIT ${limitNum} OFFSET ${offsetNum}`,
  params
);
res.json({ success: true, orders });
    
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/status  (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await db.execute('UPDATE orders SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ success: true, message: `Order status updated to "${status}".` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/cancel  (protected — customer cancels own order)
exports.cancelOrder = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch order and verify ownership
    const [[order]] = await conn.execute(
      'SELECT * FROM orders WHERE id=? AND user_id=?',
      [req.params.id, req.user.id]
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Only allow cancel if pending or confirmed
    const cancellable = ['pending', 'confirmed'];
    if (!cancellable.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: "${order.status}". Only pending or confirmed orders can be cancelled.`
      });
    }

    // Update order status to cancelled
    await conn.execute(
      'UPDATE orders SET status=? WHERE id=?',
      ['cancelled', order.id]
    );

    // Restore stock for each item
    const [items] = await conn.execute(
      'SELECT product_id, quantity FROM order_items WHERE order_id=?',
      [order.id]
    );
    for (const item of items) {
      await conn.execute(
        'UPDATE products SET stock=stock+? WHERE id=?',
        [item.quantity, item.product_id]
      );
    }

    await conn.commit();

    // Notify owner (non-blocking)
    const [[user]] = await db.execute('SELECT email, first_name FROM users WHERE id=?', [req.user.id]);
    mailer.sendCancellationNotification(
      order.order_number,
      user.first_name,
      user.email,
      order.total_amount
    ).catch(() => {});

    // WhatsApp cancellation alert to owner
    whatsapp.sendCancelWhatsApp(order.order_number, user.first_name, order.total_amount).catch(() => {});

    res.json({ success: true, message: 'Order cancelled successfully. Stock has been restored.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

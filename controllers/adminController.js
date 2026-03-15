const db = require('../config/db');

// GET /api/admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [[{ total_orders }]]   = await db.execute('SELECT COUNT(*) AS total_orders FROM orders');
    const [[{ total_revenue }]]  = await db.execute("SELECT COALESCE(SUM(total_amount),0) AS total_revenue FROM orders WHERE payment_status='paid'");
    const [[{ total_customers }]]= await db.execute("SELECT COUNT(*) AS total_customers FROM users WHERE role='customer'");
    const [[{ total_products }]] = await db.execute('SELECT COUNT(*) AS total_products FROM products WHERE is_active=1');
    const [[{ pending_orders }]] = await db.execute("SELECT COUNT(*) AS pending_orders FROM orders WHERE status='pending'");
    const [recent_orders]        = await db.execute(
      `SELECT o.order_number, o.total_amount, o.status, o.created_at, u.first_name, u.last_name
       FROM orders o JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC LIMIT 5`
    );
    const [top_products] = await db.execute(
      `SELECT p.name, SUM(oi.quantity) AS units_sold, SUM(oi.subtotal) AS revenue
       FROM order_items oi JOIN products p ON oi.product_id=p.id
       GROUP BY p.id ORDER BY units_sold DESC LIMIT 5`
    );

    res.json({
      success: true,
      stats: { total_orders, total_revenue, total_customers, total_products, pending_orders },
      recent_orders,
      top_products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id,first_name,last_name,email,phone,role,is_verified,created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

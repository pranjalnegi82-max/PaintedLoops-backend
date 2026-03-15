const db = require('../config/db');

// GET /api/addresses
exports.getAddresses = async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM addresses WHERE user_id=? ORDER BY is_default DESC', [req.user.id]);
  res.json({ success: true, addresses: rows });
};

// POST /api/addresses
exports.addAddress = async (req, res) => {
  try {
    const { full_name, phone, address_line1, address_line2, city, state, pin_code, address_type, is_default } = req.body;
    if (is_default) await db.execute('UPDATE addresses SET is_default=0 WHERE user_id=?', [req.user.id]);
    const [r] = await db.execute(
      'INSERT INTO addresses (user_id,full_name,phone,address_line1,address_line2,city,state,pin_code,address_type,is_default) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [req.user.id, full_name, phone, address_line1, address_line2||null, city, state, pin_code, address_type||'home', is_default?1:0]
    );
    res.status(201).json({ success: true, message: 'Address saved.', id: r.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/addresses/:id
exports.updateAddress = async (req, res) => {
  try {
    const { full_name, phone, address_line1, address_line2, city, state, pin_code, address_type, is_default } = req.body;
    if (is_default) await db.execute('UPDATE addresses SET is_default=0 WHERE user_id=?', [req.user.id]);
    await db.execute(
      'UPDATE addresses SET full_name=?,phone=?,address_line1=?,address_line2=?,city=?,state=?,pin_code=?,address_type=?,is_default=? WHERE id=? AND user_id=?',
      [full_name, phone, address_line1, address_line2||null, city, state, pin_code, address_type, is_default?1:0, req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Address updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/addresses/:id
exports.deleteAddress = async (req, res) => {
  try {
    await db.execute('DELETE FROM addresses WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Address deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

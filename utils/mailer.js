const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Send order confirmation to CUSTOMER ──────
exports.sendOrderConfirmation = async (email, name, orderNumber, total) => {
  await transporter.sendMail({
    from:    `"PaintedLoops 🌸" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: `Order Confirmed! #${orderNumber} — PaintedLoops`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#FDF6F0;border-radius:12px">
        <h2 style="color:#C8506A;font-family:Georgia,serif">PaintedLoops 🌸</h2>
        <h3>Hi ${name}, your order is confirmed! 🎉</h3>
        <p>Thank you for shopping with us. Your handcrafted items are being lovingly prepared.</p>
        <div style="background:#fff;border-radius:8px;padding:16px;margin:20px 0">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Total:</strong> ₹${total}</p>
        </div>
        <p style="color:#9A7A85;font-size:0.85rem">You will receive a shipping update once your order is dispatched.</p>
        <p>Made with ❤️ — PaintedLoops</p>
      </div>
    `,
  });
};

// ── Send new order alert to SHOP OWNER ───────
exports.sendOwnerNotification = async (orderNumber, total, customerName, customerEmail, items) => {
  const OWNER_EMAIL = process.env.OWNER_EMAIL || process.env.EMAIL_USER;

  const itemRows = items.map(i =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e0e0">${i.product_name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e0e0;text-align:center">${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e0e0;text-align:right">₹${i.subtotal}</td>
    </tr>`
  ).join('');

  await transporter.sendMail({
    from:    `"PaintedLoops 🌸" <${process.env.EMAIL_USER}>`,
    to:      OWNER_EMAIL,
    subject: `🛍️ New Order #${orderNumber} — ₹${total}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px;background:#FDF6F0;border-radius:12px">
        <h2 style="color:#C8506A;font-family:Georgia,serif">PaintedLoops 🌸 — New Order!</h2>
        <div style="background:#C8506A;color:#fff;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
          <div style="font-size:0.8rem;letter-spacing:2px;text-transform:uppercase;opacity:0.8">Order Number</div>
          <div style="font-size:1.6rem;font-weight:700;font-family:Georgia,serif">#${orderNumber}</div>
          <div style="font-size:1.2rem;margin-top:4px">₹${total}</div>
        </div>

        <h4 style="color:#9A7A85;margin:16px 0 8px">Customer Details</h4>
        <p><strong>Name:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>

        <h4 style="color:#9A7A85;margin:16px 0 8px">Items Ordered</h4>
        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden">
          <thead>
            <tr style="background:#F5E6E0">
              <th style="padding:10px 12px;text-align:left;font-size:0.8rem;color:#9A7A85">Product</th>
              <th style="padding:10px 12px;text-align:center;font-size:0.8rem;color:#9A7A85">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:0.8rem;color:#9A7A85">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <div style="text-align:right;margin-top:12px;font-size:1.1rem;font-weight:700;color:#2A1A20">
          Total: ₹${total}
        </div>

        <div style="margin-top:24px;padding:16px;background:#fff;border-radius:8px;border-left:4px solid #C8506A">
          <p style="margin:0;font-size:0.85rem;color:#9A7A85">
            Log in to your <strong>Admin Panel</strong> to update the order status and manage fulfillment.
          </p>
        </div>

        <p style="margin-top:20px;font-size:0.8rem;color:#9A7A85">PaintedLoops — Made with ❤️</p>
      </div>
    `,
  });
};

// ── Send cancellation confirmation to CUSTOMER & OWNER ──
exports.sendCancellationNotification = async (orderNumber, name, email, total) => {
  const OWNER_EMAIL = process.env.OWNER_EMAIL || process.env.EMAIL_USER;

  await transporter.sendMail({
    from:    `"PaintedLoops 🌸" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: `Order Cancelled — #${orderNumber} | PaintedLoops`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#FDF6F0;border-radius:12px">
        <h2 style="color:#C8506A;font-family:Georgia,serif">PaintedLoops 🌸</h2>
        <h3>Hi ${name}, your order has been cancelled.</h3>
        <div style="background:#fff;border-radius:8px;padding:16px;margin:20px 0">
          <p><strong>Order Number:</strong> #${orderNumber}</p>
          <p><strong>Amount:</strong> ₹${total}</p>
          <p><strong>Status:</strong> Cancelled</p>
        </div>
        <p style="color:#9A7A85;font-size:0.85rem">If you paid online, your refund will be processed within 5-7 business days.</p>
        <p>Made with ❤️ — PaintedLoops</p>
      </div>`,
  });

  await transporter.sendMail({
    from:    `"PaintedLoops 🌸" <${process.env.EMAIL_USER}>`,
    to:      OWNER_EMAIL,
    subject: `❌ Order Cancelled — #${orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#FDF6F0;border-radius:12px">
        <h2 style="color:#C8506A;font-family:Georgia,serif">PaintedLoops 🌸</h2>
        <h3>Order #${orderNumber} was cancelled by the customer.</h3>
        <div style="background:#fff;border-radius:8px;padding:16px;margin:20px 0">
          <p><strong>Customer:</strong> ${name} (${email})</p>
          <p><strong>Amount:</strong> ₹${total}</p>
        </div>
        <p style="color:#9A7A85;font-size:0.85rem">Stock has been automatically restored.</p>
      </div>`,
  });
};

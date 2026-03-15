const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ── Send new order notification to shop owner ──
exports.sendOrderWhatsApp = async (orderNumber, customerName, customerEmail, total, items) => {
  const itemList = items.map(i => `  • ${i._name || i.product_name} × ${i.quantity} = ₹${i._price * i.quantity || i.subtotal}`).join('\n');

  const message = `🌸 *PaintedLoops — New Order!*

📦 *Order:* #${orderNumber}
👤 *Customer:* ${customerName}
📧 *Email:* ${customerEmail}
💰 *Total:* ₹${total}

🧶 *Items:*
${itemList}

Login to admin panel to update order status.`;

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to:   process.env.TWILIO_WHATSAPP_TO,
    body: message
  });
};

// ── Send cancellation notification to shop owner ──
exports.sendCancelWhatsApp = async (orderNumber, customerName, total) => {
  const message = `❌ *PaintedLoops — Order Cancelled*

📦 *Order:* #${orderNumber}
👤 *Customer:* ${customerName}
💰 *Amount:* ₹${total}

Stock has been automatically restored.`;

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to:   process.env.TWILIO_WHATSAPP_TO,
    body: message
  });
};

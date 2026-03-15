// test-whatsapp.js
// Run this from your backend folder: node test-whatsapp.js

require('dotenv').config();
const twilio = require('twilio');

console.log('Testing WhatsApp notification...\n');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Found' : '❌ Missing');
console.log('TWILIO_AUTH_TOKEN: ', process.env.TWILIO_AUTH_TOKEN  ? '✅ Found' : '❌ Missing');
console.log('TWILIO_WHATSAPP_FROM:', process.env.TWILIO_WHATSAPP_FROM || '❌ Missing');
console.log('TWILIO_WHATSAPP_TO:  ', process.env.TWILIO_WHATSAPP_TO   || '❌ Missing');
console.log('');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.messages.create({
  from: process.env.TWILIO_WHATSAPP_FROM,
  to:   process.env.TWILIO_WHATSAPP_TO,
  body: '🌸 PaintedLoops test message! WhatsApp notifications are working ✅'
})
.then(msg => {
  console.log('✅ SUCCESS! Message SID:', msg.sid);
  console.log('Message sent to:', process.env.TWILIO_WHATSAPP_TO);
})
.catch(err => {
  console.log('❌ ERROR:', err.message);
  console.log('Error code:', err.code);
  console.log('\nCommon fixes:');
  if (err.code === 21608) console.log('→ Your WhatsApp number has not joined the sandbox. Send "join <word>" to', process.env.TWILIO_WHATSAPP_FROM);
  if (err.code === 20003) console.log('→ Auth Token is wrong. Regenerate it on Twilio console.');
  if (err.code === 21211) console.log('→ TWILIO_WHATSAPP_TO format is wrong. Should be: whatsapp:+91XXXXXXXXXX');
});

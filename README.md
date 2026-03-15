# 🌸 PaintedLoops — Backend API

Node.js + Express + MySQL backend for the PaintedLoops e-commerce store.

---

## 🚀 Setup Instructions

### 1. Install Node.js
Download from https://nodejs.org (version 18 or above)

### 2. Install MySQL
Download from https://dev.mysql.com/downloads/installer/
- Remember your MySQL root password during setup

### 3. Clone / Extract this folder
```
paintedloops-backend/
```

### 4. Install dependencies
```bash
npm install
```

### 5. Setup the database
Open MySQL Workbench or MySQL terminal and run:
```bash
mysql -u root -p < database.sql
```

### 6. Configure environment
```bash
cp .env.example .env
```
Edit `.env` with your values:
- `DB_PASSWORD` → your MySQL password
- `JWT_SECRET`  → any long random string
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` → from razorpay.com dashboard
- `EMAIL_USER` & `EMAIL_PASS` → your Gmail + App Password

### 7. Start the server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server runs at: **http://https://paintedloops-backend.onrender.com**

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get profile (🔒) |
| PUT  | /api/auth/update-profile | Update profile (🔒) |
| PUT  | /api/auth/change-password | Change password (🔒) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/products | List all products |
| GET  | /api/products?category=hair-accessories | Filter by category |
| GET  | /api/products?search=daisy | Search products |
| GET  | /api/products/:slug | Get single product |
| POST | /api/products | Create product (🔒 Admin) |
| PUT  | /api/products/:id | Update product (🔒 Admin) |
| DELETE | /api/products/:id | Delete product (🔒 Admin) |
| POST | /api/products/:id/review | Add review (🔒) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Place order (🔒) |
| GET  | /api/orders | My orders (🔒) |
| GET  | /api/orders/:id | Order details (🔒) |
| GET  | /api/orders/admin/all | All orders (🔒 Admin) |
| PUT  | /api/orders/:id/status | Update status (🔒 Admin) |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payment/create-order | Create Razorpay order (🔒) |
| POST | /api/payment/verify | Verify payment (🔒) |
| POST | /api/payment/cod-confirm | Confirm COD (🔒) |

### Addresses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | /api/addresses | Get my addresses (🔒) |
| POST | /api/addresses | Add address (🔒) |
| PUT  | /api/addresses/:id | Update address (🔒) |
| DELETE | /api/addresses/:id | Delete address (🔒) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Stats & analytics (🔒 Admin) |
| GET | /api/admin/users | All users (🔒 Admin) |

> 🔒 = Requires `Authorization: Bearer <token>` header

---

## 🧪 Test with Postman
1. Download Postman: https://www.postman.com
2. Register → Login → Copy the `token` from response
3. Add header: `Authorization: Bearer YOUR_TOKEN`

---

## 💳 Razorpay Setup
1. Sign up at https://razorpay.com
2. Go to Settings → API Keys → Generate Key
3. Add Key ID and Key Secret to `.env`

---

## 📧 Gmail Setup for Emails
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App Passwords
3. Generate an App Password and add to `.env`

---

## 🗂️ Project Structure
```
paintedloops-backend/
├── server.js           ← Entry point
├── database.sql        ← MySQL schema + seed data
├── .env.example        ← Environment template
├── config/
│   └── db.js           ← MySQL connection
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── addressController.js
│   └── adminController.js
├── middleware/
│   └── auth.js         ← JWT protection
├── routes/
│   ├── auth.js
│   ├── products.js
│   └── index.js
└── utils/
    └── mailer.js       ← Email sender
```

---

Made with ❤️ for PaintedLoops

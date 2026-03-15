-- ============================================
--   PaintedLoops — Complete Database
--   Drop & recreate cleanly. Run this once.
-- ============================================

DROP DATABASE IF EXISTS paintedloops_db;
CREATE DATABASE paintedloops_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE paintedloops_db;

-- ─── USERS ───────────────────────────────────
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(50)  NOT NULL,
  last_name     VARCHAR(50)  NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('customer','admin') DEFAULT 'customer',
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── ADDRESSES ───────────────────────────────
CREATE TABLE addresses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city          VARCHAR(100) NOT NULL,
  state         VARCHAR(100) NOT NULL,
  pin_code      VARCHAR(10)  NOT NULL,
  address_type  ENUM('home','work','other') DEFAULT 'home',
  is_default    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── CATEGORIES ──────────────────────────────
CREATE TABLE categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url   VARCHAR(500),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── PRODUCTS ────────────────────────────────
CREATE TABLE products (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  category_id  INT NOT NULL,
  name         VARCHAR(200) NOT NULL,
  slug         VARCHAR(200) NOT NULL UNIQUE,
  description  TEXT,
  price        DECIMAL(10,2) NOT NULL,
  old_price    DECIMAL(10,2),
  stock        INT DEFAULT 0,
  image_url    VARCHAR(500),
  images       JSON,
  badge        VARCHAR(50),
  is_active    BOOLEAN DEFAULT TRUE,
  rating       DECIMAL(3,2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ─── WISHLIST ────────────────────────────────
CREATE TABLE wishlist (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── ORDERS ──────────────────────────────────
CREATE TABLE orders (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  order_number        VARCHAR(20)  NOT NULL UNIQUE,
  user_id             INT NOT NULL,
  address_id          INT,
  subtotal            DECIMAL(10,2) NOT NULL,
  shipping_charge     DECIMAL(10,2) DEFAULT 50.00,
  total_amount        DECIMAL(10,2) NOT NULL,
  status              ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
  payment_method      ENUM('card','upi','netbanking','cod','phonepe','gpay') NOT NULL,
  payment_status      ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  razorpay_order_id   VARCHAR(200),
  razorpay_payment_id VARCHAR(200),
  notes               TEXT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id),
  FOREIGN KEY (address_id) REFERENCES addresses(id)
);

-- ─── ORDER ITEMS ─────────────────────────────
CREATE TABLE order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT NOT NULL,
  product_id   INT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  price        DECIMAL(10,2) NOT NULL,
  quantity     INT NOT NULL,
  subtotal     DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ─── REVIEWS ─────────────────────────────────
CREATE TABLE reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT NOT NULL,
  user_id     INT NOT NULL,
  rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (product_id, user_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

-- ════════════════════════════════════════════
--   SEED DATA
-- ════════════════════════════════════════════

-- ─── ADMIN USER ──────────────────────────────
-- Password: PaintedLoops@27
INSERT INTO users (first_name, last_name, email, phone, password_hash, role, is_verified) VALUES
('Monika', 'Admin', 'paintedloops003@gmail.com', '9389917876',
 '$2a$10$uvQOejCOpFJ6a2mBg0yBvOYBSJu.y1sKufXsiV21oWtKW6OCLpcfC', 'admin', TRUE);

-- ─── CATEGORIES ──────────────────────────────
INSERT INTO categories (name, slug, description) VALUES
('Hair Accessories',    'hair-accessories',    'Handmade crochet hair clips, bows, and garlands'),
('Crochet Flowers',     'crochet-flowers',     'Beautiful handcrafted crochet flower stems and bouquets'),
('Bags & Purses',       'bags-purses',         'Handmade crochet bags, purses, and berets'),
('Keychains',           'keychains',           'Cute crochet keychains and accessories'),
('Bookmarks',           'bookmarks',           'Handmade crochet bookmarks'),
('Amigurumi',           'amigurumi',           'Handmade crochet character keychains and amigurumi figures'),
('Wall Art',            'wall-art',            'Original handcrafted paintings and framed wall art'),
('Painted Keychains',   'painted-keychains',   'Handpainted wooden keychains — pop culture, anime, and cute characters');

-- ─── PRODUCTS: HAIR ACCESSORIES (cat 1) ──────
INSERT INTO products (category_id, name, slug, description, price, old_price, stock, badge, rating, review_count) VALUES
(1, 'Lavender Crochet Bow Clip',       'lavender-crochet-bow-clip',       'Beautiful handmade lavender bow hair clip, perfect for all hair types.',               99.00, 149.00, 50, 'Bestseller', 4.9, 38),
(1, 'Pastel Bow Hair Pin',             'pastel-bow-hair-pin',             'Soft pastel crochet bow pin, lightweight and adorable.',                               89.00, 129.00, 40,  NULL,        4.8, 22),
(1, 'Red Flower Hair Clips (Pair)',    'red-flower-hair-clips-pair',      'A pair of vibrant red crochet flower hair clips with pearl center.',                   79.00, 119.00, 60, 'Bestseller', 5.0, 45),
(1, 'White Daisy Hair Pins',           'white-daisy-hair-pins',           'Delicate white daisy crochet hair pins, great for everyday wear.',                     79.00,   NULL, 45,  NULL,        4.7, 31),
(1, 'Crochet Flower Hair Garland',     'crochet-flower-hair-garland',     'Long flowing crochet flower garland for hair, perfect for events.',                   199.00, 299.00, 20, 'New',        4.9, 17),
(1, 'Floral Hair Chain',               'floral-hair-chain',               'Elegant floral hair chain for bridal and festive looks.',                             179.00, 249.00, 25,  NULL,        4.8, 12),
(1, 'Red Butterfly Hair Clip',         'red-butterfly-hair-clip',         'Adorable red and white crochet butterfly hair clip.',                                  99.00, 149.00, 35,  NULL,        4.9, 29),
(1, 'Crochet Bun Scrunchie',           'crochet-bun-scrunchie',           'Stylish patterned crochet scrunchie for a bun hairstyle.',                            119.00, 169.00, 30,  NULL,        4.6, 18);

-- ─── PRODUCTS: CROCHET FLOWERS (cat 2) ───────
INSERT INTO products (category_id, name, slug, description, price, old_price, stock, badge, rating, review_count) VALUES
(2, 'Crochet Rose Stems (Set of 2)',   'crochet-rose-stems-set-2',        'A pair of handmade red crochet roses on stems — a perfect gift.',                    149.00, 199.00, 30, 'Bestseller', 4.9, 52),
(2, 'Daisy Flower Sticks (Set of 2)', 'daisy-flower-sticks-set-2',       'Two white daisy crochet flowers on green stems.',                                     129.00, 179.00, 35,  NULL,        4.8, 34),
(2, 'Mixed Flower Bouquet',           'mixed-flower-bouquet',            'A vibrant bouquet of crochet sunflower, daisy, and rose.',                            299.00, 399.00, 15, 'New',        5.0, 21),
(2, 'Sunflower & Daisy Pair',         'sunflower-daisy-pair',            'Two bright crochet flowers — sunflower and daisy on stems.',                          169.00, 229.00, 25,  NULL,        4.9, 28);

-- ─── PRODUCTS: BAGS & PURSES (cat 3) ─────────
INSERT INTO products (category_id, name, slug, description, price, old_price, stock, badge, rating, review_count) VALUES
(3, 'Maroon Crochet Coin Purse',      'maroon-crochet-coin-purse',       'Compact and stylish maroon crochet coin purse with clasp.',                           249.00, 349.00, 20,  NULL,        4.8, 19),
(3, 'Maroon Crochet Beret',           'maroon-crochet-beret',            'Warm and trendy maroon crochet beret, one size fits most.',                           349.00, 499.00, 15, 'New',        4.7, 14),
(3, 'Beret with Sunglass Pocket',     'beret-with-sunglass-pocket',      'Unique maroon beret with built-in sunglass pocket.',                                  399.00, 549.00, 10,  NULL,        4.9,  9);

-- ─── PRODUCTS: KEYCHAINS (cat 4) ─────────────
INSERT INTO products (category_id, name, slug, description, price, old_price, stock, badge, rating, review_count) VALUES
(4, 'Daisy Crochet Keychain',         'daisy-crochet-keychain',          'Cute white daisy crochet keychain with pearl bead chain.',                             79.00, 119.00, 80, 'Bestseller', 5.0, 63),
(4, 'Evil Eye Crochet Keychain',      'evil-eye-crochet-keychain',       'Ward off bad vibes! Handmade crochet evil eye keychain with blue-white tassel.',       79.00, 119.00, 50, 'Bestseller', 4.8, 41),
(4, 'Evil Eye TWS Cover',             'evil-eye-tws-cover',              'Handmade crochet evil eye cover for AirPods / TWS cases. Bold royal blue.',            99.00, 149.00, 30,  NULL,        4.7, 18);

-- ─── PRODUCTS: BOOKMARKS (cat 5) ─────────────
INSERT INTO products (category_id, name, slug, description, price, old_price, stock, badge, rating, review_count) VALUES
(5, 'Sunflower Bookmark',             'sunflower-bookmark',              'Handmade crochet sunflower bookmark with green stem.',                                  59.00,  89.00, 50,  NULL,        4.8, 24),
(5, 'Daisy Bookmark with Stem',       'daisy-bookmark-with-stem',        'Charming white daisy crochet bookmark, a bookworm gift.',                               59.00,   NULL, 45,  NULL,        4.7, 16);

-- ─── PRODUCTS: AMIGURUMI (cat 6) ─────────────
INSERT INTO products (category_id, name, slug, description, price, old_price, stock, badge, rating, review_count) VALUES
(6, 'Spider-Man Crochet Keychain',    'spider-man-crochet-keychain',     'Adorable hand-crafted amigurumi Spider-Man keychain. Red and blue suit with white eyes.',299.00, 399.00, 30, 'New',       4.9, 12);

-- ─── PRODUCTS: WALL ART (cat 7) ──────────────
INSERT INTO products (category_id, name, slug, description, price, old_price, stock, badge, rating, review_count) VALUES
(7, 'Lord Ganesh Aipan Art',          'lord-ganesh-aipan-art',           'Hand-painted Lord Ganesh mandala in traditional Aipan style. Rich maroon, gold & blue frame.',699.00, 999.00, 10, 'Handcrafted', 5.0, 7);

-- ─── PRODUCTS: PAINTED KEYCHAINS (cat 8) ─────
INSERT INTO products (category_id, name, slug, description, price, old_price, stock, badge, rating, review_count) VALUES
(8, 'Spider-Man Eye Wooden Keychain',     'spiderman-eye-wooden-keychain',      'Hand-painted Spider-Man eye close-up on a square wooden keychain. Red and black web pattern — a must-have for Marvel fans.',                                                          149.00, 199.00, 30, 'New',        4.9, 24),
(8, 'Evil Eye Nazar Wooden Keychain',     'evil-eye-nazar-wooden-keychain',     'Classic blue Nazar / Evil Eye painted on a round wooden keychain. A protective charm and stylish accessory in one.',                                                                   129.00, 179.00, 50, 'Bestseller', 4.8, 31),
(8, 'Polar Bear Love Wooden Keychain',    'polar-bear-love-wooden-keychain',    'Adorable white polar bear surrounded by red hearts on a pink square wooden keychain. Cute and charming gift.',                                                                          129.00, 179.00, 40,  NULL,        4.8, 18),
(8, 'Three Cats Starry Wooden Keychain',  'three-cats-starry-wooden-keychain',  'Three cute cats — black, white, and orange — on a starry pink background. Square wooden keychain for cat lovers.',                                                                      149.00, 199.00, 35, 'New',        4.9, 22),
(8, 'Black Cat Diamond Wooden Keychain',  'black-cat-diamond-wooden-keychain',  'A sleek black cat on a pink diamond-shaped wooden keychain. Minimalist and stylish with hand-painted whiskers.',                                                                         129.00, 179.00, 40,  NULL,        4.7, 15),
(8, 'Kitty & Batman Love Wooden Keychain','kitty-batman-love-wooden-keychain',  'Hello Kitty and Batman side by side with a love heart — hand-painted on a square wooden keychain. Perfect pop-culture gift.',                                                           149.00, 199.00, 30, 'Bestseller', 5.0, 27),
(8, 'Batman Logo Wooden Keychain',        'batman-logo-wooden-keychain',        'Bold yellow and black Batman logo painted on a round wooden keychain. A fan-favourite DC Comics design.',                                                                               129.00, 179.00, 45, 'Bestseller', 4.8, 33),
(8, 'Colourful Cats Wooden Keychain',     'colourful-cats-wooden-keychain',     'Three abstract colourful cats — blue, pink, and purple — on a light grey square wooden keychain. Quirky and fun.',                                                                      129.00, 179.00, 40,  NULL,        4.7, 19),
(8, 'Choose Peace Daisy Wooden Keychain', 'choose-peace-daisy-wooden-keychain', '"Choose Peace" hand-lettered among white daisies on a purple round wooden keychain. Spread good vibes everywhere.',                                                                     129.00, 179.00, 50,  NULL,        4.9, 28),
(8, 'Casa Amor Lar Wooden Keychain',      'casa-amor-lar-wooden-keychain',      '"Casa Amor Lar" (Home, Love, Hearth) with a cute yellow bear on a purple starry square wooden keychain.',                                                                               149.00, 199.00, 25, 'New',        4.8, 11),
(8, 'We Bare Bears Wooden Keychain',      'we-bare-bears-wooden-keychain',      'Panda, Ice Bear, and Grizzly from We Bare Bears hand-painted on a yellow round wooden keychain. A fan favourite!',                                                                      149.00, 199.00, 35, 'Bestseller', 5.0, 36),
(8, 'Shinchan Wooden Keychain',           'shinchan-wooden-keychain',           'Shinchan eating his favourite snack, hand-painted on a yellow round wooden keychain. Nostalgic and adorable.',                                                                           129.00, 179.00, 45, 'Bestseller', 4.9, 41);

-- ════════════════════════════════════════════
--   VERIFY — should show all categories & counts
-- ════════════════════════════════════════════
SELECT c.name AS category, COUNT(p.id) AS total_products
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.id;

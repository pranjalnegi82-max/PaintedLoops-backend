const express = require('express');
const router  = express.Router();
const pc      = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/',                           pc.getProducts);
router.get('/:slug',                      pc.getProduct);
router.post('/',     protect, adminOnly,  pc.createProduct);
router.put('/:id',   protect, adminOnly,  pc.updateProduct);
router.delete('/:id',protect, adminOnly,  pc.deleteProduct);
router.post('/:id/review', protect,       pc.addReview);

module.exports = router;

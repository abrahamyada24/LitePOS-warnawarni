const express = require('express');
const router = express.Router();
const stockReceiptController = require('../controllers/stockReceiptController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, stockReceiptController.getAllStockReceipts);
router.post('/', verifyToken, stockReceiptController.createStockReceipt);

module.exports = router;

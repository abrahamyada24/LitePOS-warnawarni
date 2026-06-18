const express = require('express');
const router = express.Router();
const stockOpnameController = require('../controllers/stockOpnameController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, stockOpnameController.getStockForOpname);
router.post('/', verifyToken, stockOpnameController.submitStockOpname);

module.exports = router;

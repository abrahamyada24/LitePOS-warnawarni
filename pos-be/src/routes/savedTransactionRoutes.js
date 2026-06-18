const express = require('express');
const router = express.Router();
const savedTransactionController = require('../controllers/savedTransactionController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, savedTransactionController.getSavedTransactions);
router.get('/:id', verifyToken, savedTransactionController.getSavedTransactionById);
router.post('/', verifyToken, savedTransactionController.saveTransaction);
router.delete('/:id', verifyToken, savedTransactionController.deleteSavedTransaction);

module.exports = router;

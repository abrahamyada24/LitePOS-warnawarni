const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, expenseController.getAllExpenses);
router.post('/', verifyToken, expenseController.createExpense);
router.delete('/:id', verifyToken, expenseController.deleteExpense);

module.exports = router;

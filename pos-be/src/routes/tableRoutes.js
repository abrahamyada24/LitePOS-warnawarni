const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, tableController.getAllTables);
router.post('/', verifyToken, tableController.createTable);
router.put('/:id', verifyToken, tableController.updateTable);
router.delete('/:id', verifyToken, tableController.deleteTable);
router.patch('/:id/status', verifyToken, tableController.updateTableStatus);

module.exports = router;

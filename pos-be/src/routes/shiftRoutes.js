const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, shiftController.getAllShifts);
router.get('/current', verifyToken, shiftController.getCurrentShift);
router.post('/open', verifyToken, shiftController.openShift);
router.post('/:id/close', verifyToken, shiftController.closeShift);

module.exports = router;

const express = require('express');
const router = express.Router();
const addonController = require('../controllers/addonController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/:productId', verifyToken, addonController.getAddonsByProduct);
router.post('/', verifyToken, addonController.createAddon);
router.put('/:id', verifyToken, addonController.updateAddon);
router.delete('/:id', verifyToken, addonController.deleteAddon);

module.exports = router;

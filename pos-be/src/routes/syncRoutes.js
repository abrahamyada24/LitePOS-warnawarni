const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');
const { verifyToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Sync
 *     description: Sinkronisasi Data Offline Android (Master Data & Transactions)
 */

/**
 * @swagger
 * /api/sync/master:
 *   get:
 *     summary: Ambil semua Master Data untuk Android SQLite
 *     tags: [Sync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data master
 */
router.get('/master', verifyToken, syncController.getMasterData);

/**
 * @swagger
 * /api/sync/push:
 *   post:
 *     summary: Push data lokal Android (Transaksi, Pengeluaran, Shift) ke Server
 *     tags: [Sync]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactions:
 *                 type: array
 *                 items:
 *                   type: object
 *               expenses:
 *                 type: array
 *                 items:
 *                   type: object
 *               shifts:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Berhasil menyimpan data log lokal ke server
 */
router.post('/push', verifyToken, syncController.pushLocalData);

/**
 * @swagger
 * /api/sync/history:
 *   get:
 *     summary: Ambil histori transaksi 30 hari terakhir untuk ditampilkan di laporan Android
 *     tags: [Sync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil histori transaksi
 */
router.get('/history', verifyToken, syncController.getTransactionHistory);

module.exports = router;

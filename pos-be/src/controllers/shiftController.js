const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. OPEN SHIFT
exports.openShift = async (req, res) => {
    try {
        const { userId, userName, openingCash } = req.body;

        // Check if there's already an open shift
        const existingOpen = await prisma.shift.findFirst({
            where: { status: 'OPEN' }
        });

        if (existingOpen) {
            return res.status(400).json({
                success: false,
                message: "Sudah ada shift yang sedang berjalan. Tutup shift sebelumnya terlebih dahulu."
            });
        }

        const shift = await prisma.shift.create({
            data: {
                userId: parseInt(userId),
                userName,
                openedAt: new Date(),
                openingCash: parseFloat(openingCash) || 0,
                status: 'OPEN'
            }
        });

        res.status(201).json({ success: true, message: "Shift berhasil dibuka", data: shift });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. CLOSE SHIFT
exports.closeShift = async (req, res) => {
    try {
        const { id } = req.params;
        const { closingCash } = req.body;

        const shift = await prisma.shift.findUnique({ where: { id } });
        if (!shift) {
            return res.status(404).json({ success: false, message: "Shift tidak ditemukan" });
        }
        if (shift.status === 'CLOSED') {
            return res.status(400).json({ success: false, message: "Shift sudah ditutup" });
        }

        // Calculate sales during shift
        const shiftTransactions = await prisma.transaction.findMany({
            where: {
                createdAt: {
                    gte: shift.openedAt,
                    lte: new Date()
                },
                status: { in: ['PAID', 'COMPLETED'] }
            }
        });

        const totalSales = shiftTransactions.reduce((sum, t) => sum + Number(t.grandTotal), 0);
        const transactionCount = shiftTransactions.length;

        const updated = await prisma.shift.update({
            where: { id },
            data: {
                closedAt: new Date(),
                closingCash: closingCash !== undefined ? parseFloat(closingCash) : null,
                status: 'CLOSED'
            }
        });

        res.json({
            success: true,
            message: "Shift berhasil ditutup",
            data: {
                ...updated,
                totalSales,
                transactionCount,
                expectedCash: Number(shift.openingCash) + totalSales,
                difference: closingCash !== undefined ? parseFloat(closingCash) - (Number(shift.openingCash) + totalSales) : null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. GET ALL SHIFTS
exports.getAllShifts = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const whereClause = {};

        if (startDate && endDate) {
            whereClause.openedAt = {
                gte: new Date(startDate),
                lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        const shifts = await prisma.shift.findMany({
            where: whereClause,
            orderBy: { openedAt: 'desc' }
        });

        res.json({ success: true, data: shifts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 4. GET CURRENT OPEN SHIFT
exports.getCurrentShift = async (req, res) => {
    try {
        const shift = await prisma.shift.findFirst({
            where: { status: 'OPEN' },
            orderBy: { openedAt: 'desc' }
        });

        res.json({ success: true, data: shift });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

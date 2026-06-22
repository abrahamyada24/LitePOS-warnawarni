const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPublicCatalog = async (req, res) => {
    try {
        // Ambil produk yang AKTIF dan stoknya > 0, termasuk informasi kategorinya
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                stock: {
                    gt: 0
                }
            },
            include: {
                category: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Ambil kategori yang memiliki produk aktif dengan stok > 0
        const activeCategoryIds = [...new Set(products.map(p => p.categoryId))];
        const categories = await prisma.category.findMany({
            where: {
                id: { in: activeCategoryIds }
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Ambil pengaturan toko untuk mendapatkan nomor WhatsApp
        const settings = await prisma.storeSetting.findFirst();

        res.status(200).json({
            success: true,
            data: {
                products,
                categories,
                settings
            }
        });
    } catch (error) {
        console.error('Error in getPublicCatalog:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat mengambil data katalog.' });
    }
};

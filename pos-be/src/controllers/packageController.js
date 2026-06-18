const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllPackages = async (req, res) => {
    try {
        const packages = await prisma.package.findMany({
            include: {
                items: {
                    include: { product: true }
                }
            }
        });
        res.json({ success: true, data: packages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getPackageById = async (req, res) => {
    try {
        const pkg = await prisma.package.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });
        if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
        res.json({ success: true, data: pkg });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createPackage = async (req, res) => {
    try {
        const { name, description, price, isActive, items } = req.body;
        
        const newPackage = await prisma.package.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                isActive: isActive ?? true,
                items: {
                    create: items?.map(item => ({
                        productId: parseInt(item.productId),
                        qty: parseInt(item.qty || 1)
                    })) || []
                }
            },
            include: { items: true }
        });
        res.status(201).json({ success: true, data: newPackage, message: 'Package created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updatePackage = async (req, res) => {
    try {
        const { name, description, price, isActive, items } = req.body;
        const packageId = Number(req.params.id);

        const updatedPackage = await prisma.$transaction(async (tx) => {
            // Delete old items
            if (items) {
                await tx.packageItem.deleteMany({ where: { packageId } });
            }

            // Update package
            return await tx.package.update({
                where: { id: packageId },
                data: {
                    name,
                    description,
                    price: price ? parseFloat(price) : undefined,
                    isActive,
                    ...(items && {
                        items: {
                            create: items.map(item => ({
                                productId: parseInt(item.productId),
                                qty: parseInt(item.qty || 1)
                            }))
                        }
                    })
                },
                include: { items: { include: { product: true } } }
            });
        });

        res.json({ success: true, data: updatedPackage, message: 'Package updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deletePackage = async (req, res) => {
    try {
        const packageId = Number(req.params.id);
        
        await prisma.$transaction([
            prisma.packageItem.deleteMany({ where: { packageId } }),
            prisma.package.delete({ where: { id: packageId } })
        ]);

        res.json({ success: true, message: 'Package deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

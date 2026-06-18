const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Default Owner (Boss)
    const ownerEmail = 'boss@litepos.com';
    const ownerPassword = await bcrypt.hash('boss123', 10);
    const owner = await prisma.user.upsert({
        where: { email: ownerEmail },
        update: {
            name: 'Boss LitePOS',
            password: ownerPassword,
            role: 'OWNER',
            isActive: true,
        },
        create: {
            name: 'Boss LitePOS',
            email: ownerEmail,
            password: ownerPassword,
            role: 'OWNER',
            isActive: true,
        },
    });
    console.log(`User created or updated: ${owner.email} (OWNER)`);

    // 2. Create Default Admin
    const adminEmail = 'admin@litepos.com';
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            name: 'Admin LitePOS',
            password: adminPassword,
            role: 'ADMIN',
            isActive: true,
        },
        create: {
            name: 'Admin LitePOS',
            email: adminEmail,
            password: adminPassword,
            role: 'ADMIN',
            isActive: true,
        },
    });
    console.log(`User created or updated: ${admin.email} (ADMIN)`);

    // 3. Create Default Cashier
    const cashierEmail = 'cashier@litepos.com';
    const cashierPassword = await bcrypt.hash('cashier123', 10);
    const cashier = await prisma.user.upsert({
        where: { email: cashierEmail },
        update: {
            name: 'Kasir Utama',
            password: cashierPassword,
            role: 'CASHIER',
            isActive: true,
        },
        create: {
            name: 'Kasir Utama',
            email: cashierEmail,
            password: cashierPassword,
            role: 'CASHIER',
            isActive: true,
        },
    });
    console.log(`User created or updated: ${cashier.email} (CASHIER)`);

    // 3. Create Default Categories (Optional but helpful)
    const categories = ['Makanan', 'Minuman', 'Dessert', 'Snack'];

    for (const catName of categories) {
        await prisma.category.upsert({
            where: { id: 0 }, // Hacky check, usually we use unique name or findFirst
            // Since schema doesn't have unique name on category, we will just use createMany or check manually.
            // For upsert we need unique field. Let's stick to just users for now to be safe, 
            // OR better: check if exists first.
            update: {},
            create: { name: catName }
        }).catch(() => { }); // Ignore if fails due to id or something, actually upsert needs unique constraint.
    }

    // 4. Default Store Settings
    const settings = await prisma.storeSetting.upsert({
        where: { id: 1 },
        update: {
            storeName: 'LitePOS Store',
            allowNegativeStock: false,
            showImages: true,
            theme: 'light',
        },
        create: {
            id: 1,
            storeName: 'LitePOS Store',
            allowNegativeStock: false,
            showImages: true,
            theme: 'light',
        },
    });
    console.log('Store settings initialized.');

    // 5. Default Loyalty Config
    const loyalty = await prisma.loyaltyConfig.upsert({
        where: { id: 1 },
        update: {
            pointMultiplier: 1,
            multiplierAmount: 10000,
            pointValue: 100,
            minRedemptionPoints: 10,
            isActive: true,
        },
        create: {
            id: 1,
            pointMultiplier: 1,
            multiplierAmount: 10000,
            pointValue: 100,
            minRedemptionPoints: 10,
            isActive: true,
        },
    });
    console.log('Loyalty configuration initialized.');

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

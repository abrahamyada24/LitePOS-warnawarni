const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Memulai pembersihan data...');

  // Hapus data transaksi dan keranjang
  await prisma.payment.deleteMany({});
  await prisma.transactionItem.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.savedTransaction.deleteMany({});
  
  // Hapus paket
  await prisma.packageItem.deleteMany({});
  await prisma.package.deleteMany({});
  
  // Hapus riwayat stok
  await prisma.stockMovement.deleteMany({});
  await prisma.stockReceiptItem.deleteMany({});
  await prisma.stockReceipt.deleteMany({});
  
  // Hapus produk dan kategori
  await prisma.productAddon.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  
  // Hapus data operasional lainnya
  await prisma.customer.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.shift.deleteMany({});
  await prisma.dineTable.deleteMany({});
  await prisma.supplier.deleteMany({});
  
  console.log('Berhasil! Semua data operasional telah dikosongkan. Database siap digunakan untuk Demo.');
}

main()
  .catch(e => {
    console.error('Gagal mengosongkan data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

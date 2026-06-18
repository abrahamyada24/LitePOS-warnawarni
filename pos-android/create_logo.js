const { createCanvas } = require('canvas');
const fs = require('fs');

// Ukuran canvas
const width = 200;
const height = 80;

// Buat canvas dengan background transparan
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Warna - RGB format
const liteColor = '#0f172a';  // Biru Tua
const posColor = '#3b82f6';   // Biru Benhur

// Font
ctx.font = 'bold 50px Arial';

// Gambar teks 'Lite'
ctx.fillStyle = liteColor;
ctx.fillText('Lite', 10, 55);

// Gambar teks 'POS'
ctx.fillStyle = posColor;
ctx.fillText('POS', 110, 55);

// Simpan PNG transparan
const pngBuffer = canvas.toBuffer('image/png');
fs.writeFileSync('D:/AndroidPos/src/assets/logo.png', pngBuffer);
console.log('Logo PNG saved: D:/AndroidPos/src/assets/logo.png');

// Buat versi untuk struk - background putih
const canvasReceipt = createCanvas(width, height);
const ctxReceipt = canvasReceipt.getContext('2d');

// Background putih
ctxReceipt.fillStyle = '#ffffff';
ctxReceipt.fillRect(0, 0, width, height);

// Gambar teks
ctxReceipt.font = 'bold 50px Arial';
ctxReceipt.fillStyle = liteColor;
ctxReceipt.fillText('Lite', 10, 55);
ctxReceipt.fillStyle = posColor;
ctxReceipt.fillText('POS', 110, 55);

// Simpan JPG
const jpgBuffer = canvasReceipt.toBuffer('image/jpeg', { quality: 0.95 });
fs.writeFileSync('D:/AndroidPos/src/assets/receipt_logo.jpg', jpgBuffer);
console.log('Receipt logo saved: D:/AndroidPos/src/assets/receipt_logo.jpg');
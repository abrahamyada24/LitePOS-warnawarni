const fs = require('fs');
const data = fs.readFileSync('d:/AndroidPos/src/assets/logo.png', 'base64');
fs.writeFileSync('d:/AndroidPos/src/assets/receiptLogoBase64.ts', "export const RECEIPT_LOGO_BASE64 = '" + data + "';\n");

const fs = require('fs');
const path = 'src/screens/ReportScreen.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

if (lines[1569] && lines[1569].includes('Sedang menyiapkan laporan...')) {
    lines[1569] = '                            <Text style={tw`text-center text-gray-500 font-bold text-sm`}>⏳ Sedang menyiapkan laporan...</Text>\r';
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Fixed line 1570');

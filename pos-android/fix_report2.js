const fs = require('fs');
const path = 'src/screens/ReportScreen.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('File HTML tersimpan di Download')) {
        lines[i] = '                                <Text style={tw`text-xs text-blue-600 mt-0.5`}>File HTML tersimpan di Download, buka di browser -{">"} Print -{">"} PDF</Text>\r';
    }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log('Fixed line');

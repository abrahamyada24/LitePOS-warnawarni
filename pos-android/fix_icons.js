const fs = require('fs');
const path = require('path');

const iconMapping = {
    'Package': 'package-variant',
    'Tag': 'tag-outline',
    'Users': 'account-group',
    'AlertTriangle': 'alert-outline',
    'ClipboardList': 'clipboard-list-outline',
    'Trophy': 'trophy',
    'Circle': 'circle-outline',
    'ShoppingBag': 'shopping-outline',
    'BarChart2': 'chart-bar',
    'Folder': 'folder-outline',
    'Store': 'storefront-outline',
    'Settings2': 'cog-outline',
    'Heart': 'heart-outline',
    'Moon': 'moon-waning-crescent',
    'Printer': 'printer',
    'Database': 'database',
    'HardDrive': 'harddisk',
    'RefreshCw': 'refresh',
    'Info': 'information-outline',
    'MessageCircle': 'message-outline',
    'Rocket': 'rocket-launch-outline',
    'Smartphone': 'cellphone',
};

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            for (const [lucideName, mdiName] of Object.entries(iconMapping)) {
                // Regex to find <IconName ... /> or <IconName /> or </IconName>
                const openTagRegex = new RegExp(`<${lucideName}(\\s|>)`, 'g');
                if (openTagRegex.test(content)) {
                    content = content.replace(new RegExp(`<${lucideName}(\\s+.*?|\\s*)/>`, 'g'), `<Icon name="${mdiName}"$1/>`);
                    // Just in case it's <IconName></IconName>
                    content = content.replace(new RegExp(`<${lucideName}(\\s+.*?)>(.*?)</${lucideName}>`, 'g'), `<Icon name="${mdiName}"$1>$2</Icon>`);
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory('d:/AndroidPos/src');
console.log('Done');

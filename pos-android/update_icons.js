const fs = require('fs');
const path = require('path');

const resDir = path.join('android', 'app', 'src', 'main', 'res');
const iconPath = 'icon.png';
const logoPath = 'Logo.png';

// Try to use Logo.png if icon.png doesn't exist, though both exist.
const sourceIcon = fs.existsSync(iconPath) ? iconPath : logoPath;
const iconBuffer = fs.readFileSync(sourceIcon);

const mipmaps = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];

mipmaps.forEach(folder => {
    const folderPath = path.join(resDir, folder);
    if (fs.existsSync(folderPath)) {
        // Write standard and round icon
        fs.writeFileSync(path.join(folderPath, 'ic_launcher.png'), iconBuffer);
        fs.writeFileSync(path.join(folderPath, 'ic_launcher_round.png'), iconBuffer);
        // Sometimes foreground icon is used
        fs.writeFileSync(path.join(folderPath, 'ic_launcher_foreground.png'), iconBuffer);
    }
});

// Remove adaptive icon XMLs to force fallback to PNG
const adaptiveDir = path.join(resDir, 'mipmap-anydpi-v26');
if (fs.existsSync(adaptiveDir)) {
    fs.rmSync(adaptiveDir, { recursive: true, force: true });
}

console.log('Launcher icons updated!');

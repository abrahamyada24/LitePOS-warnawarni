const fs = require('fs');
const path = require('path');

const iconMap = {
  Home: 'home',
  Settings: 'cog-outline',
  SettingsIcon: 'cog-outline',
  FileText: 'file-document-outline',
  Briefcase: 'briefcase-outline',
  Play: 'play',
  Package: 'package-variant',
  BookUser: 'account-box-outline',
  Clock: 'clock-outline',
  ShieldAlert: 'shield-alert-outline',
  Calendar: 'calendar',
  ArrowLeft: 'arrow-left',
  Plus: 'plus',
  X: 'close',
  Save: 'content-save',
  Trash2: 'delete-outline',
  Tag: 'tag-outline',
  Search: 'magnify',
  CreditCard: 'credit-card-outline',
  Banknote: 'cash',
  Users: 'account-multiple',
  ChevronRight: 'chevron-right',
  Store: 'store',
  UtensilsCrossed: 'silverware-fork-knife',
  Landmark: 'bank',
  Lock: 'lock',
  Key: 'key',
  CheckCircle: 'check-circle',
  CheckSquare: 'checkbox-marked',
  Square: 'checkbox-blank-outline',
  Edit: 'pencil',
  Check: 'check',
  Phone: 'phone',
  ClipboardList: 'clipboard-list',
  Camera: 'camera',
  CameraIcon: 'camera',
  Printer: 'printer',
  AlertTriangle: 'alert',
  ShoppingCart: 'cart',
  Minus: 'minus',
  ScanBarcode: 'barcode-scan',
  Boxes: 'package-variant-closed',
  History: 'history',
  Pencil: 'pencil',
  UserPlus: 'account-plus',
  User: 'account',
  MapPin: 'map-marker',
  MoreVertical: 'dots-vertical',
  MessageSquare: 'message-text',
  Activity: 'chart-line-variant',
  LogOut: 'logout',
  TrendingDown: 'trending-down',
  ArrowRight: 'arrow-right',
  Database: 'database',
  Zap: 'flash',
  Info: 'information',
  Eye: 'eye',
  EyeOff: 'eye-off',
  ChevronDown: 'chevron-down',
  ChevronUp: 'chevron-up',
  Filter: 'filter',
  Download: 'download',
  Upload: 'upload',
  RefreshCw: 'refresh',
  Mail: 'email',
  Heart: 'heart',
  Star: 'star',
  Image: 'image',
  Copy: 'content-copy',
  Share: 'share-variant',
  BarChart: 'chart-bar',
  PieChart: 'chart-pie',
  Settings2: 'cog',
  Wifi: 'wifi',
  WifiOff: 'wifi-off',
  AlertCircle: 'alert-circle',
  HelpCircle: 'help-circle',
  ExternalLink: 'open-in-new',
  Link: 'link',
  Hash: 'pound',
  Layers: 'layers',
  Grid: 'view-grid',
  List: 'format-list-bulleted',
  LayoutGrid: 'view-grid-outline',
  CircleDot: 'circle-slice-8',
  Monitor: 'monitor',
  ReceiptText: 'receipt',
  DollarSign: 'currency-usd',
  Percent: 'percent',
  BadgePercent: 'sale',
  TrendingUp: 'trending-up',
  BarChart3: 'chart-bar',
  ArrowUpRight: 'arrow-top-right',
  ArrowDownRight: 'arrow-bottom-right',
  Wallet: 'wallet',
  Receipt: 'receipt',
  RotateCcw: 'restore',
  type: 'format-text',
  UsersIcon: 'account-multiple'
};

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // find import from 'lucide-react-native'
    // It could span multiple lines
    const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react-native['"];?/g;
    
    let hasLucide = false;
    content = content.replace(importRegex, (match, p1) => {
        hasLucide = true;
        return `import Icon from 'react-native-vector-icons/MaterialCommunityIcons';`;
    });
    
    if (!hasLucide) return;

    Object.keys(iconMap).forEach(lucideName => {
        const materialName = iconMap[lucideName];
        
        const openTagRegex = new RegExp(`<\\b${lucideName}\\b(\\s+[^>]*?)?>`, 'g');
        content = content.replace(openTagRegex, `<Icon name="${materialName}"$1>`);
        
        const closeTagRegex = new RegExp(`</\\b${lucideName}\\b>`, 'g');
        content = content.replace(closeTagRegex, `</Icon>`);
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Processed', filePath);
}

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
files.forEach(processFile);

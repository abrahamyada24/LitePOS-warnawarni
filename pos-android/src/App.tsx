import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, Modal, Alert, TextInput, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDBConnection, createTables, seedInitialData } from './database/db';
import tw, { useAppColorScheme } from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStore } from './store/useStore';
import { syncService } from './services/syncService';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import POSScreen from './screens/POSScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import ReceiptPreviewScreen from './screens/ReceiptPreviewScreen';
import ManagementScreen from './screens/ManagementScreen';
import ReportScreen from './screens/ReportScreen';
import SettingsScreen from './screens/SettingsScreen';
import UserManagementScreen from './screens/UserManagementScreen';
import StockReceivingScreen from './screens/StockReceivingScreen';
import StockOpnameScreen from './screens/StockOpnameScreen';
import StockHistoryScreen from './screens/StockHistoryScreen';
import TableManagementScreen from './screens/TableManagementScreen';
import InventoryScreen from './screens/InventoryScreen';
import ContactScreen from './screens/ContactScreen';
import PackageScreen from './screens/PackageScreen';
import ProductListScreen from './screens/ProductListScreen';
import CategoryListScreen from './screens/CategoryListScreen';
import LockScreen from './screens/LockScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Ã¢â€â‚¬Ã¢â€â‚¬ Guard: block POS when shift not open Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function ShiftGuardedPOS({ navigation }: any) {
    useAppColorScheme(tw);
    const activeShift = useStore((state) => state.activeShift);
    const settings = useStore((state) => state.settings);
    // If shift feature is disabled in settings, or shift is active Ã¢â€ â€™ open POS
    if (!settings.enableShift || activeShift) return <POSScreen navigation={navigation} />;
    return (
        <View style={tw`flex-1 bg-gray-100 dark:bg-gray-950 items-center justify-center px-8`}>
            <View style={tw`bg-white dark:bg-gray-800 rounded-3xl p-8 w-full items-center shadow-sm border border-gray-100 dark:border-gray-700`}>
                <View style={tw`w-14 h-14 bg-orange-50 dark:bg-orange-900/30 rounded-2xl items-center justify-center mb-4`}>
                    <Icon name="briefcase-outline" size={28} color={tw.color('orange-500')} />
                </View>
                <Text style={tw`text-xl font-black text-gray-800 dark:text-gray-100 text-center mb-2`}>
                    Belum Ada Shift Aktif
                </Text>
                <Text style={tw`text-gray-400 dark:text-gray-500 text-sm text-center mb-6 leading-5`}>
                    Buka shift dari halaman Beranda terlebih dahulu sebelum memulai transaksi.
                </Text>
                <TouchableOpacity
                    style={tw`bg-orange-500 w-full py-3.5 rounded-2xl flex-row items-center justify-center`}
                    onPress={() => navigation.navigate('Beranda')}
                >
                    <Icon name="play" size={16} color="white" style={tw`mr-2`} />
                    <Text style={tw`text-white font-black text-sm`}>Buka Shift di Beranda</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Main Tab Navigator Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function MainTabNavigator() {
    useAppColorScheme(tw);
    const user = useStore((state) => state.user);
    const role = user?.role || 'CASHIER';

    const normalizedRole = role.toUpperCase();
    console.log('Current User Role:', normalizedRole);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    if (route.name === 'Beranda') return <Icon name="home" size={size} color={color} />;
                    if (route.name === 'Inventori') return <Icon name="package-variant" size={size} color={color} />;
                    if (route.name === 'Laporan') return <Icon name="file-document-outline" size={size} color={color} />;
                    if (route.name === 'Kontak') return <Icon name="account-box-outline" size={size} color={color} />;
                    if (route.name === 'Pengaturan') return <Icon name="cog-outline" size={size} color={color} />;
                    return <Icon name="home" size={size} color={color} />;
                },
                tabBarActiveTintColor: tw.color('blue-600'),
                tabBarInactiveTintColor: tw.color('gray-400'),
                tabBarStyle: tw`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 h-16 pb-2 pt-2`,
                tabBarLabelStyle: tw`font-bold text-xs`,
            })}
        >
            <Tab.Screen name="Beranda" component={DashboardScreen} />
            {(normalizedRole === 'ADMIN' || normalizedRole === 'OWNER') && (
                <>
                    <Tab.Screen name="Inventori" component={InventoryScreen} />
                    <Tab.Screen name="Laporan" component={ReportScreen} />
                    <Tab.Screen name="Kontak" component={ContactScreen} />
                    <Tab.Screen name="Pengaturan" component={SettingsScreen} />
                </>
            )}
        </Tab.Navigator>
    );
}

// Ã¢â€â‚¬Ã¢â€â‚¬ App Root Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const generateSignature = (storeId: string, days: string) => {
    const str = storeId + days + "LITE_SECRET_2026";
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return Math.abs(hash).toString(16).toUpperCase().substring(0, 4).padStart(4, '0');
};

function App(): React.JSX.Element {
    const settings = useStore((state) => state.settings);
    const setSettings = useStore((state) => state.setSettings);
    const user = useStore((state) => state.user);
    const setActiveShift = useStore((state) => state.setActiveShift);
    const [colorScheme, , setColorScheme] = useAppColorScheme(tw);
    const [showTrialPopup, setShowTrialPopup] = useState(false);
    const [activationCode, setActivationCode] = useState('');

    const handleActivate = async () => {
        const code = activationCode.trim().toUpperCase();
        if (code.length < 4) {
            Alert.alert("Kode Tidak Valid", "Kode aktivasi terlalu pendek.");
            return;
        }

        const supportedDays = [14, 30, 60, 90, 180, 360, 365, 720, 1000];
        let matchedDays = 0;
        const storeId = settings.store_id || 'UNKNOWN';

        for (const days of supportedDays) {
            if (generateSignature(storeId, days.toString()) === code) {
                matchedDays = days;
                break;
            }
        }

        if (matchedDays === 0) {
            Alert.alert("Aktivasi Gagal", "Kode aktivasi salah atau tidak berlaku untuk mesin ini.");
            return;
        }

        try {
            const db = await getDBConnection();
            const days = matchedDays;
            
            const now = new Date();
            let baseDate = now;
            if (settings.license_expire_date) {
                const currentExpire = new Date(settings.license_expire_date);
                if (currentExpire > now) {
                    baseDate = currentExpire;
                }
            }

            baseDate.setDate(baseDate.getDate() + days);
            const newExpireISO = baseDate.toISOString();

            await db.executeSql(`UPDATE settings SET value = ? WHERE key = 'license_expire_date'`, [newExpireISO]);
            await db.executeSql(`INSERT OR REPLACE INTO settings (key, value) VALUES ('license_type', 'PREMIUM')`);
            
            setSettings({ ...settings, license_expire_date: newExpireISO, license_type: 'PREMIUM' });
            setShowTrialPopup(false);
            Alert.alert("Berhasil", `Aplikasi berhasil diaktivasi ulang (+${days} Hari).`);
            setActivationCode('');

        } catch (error) {
            Alert.alert("Error", "Terjadi kesalahan saat menyimpan lisensi.");
        }
    };

    // Initialize DB and settings on mount
    useEffect(() => {
        const initDB = async () => {
            try {
                const db = await getDBConnection();
                await createTables(db);
                await seedInitialData(db);

                const [settingsRes] = await db.executeSql('SELECT * FROM settings');
                const rowCount = settingsRes.rows.length;
                let loadedSettings: any = {
                    storeName: 'LitePOS', storeAddress: '', storePhone: '',
                    storeLogo: null, enablePreOrder: false, enableShift: true, enableDineTable: false,
                    showImages: true, printerAddress: null, printerType: null, theme: 'light',
                };
                for (let i = 0; i < rowCount; i++) {
                    const row = settingsRes.rows.item(i);
                    if (row.key === 'showImages' || row.key === 'enablePreOrder' || row.key === 'enableShift' || row.key === 'enableDineTable') {
                        loadedSettings[row.key] = row.value === 'true';
                    } else {
                        loadedSettings[row.key] = row.value || null;
                    }
                }
                setSettings(loadedSettings);
                setColorScheme(loadedSettings.theme);
                console.log('DB and Settings initialized');
            } catch (error) {
                console.error('Failed to initialize DB:', error);
            }
        };
        initDB();
    }, [setSettings, setColorScheme]);

    // Restore an existing open shift from DB when user logs in
    useEffect(() => {
        if (!user) { setActiveShift(null); return; }
        const restoreShift = async () => {
            try {
                const db = await getDBConnection();
                const [res] = await db.executeSql(
                    `SELECT * FROM shifts WHERE userId = ? AND status = 'OPEN' ORDER BY openedAt DESC LIMIT 1`,
                    [user.id]
                );
                if (res.rows.length > 0) {
                    const s = res.rows.item(0);
                    setActiveShift({ id: s.id, openingCash: s.openingCash, openedAt: s.openedAt });
                }
                // No open shift Ã¢â€ â€™ activeShift stays null, Dashboard shows Buka Shift card
            } catch (e) {
                console.error('Shift restore failed:', e);
            }
        };
        restoreShift();
    }, [user?.id]);

    // Setup Data Synchronization Polling (Foreground for now)
    useEffect(() => {
        if (!user) return; // Only sync when logged in

        const syncData = async () => {
            try {
                // 1. Fetch Master Data
                console.log('Ã°Å¸â€â€ž Syncing master data...');
                const masterRes = await syncService.syncMasterData();
                if (masterRes.success) {
                    console.log('Ã¢Å“â€¦ Master data synced successfully');
                    
                    // Reload settings from SQLite into Zustand store after sync
                    try {
                        const db = await getDBConnection();
                        const [settingsRes] = await db.executeSql('SELECT * FROM settings');
                        const rowCount = settingsRes.rows.length;
                        let reloadedSettings: any = {
                            storeName: 'LitePOS', storeAddress: '', storePhone: '',
                            storeLogo: null, enablePreOrder: false, enableShift: true, enableDineTable: false,
                            showImages: true, printerAddress: null, printerType: null, theme: 'light',
                            allowNegativeStock: false, receiptFooter: '',
                            loyalty_active: false, loyalty_multiplier: 1, loyalty_multiplier_amount: 1000,
                            loyalty_point_value: 0, loyalty_min_points: 0,
                        };
                        for (let i = 0; i < rowCount; i++) {
                            const row = settingsRes.rows.item(i);
                            if (['showImages', 'enablePreOrder', 'enableShift', 'enableDineTable', 'allowNegativeStock', 'loyalty_active'].includes(row.key)) {
                                reloadedSettings[row.key] = row.value === 'true';
                            } else if (['loyalty_multiplier', 'loyalty_multiplier_amount', 'loyalty_point_value', 'loyalty_min_points'].includes(row.key)) {
                                reloadedSettings[row.key] = Number(row.value || 0);
                            } else {
                                reloadedSettings[row.key] = row.value || null;
                            }
                        }
                        setSettings(reloadedSettings);
                    } catch (reloadErr) {
                        console.error('Failed to reload settings after sync:', reloadErr);
                    }
                }

                // 2. Push Pending Local Transactions
                console.log('Ã°Å¸â€â€ž Pushing local data...');
                const pushRes = await syncService.pushLocalData();
                if (pushRes.success) {
                    if (pushRes.message === 'No local data to sync') {
                        console.log('Ã¢â€žÂ¹Ã¯Â¸Â No local data to push');
                    } else {
                        console.log('Ã¢Å“â€¦ Local data pushed successfully');
                    }
                } else {
                     console.log('Ã¢ÂÅ’ Failed to push local data:', pushRes.error);
                }

                // 3. Pull transaction history from server (30 days)
                console.log('Ã°Å¸â€â€ž Syncing transaction history...');
                const historyRes = await syncService.syncTransactionHistory();
                if (historyRes.success) {
                    console.log('Ã¢Å“â€¦ Transaction history synced');
                } else {
                    console.log('Ã¢Å¡Â Ã¯Â¸Â Transaction history sync failed:', historyRes.error);
                }

            } catch (error) {
                console.error('Ã¢ÂÅ’ Sync failed:', error);
            }
        };

        // Sync every 60 seconds
        const intervalId = setInterval(syncData, 60000);
        
        // Initial sync on startup
        syncData();

        return () => clearInterval(intervalId);
    }, [user]);

    // Trial popup logic
    useEffect(() => {
        const checkTrialPopup = async () => {
            if (settings.license_type !== 'TRIAL') return;
            try {
                const lastShown = await AsyncStorage.getItem('last_trial_popup');
                const now = new Date().getTime();
                if (!lastShown || now - parseInt(lastShown) > 12 * 60 * 60 * 1000) {
                    setShowTrialPopup(true);
                    await AsyncStorage.setItem('last_trial_popup', now.toString());
                }
            } catch (e) { }
        };
        if (settings.license_type === 'TRIAL') {
            setTimeout(checkTrialPopup, 1000);
        }
    }, [settings.license_type]);

    const isExpired = settings.license_expire_date ? new Date(settings.license_expire_date) < new Date() : false;

    return (
        <SafeAreaProvider>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colorScheme === 'dark' ? tw.color('gray-900') : tw.color('white')} />
            <SafeAreaView style={tw`flex-1 bg-white dark:bg-gray-900`}>
                <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        {isExpired ? (
                            <Stack.Screen name="Lock" component={LockScreen} />
                        ) : (
                            <>
                                <Stack.Screen name="Login" component={LoginScreen} />
                                <Stack.Screen name="Main" component={MainTabNavigator} />
                                <Stack.Screen name="POS" component={ShiftGuardedPOS} />
                                <Stack.Screen name="Checkout" component={CheckoutScreen} />
                                <Stack.Screen name="ReceiptPreview" component={ReceiptPreviewScreen} />
                                <Stack.Screen name="UserManagement" component={UserManagementScreen} />
                                <Stack.Screen name="StockReceiving" component={StockReceivingScreen} />
                                <Stack.Screen name="StockOpname" component={StockOpnameScreen} />
                                <Stack.Screen name="TableManagement" component={TableManagementScreen} />
                                <Stack.Screen name="Management" component={ManagementScreen} />
                                <Stack.Screen name="PackageList" component={PackageScreen} />
                                <Stack.Screen name="ProductList" component={ProductListScreen} />
                                <Stack.Screen name="CategoryList" component={CategoryListScreen} />
                                <Stack.Screen name="StockHistory" component={StockHistoryScreen} />
                            </>
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
                
                {/* Trial Watermark */}
                {settings.license_type === 'TRIAL' && !isExpired && (
                    <TouchableOpacity 
                        style={tw`absolute top-12 right-0 bg-red-600 px-3 py-1.5 rounded-l-full shadow-lg z-50 flex-row items-center opacity-90`}
                        onPress={() => setShowTrialPopup(true)}
                    >
                        <Icon name="clock-outline" size={12} color="white" style={tw`mr-1.5`} />
                        <Text style={tw`text-white text-xs font-black tracking-wider`}>TRIAL MODE</Text>
                    </TouchableOpacity>
                )}

                {/* Trial Pop-up Modal */}
                <Modal visible={showTrialPopup} transparent animationType="fade">
                    <View style={tw`flex-1 bg-black/60 justify-center items-center px-6`}>
                        <View style={tw`bg-white dark:bg-gray-800 p-8 rounded-3xl w-full max-w-sm items-center shadow-2xl border border-gray-100 dark:border-gray-700`}>
                            <View style={tw`bg-red-50 dark:bg-red-900/30 p-4 rounded-full mb-5`}>
                                <Icon name="shield-alert-outline" size={48} color={tw.color('red-500')} />
                            </View>
                            <Text style={tw`text-xl font-black text-gray-800 dark:text-gray-100 text-center mb-3`}>Anda dalam Masa Trial</Text>
                            <Text style={tw`text-sm text-gray-500 dark:text-gray-400 text-center leading-5 mb-8`}>
                                Terimakasih telah mencoba aplikasi kami! Masa trial ini berlaku selama 14 hari. Ingin terus menggunakan semua fitur tanpa batas?
                            </Text>
                            
                            <View style={tw`w-full mb-5`}>
                                <Text style={tw`text-xs font-bold text-gray-500 mb-1`}>Masukkan Kode Aktivasi (ID: {settings.store_id || 'UNKNOWN'})</Text>
                                <TextInput
                                    style={tw`w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 font-bold tracking-widest text-center`}
                                    placeholder="Contoh: A4B1"
                                    value={activationCode}
                                    onChangeText={setActivationCode}
                                    autoCapitalize="characters"
                                    maxLength={4}
                                />
                            </View>

                            <TouchableOpacity 
                                style={tw`w-full bg-blue-600 py-4 rounded-xl items-center mb-3`} 
                                onPress={handleActivate}
                            >
                                <Text style={tw`text-white font-black text-lg`}>Aktifkan</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={tw`w-full py-3 items-center`} onPress={() => setShowTrialPopup(false)}>
                                <Text style={tw`text-gray-500 dark:text-gray-400 font-bold`}>Tutup</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

export default App;






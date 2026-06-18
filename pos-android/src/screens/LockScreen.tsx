import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, BackHandler, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw, { useAppColorScheme } from 'twrnc';
import { getDBConnection } from '../database/db';
import { useStore } from '../store/useStore';

// Simple Hash Function (DJB2) for offline signature verification
const generateSignature = (storeId: string, days: string) => {
    useAppColorScheme(tw);
    const str = storeId + days + "LITE_SECRET_2026";
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return Math.abs(hash).toString(16).toUpperCase().substring(0, 4).padStart(4, '0');
};

const LockScreen = ({ navigation }: any) => {
    const [activationCode, setActivationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const settings = useStore((state) => state.settings);
    const setSettings = useStore((state) => state.setSettings);

    const storeId = settings.store_id || 'UNKNOWN';

    // Disable hardware back button on Android
    useEffect(() => {
        const backAction = () => {
            Alert.alert("Aplikasi Terkunci", "Harap masukkan kode aktivasi untuk melanjutkan.");
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, []);

    const handleActivate = async () => {
        const code = activationCode.trim().toUpperCase();
        if (code.length < 4) {
            Alert.alert("Kode Tidak Valid", "Kode aktivasi terlalu pendek.");
            return;
        }

        // Daftar paket langganan umum (dalam hari)
        const supportedDays = [14, 30, 60, 90, 180, 360, 365, 720, 1000];
        let matchedDays = 0;

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

        // VALID! Update expire date
        setIsLoading(true);
        try {
            const db = await getDBConnection();
            const days = matchedDays;
            
            // Calculate new expire date (if currently expired, start from today. If still active, extend it).
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
            
            // Update global state
            setSettings({ ...settings, license_expire_date: newExpireISO, license_type: 'PREMIUM' });

            Alert.alert("Berhasil", `Aplikasi berhasil diaktivasi ulang (+${days} Hari).`, [
                {
                    text: 'Lanjutkan', onPress: () => {
                        navigation.replace('Login');
                    }
                }
            ]);

        } catch (error) {
            console.error("Activation error", error);
            Alert.alert("Error", "Terjadi kesalahan saat menyimpan lisensi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={tw`flex-1 bg-gray-900 justify-center items-center px-6`}>
            <View style={tw`bg-gray-800 p-8 rounded-3xl w-full max-w-sm items-center shadow-2xl border border-gray-700`}>
                <View style={tw`bg-red-500/20 p-4 rounded-full mb-6`}>
                    <Icon name="lock" size={48} color={tw.color('red-400')} />
                </View>
                
                <Text style={tw`text-2xl font-black text-white text-center mb-2`}>
                    Masa Aktif Berakhir
                </Text>
                
                <Text style={tw`text-sm text-gray-400 text-center mb-6 leading-5`}>
                    Masa berlaku aplikasi untuk mesin ini telah habis. Silakan hubungi penyedia aplikasi untuk perpanjangan.
                </Text>

                <View style={tw`bg-gray-900 w-full rounded-xl p-4 mb-6 border border-gray-700`}>
                    <Text style={tw`text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider`}>ID Mesin / Toko</Text>
                    <Text style={tw`text-xl font-black text-white tracking-widest`}>{storeId}</Text>
                </View>

                <View style={tw`w-full mb-6`}>
                    <Text style={tw`text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider ml-1`}>Kode Aktivasi</Text>
                    <View style={tw`flex-row items-center bg-gray-900 border border-gray-700 rounded-xl px-4 py-1`}>
                        <Icon name="key" size={18} color={tw.color('gray-500')} style={tw`mr-3`} />
                        <TextInput
                            style={tw`flex-1 py-3 text-white text-lg font-bold tracking-widest`}
                            placeholder="Contoh: A4B1"
                            placeholderTextColor={tw.color('gray-600')}
                            value={activationCode}
                            onChangeText={setActivationCode}
                            autoCapitalize="characters"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={tw`w-full bg-blue-600 py-4 rounded-xl flex-row justify-center items-center ${isLoading ? 'opacity-70' : ''}`}
                    onPress={handleActivate}
                    disabled={isLoading || activationCode.trim() === ''}
                >
                    <Icon name="check-circle" size={20} color="white" style={tw`mr-2`} />
                    <Text style={tw`text-white font-bold text-lg`}>
                        {isLoading ? 'Memproses...' : 'Aktivasi Aplikasi'}
                    </Text>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
};

export default LockScreen;

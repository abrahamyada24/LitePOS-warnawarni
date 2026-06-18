import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View, Text, TouchableOpacity, FlatList, TextInput,
    Alert, useWindowDimensions, Modal, ScrollView,
    PermissionsAndroid, Platform
} from 'react-native';
import tw, { useAppColorScheme } from 'twrnc';
import { getDBConnection } from '../database/db';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStore } from '../store/useStore';
import { Camera, CameraType } from 'react-native-camera-kit';

interface OpnameRow {
    id: number;
    name: string;
    catName: string;
    systemStock: number;
    physicalQty: string; // string for TextInput
    isUnlimited: boolean;
    barcode?: string | null;
}

export default function StockOpnameScreen({ navigation, isEmbedded }: any) {
    useAppColorScheme(tw);
    const { height: screenH } = useWindowDimensions();
    const user = useStore(s => s.user);

    const [rows, setRows] = useState<OpnameRow[]>([]);
    const [search, setSearch] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Barcode Scanner State (text input based)
    const [showScanner, setShowScanner] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [scannedAlert, setScannedAlert] = useState<string | null>(null);
    const [barcodeInput, setBarcodeInput] = useState('');
    const barcodeInputRef = useRef<TextInput>(null);

    const handleBarcodeSubmit = useCallback((code: string) => {
        const trimmed = code.trim();
        if (!trimmed) return;

        const target = rows.find(r => r.barcode === trimmed);
        if (!target) {
            Alert.alert('Tidak Ditemukan', `Barcode "${trimmed}" tidak terdaftar di sistem.`);
            setBarcodeInput('');
            setTimeout(() => barcodeInputRef.current?.focus(), 300);
            return;
        }

        setRows(prev => prev.map(r => {
            if (r.id === target.id) {
                const current = r.physicalQty ? parseInt(r.physicalQty, 10) : r.systemStock;
                return { ...r, physicalQty: String(current + 1) };
            }
            return r;
        }));
        Alert.alert('Sukses', `Barcode ${trimmed} → ${target.name}. Stok fisik +1.`);
        setBarcodeInput('');
        setTimeout(() => barcodeInputRef.current?.focus(), 300);
    }, [rows]);

    const handleOpenCamera = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "Izin Kamera",
                        message: "Aplikasi membutuhkan izin kamera untuk scan barcode.",
                        buttonNeutral: "Nanti",
                        buttonNegative: "Batal",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setShowCamera(true);
                } else {
                    Alert.alert('Izin Ditolak', 'Akses kamera dibutuhkan untuk scan barcode.');
                }
            } catch (err) {
                console.warn(err);
            }
        } else {
            setShowCamera(true);
        }
    };

    const load = useCallback(async () => {
        const db = await getDBConnection();
        const [res] = await db.executeSql(
            `SELECT p.id, p.name, p.stock, p.isUnlimitedStock, p.barcode, c.name as catName
             FROM products p LEFT JOIN categories c ON c.id = p.categoryId
             ORDER BY c.name, p.name`
        );
        const arr: OpnameRow[] = [];
        for (let i = 0; i < res.rows.length; i++) {
            const r = res.rows.item(i);
            arr.push({
                id: r.id,
                name: r.name,
                catName: r.catName || 'Tanpa Kategori',
                systemStock: r.isUnlimitedStock ? -1 : r.stock,
                physicalQty: '',
                isUnlimited: r.isUnlimitedStock === 1,
                barcode: r.barcode,
            });
        }
        setRows(arr);
        setIsSaved(false);
    }, []);

    useEffect(() => { load(); }, []);

    const updatePhysical = (id: number, val: string) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, physicalQty: val.replace(/[^0-9]/g, '') } : r));
    };

    // Only rows that have been filled in
    const filledRows = rows.filter(r => r.physicalQty !== '' && !r.isUnlimited);
    const discrepancies = filledRows.filter(r => parseInt(r.physicalQty, 10) !== r.systemStock);

    const filteredRows = rows.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.catName.toLowerCase().includes(search.toLowerCase())
    );

    const handleConfirm = async () => {
        if (filledRows.length === 0) {
            Alert.alert('Kosong', 'Belum ada stok fisik yang diinput. Isi kolom "Fisik" untuk produk yang ingin diperbarui.');
            return;
        }
        setShowSummary(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setShowSummary(false);
        try {
            const db = await getDBConnection();
            for (const row of filledRows) {
                const phys = parseInt(row.physicalQty, 10);
                await db.executeSql(
                    `UPDATE products SET stock = ? WHERE id = ?`, [phys, row.id]
                );
            }
            setIsSaved(true);
            Alert.alert(
                'Stock Opname Selesai',
                `${filledRows.length} produk berhasil diperbarui.\n${discrepancies.length} produk memiliki selisih stok.`,
                [{ text: 'OK', onPress: () => load() }]
            );
        } catch (e) {
            Alert.alert('Error', 'Gagal menyimpan stock opname.');
        } finally {
            setIsSaving(false);
        }
    };

    const filledCount = filledRows.length;
    const totalProducts = rows.filter(r => !r.isUnlimited).length;

    return (
        <View style={tw`flex-1 bg-gray-50 dark:bg-gray-900`}>
            {/* Header */}
            <View style={tw`bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700`}>
                <View style={tw`flex-row items-center mb-2`}>
                    {!isEmbedded && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 mr-2`}>
                            <Icon name="arrow-left" size={24} color={tw.color('gray-700')} />
                        </TouchableOpacity>
                    )}
                    <View style={tw`flex-1`}>
                        <Text style={tw`${isEmbedded ? 'text-base' : 'text-lg'} font-black text-gray-800 dark:text-gray-100`}>Stock Opname</Text>
                        <Text style={tw`${isEmbedded ? 'text-[10px]' : 'text-xs'} text-gray-500`}>Hitung stok fisik dan sesuaikan sistem</Text>
                    </View>
                    {filledCount > 0 && (
                        <TouchableOpacity
                            onPress={handleConfirm}
                            style={tw`bg-orange-500 px-4 py-2 rounded-xl flex-row items-center`}
                            disabled={isSaving}
                        >
                            <Icon name="content-save" size={16} color="white" style={tw`mr-1`} />
                            <Text style={tw`text-white font-bold text-sm`}>Simpan ({filledCount})</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Progress bar */}
                <View style={tw`flex-row items-center mt-1`}>
                    <View style={tw`flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mr-3`}>
                        <View style={[tw`h-full bg-orange-400 rounded-full`, {
                            width: totalProducts > 0 ? `${(filledCount / totalProducts) * 100}%` : '0%'
                        }]} />
                    </View>
                    <Text style={tw`text-xs font-bold text-gray-500`}>{filledCount}/{totalProducts} diisi</Text>
                </View>

                {/* Discrepancy badge */}
                {filledCount > 0 && discrepancies.length > 0 && (
                    <View style={tw`flex-row items-center mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5`}>
                        <Icon name="alert" size={14} color={tw.color('red-500')} style={tw`mr-2`} />
                        <Text style={tw`text-red-600 font-bold text-xs`}>{discrepancies.length} produk memiliki selisih stok</Text>
                    </View>
                )}
            </View>

            {/* Search */}
            <View style={tw`px-4 pt-3 pb-2 flex-row items-center`}>
                <View style={tw`flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4`}>
                    <TextInput
                        style={tw`py-3 text-gray-800 dark:text-gray-100`}
                        placeholder="Cari produk atau kategori..."
                        placeholderTextColor={tw.color('gray-400')}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity
                    style={tw`ml-3 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl border border-blue-200 dark:border-blue-800`}
                    onPress={() => { setBarcodeInput(''); setShowScanner(true); setTimeout(() => barcodeInputRef.current?.focus(), 300); }}
                >
                    <Icon name="barcode-scan" size={24} color={tw.color('blue-600')} />
                </TouchableOpacity>
            </View>

            {/* Barcode Input Modal */}
            <Modal visible={showScanner} animationType="slide" transparent>
                <View style={tw`flex-1 bg-black/60 justify-center items-center px-6`}>
                    <View style={tw`bg-white dark:bg-gray-800 rounded-2xl w-full p-5 shadow-lg`}>
                        {showCamera ? (
                            <View style={tw`w-full h-96 rounded-2xl overflow-hidden relative bg-black`}>
                                <Camera
                                    style={tw`flex-1`}
                                    cameraType={CameraType.Back}
                                    scanBarcode={true}
                                    showFrame={true}
                                    laserColor="red"
                                    frameColor="white"
                                    onReadCode={(event: any) => {
                                        const code = event.nativeEvent.codeStringValue;
                                        handleBarcodeSubmit(code);
                                        setShowCamera(false);
                                    }}
                                />
                                <TouchableOpacity
                                    style={tw`absolute top-4 right-4 bg-black/50 p-2 rounded-full`}
                                    onPress={() => setShowCamera(false)}
                                >
                                    <Icon name="close" size={24} color="white" />
                                </TouchableOpacity>
                                <View style={tw`absolute bottom-4 left-0 right-0 items-center`}>
                                    <Text style={tw`text-white bg-black/50 px-4 py-2 rounded-xl text-xs font-bold`}>Arahkan ke Barcode</Text>
                                </View>
                            </View>
                        ) : (
                            <>
                                <View style={tw`flex-row justify-between items-center mb-4`}>
                                    <Text style={tw`text-lg font-black text-gray-800 dark:text-gray-100`}>Scan Barcode</Text>
                                    <TouchableOpacity onPress={() => setShowScanner(false)} style={tw`p-2`}>
                                        <Icon name="close" size={20} color={tw.color('gray-500')} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={tw`bg-gray-100 dark:bg-gray-700 py-4 rounded-xl items-center flex-row justify-center mb-4 border border-gray-200 dark:border-gray-600`}
                                    onPress={handleOpenCamera}
                                >
                                    <Icon name="camera" size={24} color={tw.color('gray-700')} style={tw`mr-3`} />
                                    <Text style={tw`text-gray-800 dark:text-gray-100 font-bold text-base`}>Gunakan Kamera HP</Text>
                                </TouchableOpacity>

                                <View style={tw`flex-row items-center justify-center my-2`}>
                                    <View style={tw`flex-1 h-px bg-gray-200 dark:bg-gray-700`} />
                                    <Text style={tw`px-3 text-xs text-gray-400 font-bold uppercase`}>ATAU USB/MANUAL</Text>
                                    <View style={tw`flex-1 h-px bg-gray-200 dark:bg-gray-700`} />
                                </View>

                                <Text style={tw`text-[10px] text-center text-gray-500 mb-3 mt-2`}>Ketik manual atau scan dengan alat Eksternal</Text>
                                <TextInput
                                    ref={barcodeInputRef}
                                    style={tw`border-2 border-blue-400 rounded-xl px-4 py-3 text-lg font-bold text-gray-800 dark:text-gray-100 bg-blue-50 dark:bg-gray-700 mb-3 text-center tracking-widest`}
                                    placeholder="Input barcode..."
                                    placeholderTextColor={tw.color('gray-400')}
                                    value={barcodeInput}
                                    onChangeText={setBarcodeInput}
                                    returnKeyType="done"
                                    onSubmitEditing={() => handleBarcodeSubmit(barcodeInput)}
                                />
                                <TouchableOpacity
                                    style={tw`bg-blue-600 py-3 rounded-xl items-center shadow-md`}
                                    onPress={() => handleBarcodeSubmit(barcodeInput)}
                                >
                                    <Text style={tw`text-white font-bold text-base`}>Proses</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Column headers */}
            <View style={tw`flex-row px-4 pb-2`}>
                <Text style={tw`flex-1 text-[10px] font-black text-gray-400 uppercase tracking-widest`}>Produk</Text>
                <Text style={tw`w-20 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest`}>Sistem</Text>
                <Text style={tw`w-24 text-center text-[10px] font-black text-orange-400 uppercase tracking-widest`}>Fisik</Text>
                <Text style={tw`w-16 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest`}>Selisih</Text>
            </View>

            <FlatList
                data={filteredRows}
                keyExtractor={r => String(r.id)}
                contentContainerStyle={tw`px-4 pb-24`}
                ListEmptyComponent={() => (
                    <View style={tw`items-center py-16`}>
                        <Icon name="package-variant" size={48} color={tw.color('gray-200')} />
                        <Text style={tw`text-gray-400 font-bold mt-4`}>Tidak ada produk ditemukan</Text>
                    </View>
                )}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                    const physNum = item.physicalQty !== '' ? parseInt(item.physicalQty, 10) : null;
                    const selisih = physNum !== null && !item.isUnlimited ? physNum - item.systemStock : null;
                    const hasDiff = selisih !== null && selisih !== 0;

                    return (
                        <View style={[
                            tw`flex-row items-center py-3 border-b border-gray-100 dark:border-gray-800`,
                            hasDiff ? tw`bg-red-50 dark:bg-red-900/10 rounded-lg px-2 -mx-2 mb-1` : {}
                        ]}>
                            <View style={tw`flex-1 mr-2`}>
                                <Text style={tw`font-bold text-gray-800 dark:text-gray-100 text-sm`} numberOfLines={1}>{item.name}</Text>
                                <Text style={tw`text-[10px] text-gray-400`}>{item.catName}</Text>
                            </View>
                            {/* System stock */}
                            <View style={tw`w-20 items-center`}>
                                <Text style={tw`font-black text-gray-600 dark:text-gray-400`}>
                                    {item.isUnlimited ? '∞' : item.systemStock}
                                </Text>
                            </View>
                            {/* Physical input */}
                            <View style={tw`w-24 items-center`}>
                                {item.isUnlimited ? (
                                    <Text style={tw`text-gray-300 text-sm`}>—</Text>
                                ) : (
                                    <TextInput
                                        style={[
                                            tw`border rounded-lg px-2 py-1 text-center font-bold w-20 text-gray-800 dark:text-gray-100`,
                                            physNum !== null
                                                ? hasDiff ? tw`border-red-400 bg-red-50 dark:bg-red-900/20` : tw`border-green-400 bg-green-50 dark:bg-green-900/20`
                                                : tw`border-orange-300 bg-orange-50 dark:bg-orange-900/10`
                                        ]}
                                        keyboardType="numeric"
                                        placeholder="—"
                                        placeholderTextColor={tw.color('orange-300')}
                                        value={item.physicalQty}
                                        onChangeText={t => updatePhysical(item.id, t)}
                                    />
                                )}
                            </View>
                            {/* Discrepancy */}
                            <View style={tw`w-16 items-center`}>
                                {selisih !== null ? (
                                    <View style={tw`flex-row items-center`}>
                                        {selisih === 0 ? (
                                            <Icon name="check-circle" size={16} color={tw.color('green-500')} />
                                        ) : (
                                            <Text style={[
                                                tw`font-black text-sm`,
                                                selisih > 0 ? tw`text-green-600` : tw`text-red-500`
                                            ]}>
                                                {selisih > 0 ? '+' : ''}{selisih}
                                            </Text>
                                        )}
                                    </View>
                                ) : (
                                    <Text style={tw`text-gray-300 text-lg`}>·</Text>
                                )}
                            </View>
                        </View>
                    );
                }}
            />

            {/* Summary Modal */}
            <Modal visible={showSummary} transparent animationType="fade">
                <View style={tw`flex-1 bg-black/60 justify-center px-5`}>
                    <View style={[tw`bg-white dark:bg-gray-800 rounded-3xl overflow-hidden`, { maxHeight: screenH * 0.85 }]}>
                        <View style={tw`px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-row justify-between items-center`}>
                            <Text style={tw`font-black text-gray-800 dark:text-gray-100 text-lg`}>Konfirmasi Opname</Text>
                            <TouchableOpacity onPress={() => setShowSummary(false)} style={tw`p-2 bg-gray-100 dark:bg-gray-700 rounded-full`}>
                                <Icon name="close" size={20} color={tw.color('gray-600')} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={tw`p-5`}>
                            <View style={tw`flex-row items-center bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4`}>
                                <Icon name="alert" size={16} color={tw.color('orange-500')} style={tw`mr-2`} />
                                <Text style={tw`font-bold text-orange-700 text-sm flex-1`}>Perhatian: Stok sistem akan diganti dengan stok fisik yang Anda input. Tindakan ini tidak dapat dibatalkan.</Text>
                            </View>

                            <Text style={tw`font-bold text-gray-700 dark:text-gray-200 mb-3 text-sm`}>
                                {filledRows.length} produk akan diperbarui:
                            </Text>
                            {filledRows.map(row => {
                                const phys = parseInt(row.physicalQty, 10);
                                const diff = phys - row.systemStock;
                                return (
                                    <View key={row.id} style={tw`flex-row justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800`}>
                                        <Text style={tw`flex-1 text-sm text-gray-800 dark:text-gray-100 mr-2`} numberOfLines={1}>{row.name}</Text>
                                        <Text style={tw`text-sm text-gray-500`}>
                                            {row.systemStock} → <Text style={tw`font-black text-gray-800 dark:text-gray-100`}>{phys}</Text>
                                        </Text>
                                        <View style={tw`ml-3 w-12 items-end`}>
                                            {diff === 0
                                                ? <Icon name="check" size={16} color={tw.color('green-600')} />
                                                : <Text style={[tw`font-black text-sm`, diff > 0 ? tw`text-blue-600` : tw`text-red-500`]}>
                                                    {(diff > 0 ? '+' : '') + diff}
                                                </Text>
                                            }
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                        <View style={tw`px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800 flex-row gap-3`}>
                            <TouchableOpacity
                                style={tw`flex-1 border border-gray-200 dark:border-gray-600 py-3 rounded-xl items-center`}
                                onPress={() => setShowSummary(false)}
                            >
                                <Text style={tw`font-bold text-gray-600 dark:text-gray-300`}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={tw`flex-1 bg-orange-500 py-3 rounded-xl items-center`}
                                onPress={handleSave}
                                disabled={isSaving}
                            >
                                <Icon name="check" size={16} color="white" style={tw`mr-1`} />
                                <Text style={tw`font-bold text-white`}>Terapkan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

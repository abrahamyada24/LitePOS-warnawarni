/**
 * StockReceivingScreen — Penerimaan Barang
 * Pilih produk → input qty diterima → simpan → stok bertambah otomatis
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, FlatList, TextInput,
    Alert, Modal, ScrollView, useWindowDimensions
} from 'react-native';
import tw, { useAppColorScheme } from 'twrnc';
import { getDBConnection } from '../database/db';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStore } from '../store/useStore';

const formatRp = (n: number) => 'Rp ' + (Math.round(n) || 0).toLocaleString('id-ID');

interface CartItem {
    productId: number;
    name: string;
    currentStock: number;
    qtyAdded: number;
    costPrice: number;
}

export default function StockReceivingScreen({ navigation, isEmbedded }: any) {
    useAppColorScheme(tw);
    const { height: screenH } = useWindowDimensions();
    const user = useStore(s => s.user);

    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [notes, setNotes] = useState('');
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [search, setSearch] = useState('');
    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const loadProducts = useCallback(async () => {
        const db = await getDBConnection();
        const [res] = await db.executeSql(
            `SELECT p.id, p.name, p.stock, p.costPrice, p.isUnlimitedStock, c.name as catName
             FROM products p LEFT JOIN categories c ON c.id = p.categoryId
             ORDER BY p.name`
        );
        const arr: any[] = [];
        for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
        setProducts(arr);
    }, []);

    const loadHistory = useCallback(async () => {
        const db = await getDBConnection();
        const [res] = await db.executeSql(
            `SELECT sr.*, GROUP_CONCAT(sri.productName || ' (+' || sri.quantityAdded || ')') as items
             FROM stock_receipts sr
             LEFT JOIN stock_receipt_items sri ON sri.receiptId = sr.id
             GROUP BY sr.id ORDER BY sr.receivedAt DESC LIMIT 30`
        );
        const arr: any[] = [];
        for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
        setHistory(arr);
    }, []);

    useEffect(() => { loadProducts(); loadHistory(); }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = (product: any) => {
        const exists = cart.find(c => c.productId === product.id);
        if (exists) {
            setCart(prev => prev.map(c =>
                c.productId === product.id ? { ...c, qtyAdded: c.qtyAdded + 1 } : c
            ));
        } else {
            setCart(prev => [...prev, {
                productId: product.id,
                name: product.name,
                currentStock: product.isUnlimitedStock ? -1 : product.stock,
                qtyAdded: 1,
                costPrice: product.costPrice || 0,
            }]);
        }
        setShowProductPicker(false);
        setSearch('');
    };

    const updateQty = (productId: number, qty: number) => {
        if (qty <= 0) {
            setCart(prev => prev.filter(c => c.productId !== productId));
        } else {
            setCart(prev => prev.map(c =>
                c.productId === productId ? { ...c, qtyAdded: qty } : c
            ));
        }
    };

    const updateCost = (productId: number, cost: string) => {
        const val = parseFloat(cost.replace(/[^0-9]/g, '') || '0');
        setCart(prev => prev.map(c =>
            c.productId === productId ? { ...c, costPrice: val } : c
        ));
    };

    const handleSave = async () => {
        if (cart.length === 0) {
            Alert.alert('Kosong', 'Belum ada produk yang ditambahkan.');
            return;
        }
        setIsSaving(true);
        try {
            const db = await getDBConnection();
            const receiptId = `RCV-${Date.now()}`;
            const now = new Date().toISOString();

            await db.executeSql(
                `INSERT INTO stock_receipts (id, receivedAt, notes, createdBy) VALUES (?, ?, ?, ?)`,
                [receiptId, now, notes.trim(), user?.name || 'Admin']
            );

            for (const item of cart) {
                // Get current stock
                const [stockRes] = await db.executeSql(
                    `SELECT stock, isUnlimitedStock FROM products WHERE id = ?`, [item.productId]
                );
                const currentStock = stockRes.rows.item(0)?.stock || 0;
                const isUnlimited = stockRes.rows.item(0)?.isUnlimitedStock === 1;

                // Insert receipt item
                await db.executeSql(
                    `INSERT INTO stock_receipt_items (receiptId, productId, productName, quantityBefore, quantityAdded, costPrice)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [receiptId, item.productId, item.name, currentStock, item.qtyAdded, item.costPrice]
                );

                // Update product stock (only if not unlimited)
                if (!isUnlimited) {
                    await db.executeSql(
                        `UPDATE products SET stock = stock + ? WHERE id = ?`,
                        [item.qtyAdded, item.productId]
                    );
                }

                // Optionally update costPrice
                if (item.costPrice > 0) {
                    await db.executeSql(
                        `UPDATE products SET costPrice = ? WHERE id = ?`,
                        [item.costPrice, item.productId]
                    );
                }
            }

            const totalItems = cart.reduce((s, c) => s + c.qtyAdded, 0);
            Alert.alert('Berhasil', `${totalItems} unit dari ${cart.length} produk berhasil ditambahkan ke stok!`);
            setCart([]);
            setNotes('');
            loadProducts();
            loadHistory();
        } catch (e) {
            Alert.alert('Error', 'Gagal menyimpan penerimaan barang.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={tw`flex-1 bg-gray-50 dark:bg-gray-900`}>
            {/* Header */}
            {!isEmbedded ? (
                <View style={tw`bg-white dark:bg-gray-800 px-4 py-3 flex-row items-center border-b border-gray-200 dark:border-gray-700`}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 mr-2`}>
                        <Icon name="arrow-left" size={24} color={tw.color('gray-700')} />
                    </TouchableOpacity>
                    <View style={tw`flex-1`}>
                        <Text style={tw`text-lg font-black text-gray-800 dark:text-gray-100`}>Penerimaan Barang</Text>
                        <Text style={tw`text-xs text-gray-500`}>Tambah stok dari supplier / gudang</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => { loadHistory(); setShowHistory(true); }}
                        style={tw`px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl flex-row items-center`}
                    >
                        <Icon name="clock-outline" size={14} color={tw.color('gray-600')} style={tw`mr-1`} />
                        <Text style={tw`text-xs font-bold text-gray-600 dark:text-gray-300`}>Histori</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={tw`bg-white dark:bg-gray-800 px-4 py-3 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700`}>
                    <View style={tw`flex-1`}>
                        <Text style={tw`text-base font-black text-gray-800 dark:text-gray-100`}>Penerimaan Barang</Text>
                        <Text style={tw`text-[10px] text-gray-500`}>Catat barang masuk dari supplier</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => { loadHistory(); setShowHistory(true); }}
                        style={tw`px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl flex-row items-center`}
                    >
                        <Icon name="clock-outline" size={14} color={tw.color('gray-600')} style={tw`mr-1`} />
                        <Text style={tw`text-xs font-bold text-gray-600 dark:text-gray-300`}>Histori</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView contentContainerStyle={tw`p-4 pb-32`}>
                {/* Cart items */}
                {cart.length === 0 ? (
                    <View style={tw`items-center py-12`}>
                        <Icon name="package-variant" size={56} color={tw.color('gray-200')} />
                        <Text style={tw`text-gray-400 font-bold mt-4 text-base`}>Belum ada produk</Text>
                        <Text style={tw`text-gray-400 text-sm text-center mt-1`}>Tap tombol di bawah untuk pilih produk</Text>
                    </View>
                ) : (
                    <>
                        <Text style={tw`font-bold text-gray-700 dark:text-gray-200 mb-3 text-sm`}>
                            Produk yang Diterima ({cart.length} produk)
                        </Text>
                        {cart.map(item => (
                            <View key={item.productId} style={tw`bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700 shadow-sm`}>
                                <View style={tw`flex-row justify-between items-start mb-3`}>
                                    <View style={tw`flex-1 mr-2`}>
                                        <Text style={tw`font-bold text-gray-800 dark:text-gray-100`}>{item.name}</Text>
                                        <Text style={tw`text-xs text-gray-500 dark:text-gray-400 mt-0.5`}>
                                            Stok saat ini: <Text style={tw`font-bold text-blue-600`}>{item.currentStock === -1 ? '∞' : item.currentStock}</Text>
                                            {' → '}
                                            <Text style={tw`font-bold text-green-600`}>
                                                {item.currentStock === -1 ? '∞' : item.currentStock + item.qtyAdded}
                                            </Text>
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setCart(prev => prev.filter(c => c.productId !== item.productId))}>
                                        <Icon name="delete-outline" size={18} color={tw.color('red-400')} />
                                    </TouchableOpacity>
                                </View>

                                <View style={tw`flex-row items-center gap-3`}>
                                    {/* Qty control */}
                                    <View style={tw`flex-row items-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden`}>
                                        <TouchableOpacity
                                            onPress={() => updateQty(item.productId, item.qtyAdded - 1)}
                                            style={tw`px-3 py-2 bg-gray-100 dark:bg-gray-700`}
                                        >
                                            <Icon name="minus" size={16} color={tw.color('gray-600')} />
                                        </TouchableOpacity>
                                        <TextInput
                                            style={tw`px-3 py-2 text-center font-black text-gray-800 dark:text-gray-100 w-12`}
                                            keyboardType="numeric"
                                            value={String(item.qtyAdded)}
                                            onChangeText={t => updateQty(item.productId, parseInt(t.replace(/[^0-9]/g, '') || '0', 10))}
                                        />
                                        <TouchableOpacity
                                            onPress={() => updateQty(item.productId, item.qtyAdded + 1)}
                                            style={tw`px-3 py-2 bg-gray-100 dark:bg-gray-700`}
                                        >
                                            <Icon name="plus" size={16} color={tw.color('gray-600')} />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={tw`text-xs text-gray-500 font-bold`}>unit</Text>

                                    {/* Cost price */}
                                    <View style={tw`flex-1 flex-row items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden`}>
                                        <View style={tw`bg-gray-100 dark:bg-gray-700 px-2 py-2`}>
                                            <Text style={tw`text-xs font-bold text-gray-500`}>Rp</Text>
                                        </View>
                                        <TextInput
                                            style={tw`flex-1 px-2 py-2 text-xs text-gray-800 dark:text-gray-100`}
                                            keyboardType="numeric"
                                            placeholder="Harga beli"
                                            placeholderTextColor={tw.color('gray-400')}
                                            value={item.costPrice > 0 ? item.costPrice.toLocaleString('id-ID') : ''}
                                            onChangeText={t => updateCost(item.productId, t)}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {/* Notes */}
                {cart.length > 0 && (
                    <View style={tw`bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700`}>
                        <Text style={tw`font-bold text-gray-700 dark:text-gray-200 mb-2 text-sm`}>Catatan (opsional)</Text>
                        <TextInput
                            style={tw`bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700`}
                            placeholder="Contoh: Dari supplier A, invoice #..."
                            placeholderTextColor={tw.color('gray-400')}
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                        />
                    </View>
                )}

                {/* Summary */}
                {cart.length > 0 && (
                    <View style={tw`bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-2xl p-4 mb-3`}>
                        <Text style={tw`font-bold text-green-700 text-sm mb-2`}>Ringkasan</Text>
                        <View style={tw`flex-row justify-between`}>
                            <Text style={tw`text-gray-600 dark:text-gray-300 text-sm`}>Total produk</Text>
                            <Text style={tw`font-bold text-gray-800 dark:text-gray-100 text-sm`}>{cart.length} jenis</Text>
                        </View>
                        <View style={tw`flex-row justify-between mt-1`}>
                            <Text style={tw`text-gray-600 dark:text-gray-300 text-sm`}>Total unit masuk</Text>
                            <Text style={tw`font-black text-green-600 text-sm`}>+{cart.reduce((s, c) => s + c.qtyAdded, 0)} unit</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Bottom bar */}
            <View style={tw`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex-row gap-3`}>
                <TouchableOpacity
                    style={tw`flex-1 border border-blue-600 py-3 rounded-xl flex-row items-center justify-center`}
                    onPress={() => setShowProductPicker(true)}
                >
                    <Icon name="plus" size={18} color={tw.color('blue-600')} style={tw`mr-1`} />
                    <Text style={tw`font-bold text-blue-600`}>Tambah Produk</Text>
                </TouchableOpacity>
                {cart.length > 0 && (
                    <TouchableOpacity
                        style={tw`flex-1 bg-blue-600 py-3 rounded-xl flex-row items-center justify-center ${isSaving ? 'opacity-50' : ''}`}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        <Icon name="content-save" size={18} color="white" style={tw`mr-1`} />
                        <Text style={tw`font-bold text-white`}>Simpan</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Product picker modal */}
            <Modal visible={showProductPicker} transparent animationType="slide">
                <View style={tw`flex-1 bg-black/60 justify-end`}>
                    <View style={[tw`bg-white dark:bg-gray-800 rounded-t-3xl flex-col`, { maxHeight: screenH * 0.85 }]}>
                        <View style={tw`flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800`}>
                            <Text style={tw`font-black text-lg text-gray-800 dark:text-gray-100`}>Pilih Produk</Text>
                            <TouchableOpacity onPress={() => { setShowProductPicker(false); setSearch(''); }} style={tw`p-2 bg-gray-100 dark:bg-gray-700 rounded-full`}>
                                <Icon name="close" size={20} color={tw.color('gray-600')} />
                            </TouchableOpacity>
                        </View>
                        <View style={tw`px-4 py-3`}>
                            <TextInput
                                style={tw`bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100`}
                                placeholder="Cari nama produk..."
                                placeholderTextColor={tw.color('gray-400')}
                                value={search}
                                onChangeText={setSearch}
                                autoFocus
                            />
                        </View>
                        <FlatList
                            data={filteredProducts}
                            keyExtractor={i => String(i.id)}
                            contentContainerStyle={tw`px-4 pb-8`}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => {
                                const inCart = cart.find(c => c.productId === item.id);
                                return (
                                    <TouchableOpacity
                                        onPress={() => addToCart(item)}
                                        style={tw`flex-row justify-between items-center p-4 mb-2 rounded-xl border ${inCart ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900'}`}
                                    >
                                        <View style={tw`flex-1`}>
                                            <Text style={tw`font-bold text-gray-800 dark:text-gray-100`}>{item.name}</Text>
                                            <Text style={tw`text-xs text-gray-500 dark:text-gray-400 mt-0.5`}>
                                                {item.catName || 'Tanpa Kategori'} · Stok: <Text style={tw`font-bold`}>{item.isUnlimitedStock ? '∞' : item.stock}</Text>
                                            </Text>
                                        </View>
                                        {inCart ? (
                                            <View style={tw`bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full`}>
                                                <Text style={tw`text-green-700 font-black text-xs`}>+{inCart.qtyAdded}</Text>
                                            </View>
                                        ) : (
                                            <View style={tw`bg-blue-50 p-2 rounded-full`}>
                                                <Icon name="plus" size={16} color={tw.color('blue-600')} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </View>
            </Modal>

            {/* History modal */}
            <Modal visible={showHistory} transparent animationType="slide">
                <View style={tw`flex-1 bg-black/60 justify-end`}>
                    <View style={[tw`bg-white dark:bg-gray-800 rounded-t-3xl flex-col`, { maxHeight: screenH * 0.85 }]}>
                        <View style={tw`flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800`}>
                            <Text style={tw`font-black text-lg text-gray-800 dark:text-gray-100`}>Histori Penerimaan</Text>
                            <TouchableOpacity onPress={() => setShowHistory(false)} style={tw`p-2 bg-gray-100 dark:bg-gray-700 rounded-full`}>
                                <Icon name="close" size={20} color={tw.color('gray-600')} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={history}
                            keyExtractor={i => String(i.id)}
                            contentContainerStyle={tw`px-4 pt-3 pb-8`}
                            ListEmptyComponent={() => (
                                <View style={tw`items-center py-12`}>
                                    <Text style={tw`text-gray-400 font-bold`}>Belum ada histori penerimaan</Text>
                                </View>
                            )}
                            renderItem={({ item }) => (
                                <View style={tw`bg-gray-50 dark:bg-gray-900 p-4 rounded-xl mb-3 border border-gray-100 dark:border-gray-800`}>
                                    <View style={tw`flex-row justify-between items-start mb-2`}>
                                        <View style={tw`flex-row items-center`}>
                                            <Icon name="check-circle" size={16} color={tw.color('green-500')} style={tw`mr-2`} />
                                            <Text style={tw`font-bold text-gray-800 dark:text-gray-100 text-sm`}>{item.id}</Text>
                                        </View>
                                        <Text style={tw`text-xs text-gray-500`}>
                                            {new Date(item.receivedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    <Text style={tw`text-xs text-gray-600 dark:text-gray-300`} numberOfLines={3}>{item.items}</Text>
                                    {item.notes ? (
                                        <View style={tw`flex-row items-center mt-1`}>
                                            <Icon name="file-document-outline" size={11} color={tw.color('gray-400')} style={tw`mr-1`} />
                                            <Text style={tw`text-xs text-gray-400 italic`}>{item.notes}</Text>
                                        </View>
                                    ) : null}
                                    {item.createdBy ? <Text style={tw`text-xs text-blue-500 mt-1`}>oleh {item.createdBy}</Text> : null}
                                </View>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

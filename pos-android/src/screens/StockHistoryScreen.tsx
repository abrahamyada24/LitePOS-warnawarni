import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import tw, { useAppColorScheme } from 'twrnc';
import { getDBConnection } from '../database/db';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const formatRp = (n: number) => 'Rp ' + (Math.round(n) || 0).toLocaleString('id-ID');

export default function StockHistoryScreen({ navigation }: any) {
    useAppColorScheme(tw);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            const db = await getDBConnection();
            const [res] = await db.executeSql(
                `SELECT sr.*, GROUP_CONCAT(sri.productName || ' (+' || sri.quantityAdded || ')') as items
                 FROM stock_receipts sr
                 LEFT JOIN stock_receipt_items sri ON sri.receiptId = sr.id
                 GROUP BY sr.id ORDER BY sr.receivedAt DESC LIMIT 100`
            );
            const arr: any[] = [];
            for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
            setHistory(arr);
        } catch (e) {
            console.error('Failed to load history', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    return (
        <View style={tw`flex-1 bg-gray-50 dark:bg-gray-900`}>
            {/* Header */}
            <View style={tw`bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-row items-center`}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 mr-2`}>
                    <Icon name="arrow-left" size={24} color={tw.color('gray-700')} />
                </TouchableOpacity>
                <View style={tw`flex-1`}>
                    <Text style={tw`text-lg font-black text-gray-800 dark:text-gray-100`}>Riwayat Stok</Text>
                    <Text style={tw`text-xs text-gray-500`}>Log penambahan penerimaan barang supplier</Text>
                </View>
                <View style={tw`bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl`}>
                    <Icon name="history" size={20} color={tw.color('amber-600')} />
                </View>
            </View>

            {isLoading ? (
                <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color={tw.color('blue-600')} />
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(h) => h.id}
                    contentContainerStyle={tw`p-4 pb-10`}
                    ListEmptyComponent={() => (
                        <View style={tw`items-center py-16`}>
                            <Icon name="package-variant" size={48} color={tw.color('gray-300')} />
                            <Text style={tw`text-gray-400 font-bold mt-4`}>Belum ada histori penerimaan</Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <View style={tw`bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm border border-gray-100 dark:border-gray-800`}>
                            <View style={tw`flex-row justify-between mb-2`}>
                                <Text style={tw`font-black text-gray-800 dark:text-gray-100`}>{item.id}</Text>
                                <Text style={tw`text-xs font-bold text-gray-400`}>
                                    {new Date(item.receivedAt).toLocaleDateString('id-ID')}
                                </Text>
                            </View>
                            <Text style={tw`text-sm text-gray-600 dark:text-gray-300 font-bold leading-5`}>
                                {item.items?.split(',').map((it: string, idx: number) => (
                                    <Text key={idx}>{it}{'\n'}</Text>
                                ))}
                            </Text>
                            {item.notes ? (
                                <Text style={tw`text-xs text-gray-500 mt-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg`}>
                                    Catatan: {item.notes}
                                </Text>
                            ) : null}
                            <View style={tw`flex-row items-center justify-end mt-2 pt-2 border-t border-gray-100 dark:border-gray-700`}>
                                <Text style={tw`text-[10px] text-gray-400 font-bold uppercase`}>Oleh: {item.createdBy || 'Admin'}</Text>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

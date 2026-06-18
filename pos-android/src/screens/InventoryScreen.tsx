import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import tw, { useAppColorScheme } from 'twrnc';
import { getDBConnection } from '../database/db';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface MenuCard {
    key: string;
    label: string;
    sublabel: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    cardBg: string;
    textColor: string;
    onPress: () => void;
}

export default function InventoryScreen({ navigation }: any) {
    useAppColorScheme(tw);
    const [productCount, setProductCount] = useState(0);
    const [categoryCount, setCategoryCount] = useState(0);
    const [packageCount, setPackageCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);

    useEffect(() => {
        const loadCounts = async () => {
            try {
                const db = await getDBConnection();
                const [pRes] = await db.executeSql('SELECT COUNT(*) as c FROM products');
                setProductCount(pRes.rows.item(0).c || 0);
                const [cRes] = await db.executeSql('SELECT COUNT(*) as c FROM categories');
                setCategoryCount(cRes.rows.item(0).c || 0);
                const [pkRes] = await db.executeSql('SELECT COUNT(*) as c FROM packages WHERE isActive = 1');
                setPackageCount(pkRes.rows.item(0).c || 0);
                const [lsRes] = await db.executeSql('SELECT COUNT(*) as c FROM products WHERE isUnlimitedStock = 0 AND stock <= 5');
                setLowStockCount(lsRes.rows.item(0).c || 0);
            } catch (e) { console.error(e); }
        };
        loadCounts();
        const unsub = navigation.addListener('focus', loadCounts);
        return unsub;
    }, [navigation]);

    const menuCards: MenuCard[] = [
        {
            key: 'produk',
            label: 'Produk',
            sublabel: `${productCount} item`,
            icon: 'package-variant',
            iconBg: 'bg-blue-50 dark:bg-blue-900/40',
            iconColor: tw.color('blue-600') || '#2563eb',
            cardBg: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800',
            textColor: 'text-gray-800 dark:text-gray-100',
            onPress: () => navigation.navigate('ProductList'),
        },
        {
            key: 'kategori',
            label: 'Kategori',
            sublabel: `${categoryCount} kategori`,
            icon: 'tag-outline',
            iconBg: 'bg-purple-50 dark:bg-purple-900/40',
            iconColor: tw.color('purple-600') || '#9333ea',
            cardBg: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800',
            textColor: 'text-gray-800 dark:text-gray-100',
            onPress: () => navigation.navigate('CategoryList'),
        },
        {
            key: 'paket',
            label: 'Paket Bundling',
            sublabel: `${packageCount} paket aktif`,
            icon: 'package-variant-closed',
            iconBg: 'bg-indigo-50 dark:bg-indigo-900/40',
            iconColor: tw.color('indigo-600') || '#4f46e5',
            cardBg: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800',
            textColor: 'text-gray-800 dark:text-gray-100',
            onPress: () => navigation.navigate('PackageList'),
        },
        {
            key: 'stok',
            label: 'Riwayat Stok',
            sublabel: 'Keluar/Masuk',
            icon: 'chart-bar',
            iconBg: 'bg-amber-50 dark:bg-amber-900/40',
            iconColor: tw.color('amber-600') || '#d97706',
            cardBg: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800',
            textColor: 'text-gray-800 dark:text-gray-100',
            onPress: () => navigation.navigate('StockHistory'),
        },
        {
            key: 'terima',
            label: 'Penerimaan Barang',
            sublabel: 'Tambah stok supplier',
            icon: 'archive-outline',
            iconBg: 'bg-red-50 dark:bg-red-900/40',
            iconColor: tw.color('red-600') || '#dc2626',
            cardBg: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800',
            textColor: 'text-gray-800 dark:text-gray-100',
            onPress: () => navigation.navigate('StockReceiving'),
        },
        {
            key: 'opname',
            label: 'Stock Opname',
            sublabel: 'Penyesuaian stok',
            icon: 'clipboard-list-outline',
            iconBg: 'bg-emerald-50 dark:bg-emerald-900/40',
            iconColor: tw.color('emerald-600') || '#059669',
            cardBg: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800',
            textColor: 'text-gray-800 dark:text-gray-100',
            onPress: () => navigation.navigate('StockOpname'),
        },
    ];

    return (
        <View style={tw`flex-1 bg-gray-50 dark:bg-gray-900`}>
            {/* Header */}
            <View style={tw`bg-white dark:bg-gray-800 px-6 pt-4 pb-5 border-b border-gray-100 dark:border-gray-700`}>
                <Text style={tw`text-2xl font-black text-gray-800 dark:text-gray-100`}>Inventori</Text>
                <Text style={tw`text-gray-500 dark:text-gray-400 text-sm mt-1`}>Kelola inventori dan produk Anda</Text>
            </View>

            <ScrollView contentContainerStyle={tw`p-4 pb-10`}>
                {/* Low Stock Alert */}
                {lowStockCount > 0 && (
                    <TouchableOpacity
                        style={tw`bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 mb-4 flex-row items-center`}
                        onPress={() => navigation.navigate('ProductList')}
                    >
                        <View style={tw`w-8 h-8 bg-amber-100 dark:bg-amber-800 rounded-full items-center justify-center mr-3`}>
                            <Text style={tw`font-black text-amber-600 text-xs`}>{lowStockCount}</Text>
                        </View>
                        <View style={tw`flex-1`}>
                            <Text style={tw`font-bold text-amber-800 dark:text-amber-200 text-sm`}>Stok Rendah</Text>
                            <Text style={tw`text-amber-600 dark:text-amber-400 text-xs`}>{lowStockCount} produk stok ≤ 5</Text>
                        </View>
                        <Icon name="arrow-right" size={16} color={tw.color('amber-500')} />
                    </TouchableOpacity>
                )}

                {/* Menu Grid */}
                <View style={tw`flex-row flex-wrap justify-between`}>
                    {menuCards.map((card) => (
                        <TouchableOpacity
                            key={card.key}
                            style={[tw`w-[48%] rounded-2xl p-4 mb-4 ${card.cardBg}`, { minHeight: 130 }]}
                            onPress={card.onPress}
                            activeOpacity={0.8}
                        >
                            <View style={tw`w-10 h-10 ${card.iconBg} rounded-xl items-center justify-center mb-3`}>
                                <Icon name={card.icon} size={20} color={card.iconColor} />
                            </View>
                            <Text style={tw`font-black text-base ${card.textColor} mb-1`}>{card.label}</Text>
                            <View style={tw`flex-row items-center justify-between`}>
                                <Text style={tw`text-xs ${card.textColor} opacity-70`}>{card.sublabel}</Text>
                                <Icon name="arrow-right" size={14} color={card.iconColor} style={tw`opacity-50`} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

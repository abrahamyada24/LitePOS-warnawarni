import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import tw, { useAppColorScheme } from 'twrnc';
import { getDBConnection } from '../database/db';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function UserManagementScreen({ navigation }: any) {
    useAppColorScheme(tw);
    const [users, setUsers] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', email: '', pin: '', role: 'CASHIER' });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const db = await getDBConnection();
            const [results] = await db.executeSql('SELECT * FROM users ORDER BY role ASC');
            const arr = [];
            for (let i = 0; i < results.rows.length; i++) {
                arr.push(results.rows.item(i));
            }
            setUsers(arr);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.pin || !formData.email) {
            Alert.alert('Error', 'Nama, Email, dan Password harus diisi!');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Validasi Gagal', 'Format email tidak valid (contoh: user@email.com)');
            return;
        }

        if (formData.pin.length < 6) {
            Alert.alert('Validasi Gagal', 'Password atau PIN minimal terdiri dari 6 karakter/angka');
            return;
        }

        try {
            const db = await getDBConnection();
            if (formData.id) {
                await db.executeSql(
                    `UPDATE users SET name = ?, email = ?, pin = ?, role = ? WHERE id = ?`,
                    [formData.name, formData.email, formData.pin, formData.role, formData.id]
                );
            } else {
                await db.executeSql(
                    `INSERT INTO users (name, email, pin, role) VALUES (?, ?, ?, ?)`,
                    [formData.name, formData.email, formData.pin, formData.role]
                );
            }
            setIsModalVisible(false);
            setFormData({ id: null, name: '', email: '', pin: '', role: 'CASHIER' });
            loadUsers();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Gagal menyimpan user');
        }
    };

    const handleDelete = (id: number, role: string) => {
        if (role === 'ADMIN' || role === 'OWNER') {
            Alert.alert('Error', 'Akun ADMIN dan OWNER tidak dapat dihapus');
            return;
        }

        Alert.alert('Konfirmasi', 'Hapus pengguna ini?', [
            { text: 'Batal', style: 'cancel' },
            {
                text: 'Hapus',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const db = await getDBConnection();
                        await db.executeSql(`DELETE FROM users WHERE id = ${id}`);
                        loadUsers();
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        ]);
    };

    return (
        <View style={tw`flex-1 bg-gray-50 dark:bg-gray-900`}>
            {/* Header */}
            <View style={tw`bg-white dark:bg-gray-800 px-4 py-3 flex-row items-center border-b border-gray-200 dark:border-gray-700`}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2 mr-2`}>
                    <Icon name="arrow-left" size={24} color={tw.color('gray-800')} />
                </TouchableOpacity>
                <Text style={tw`text-xl font-black text-gray-800 dark:text-gray-100 flex-1`}>Kelola Kasir & Admin</Text>
                <TouchableOpacity
                    style={tw`bg-blue-600 px-4 py-2 rounded-xl flex-row items-center`}
                    onPress={() => {
                        setFormData({ id: null, name: '', email: '', pin: '', role: 'CASHIER' });
                        setIsModalVisible(true);
                    }}
                >
                    <Icon name="account-plus" size={18} color="white" style={tw`mr-2`} />
                    <Text style={tw`text-white font-bold`}>Tambah</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                contentContainerStyle={tw`p-4`}
                data={users}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <View style={tw`bg-white dark:bg-gray-800 p-4 rounded-2xl mb-3 border border-gray-200 dark:border-gray-700 shadow-sm flex-row items-center justify-between`}>
                        <View>
                            <Text style={tw`text-lg font-bold text-gray-800 dark:text-gray-100`}>{item.name}</Text>
                            <View style={tw`flex-row items-center mt-1`}>
                                <View style={tw`${item.role === 'OWNER' ? 'bg-red-100 text-red-700' : item.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} px-2 py-1 rounded-md mr-2`}>
                                    <Text style={tw`text-[10px] font-bold ${item.role === 'OWNER' ? 'text-red-700' : item.role === 'ADMIN' ? 'text-purple-700' : 'text-blue-700'}`}>{item.role === 'CASHIER' ? 'STAFF (KASIR)' : item.role}</Text>
                                </View>
                                <Text style={tw`text-gray-500 dark:text-gray-400 text-xs`}>{item.email || 'Email belum diatur'}</Text>
                            </View>
                        </View>

                        <View style={tw`flex-row`}>
                            <TouchableOpacity
                                style={tw`p-2 bg-gray-100 dark:bg-gray-800 rounded-lg mr-2`}
                                onPress={() => {
                                    setFormData(item);
                                    setIsModalVisible(true);
                                }}
                            >
                                <Icon name="pencil" size={20} color={tw.color('gray-600')} />
                            </TouchableOpacity>
                            {item.role !== 'ADMIN' && item.role !== 'OWNER' && (
                                <TouchableOpacity
                                    style={tw`p-2 bg-red-50 rounded-lg`}
                                    onPress={() => handleDelete(item.id, item.role)}
                                >
                                    <Icon name="delete-outline" size={20} color={tw.color('red-600')} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            />

            <Modal visible={isModalVisible} animationType="slide" transparent>
                <View style={tw`flex-1 bg-black/50 justify-center p-4`}>
                    <View style={tw`bg-white dark:bg-gray-800 rounded-3xl p-6`}>
                        <Text style={tw`text-xl font-bold text-gray-800 dark:text-gray-100 mb-4`}>
                            {formData.id ? 'Edit Pengguna' : 'Tambah Pengguna'}
                        </Text>

                        <Text style={tw`text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm font-bold mb-1`}>Nama Lengkap</Text>
                        <TextInput
                            style={tw`bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-4 text-gray-800 dark:text-gray-100`}
                            value={formData.name}
                            onChangeText={(t) => setFormData({ ...formData, name: t })}
                            placeholder="Contoh: Budi Kasir"
                        />

                        <Text style={tw`text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm font-bold mb-1`}>Email Login</Text>
                        <TextInput
                            style={tw`bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-4 text-gray-800 dark:text-gray-100`}
                            value={formData.email}
                            onChangeText={(t) => setFormData({ ...formData, email: t })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="Alamat Email"
                        />

                        <Text style={tw`text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm font-bold mb-1`}>Password (Offline)</Text>
                        <TextInput
                            style={tw`bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-4 font-bold text-gray-800 dark:text-gray-100`}
                            value={formData.pin}
                            onChangeText={(t) => setFormData({ ...formData, pin: t })}
                            placeholder="Kombinasi huruf/angka"
                        />

                        <Text style={tw`text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm font-bold mb-1`}>Role Akses</Text>
                        <View style={tw`flex-row mb-6`}>
                            <TouchableOpacity
                                style={tw`flex-1 py-3 border-b-2 ${formData.role === 'CASHIER' ? 'border-blue-600' : 'border-gray-200 dark:border-gray-700'}`}
                                onPress={() => setFormData({ ...formData, role: 'CASHIER' })}
                            >
                                <Text style={tw`text-center text-xs font-bold ${formData.role === 'CASHIER' ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`}>STAFF(KASIR)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={tw`flex-1 py-3 border-b-2 ${formData.role === 'ADMIN' ? 'border-purple-600' : 'border-gray-200 dark:border-gray-700'}`}
                                onPress={() => setFormData({ ...formData, role: 'ADMIN' })}
                            >
                                <Text style={tw`text-center text-xs font-bold ${formData.role === 'ADMIN' ? 'text-purple-600' : 'text-gray-400 dark:text-gray-500'}`}>ADMIN</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={tw`flex-1 py-3 border-b-2 ${formData.role === 'OWNER' ? 'border-red-600' : 'border-gray-200 dark:border-gray-700'}`}
                                onPress={() => setFormData({ ...formData, role: 'OWNER' })}
                            >
                                <Text style={tw`text-center text-xs font-bold ${formData.role === 'OWNER' ? 'text-red-600' : 'text-gray-400 dark:text-gray-500'}`}>OWNER</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={tw`flex-row space-x-3`}>
                            <TouchableOpacity
                                style={tw`flex-1 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl`}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={tw`text-center font-bold text-gray-600 dark:text-gray-300`}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={tw`flex-1 py-3 bg-blue-600 rounded-xl`}
                                onPress={handleSave}
                            >
                                <Text style={tw`text-center font-bold text-white`}>Simpan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

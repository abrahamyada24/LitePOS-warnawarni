const fs = require('fs');

let content = fs.readFileSync('src/screens/ReceiptPreviewScreen.tsx', 'utf8');

// Add imports
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useRef } from 'react';\nimport ViewShot from 'react-native-view-shot';\nimport Share from 'react-native-share';");

// Add viewShotRef
content = content.replace("    const settings = useStore(state => state.settings);", "    const settings = useStore(state => state.settings);\n    const viewShotRef = useRef<any>(null);");

// Find the start of shareReceiptWA
const shareFuncStart = content.indexOf("    const shareReceiptWA = async () => {");
if (shareFuncStart === -1) {
    console.error("Could not find shareReceiptWA");
    process.exit(1);
}

const newContent = content.substring(0, shareFuncStart);

const newUiAndShare = `    const shareReceiptWA = async () => {
        try {
            // Capture image
            const uri = await viewShotRef.current.capture();
            
            let phone = '';
            if (receiptData.customerPhone) {
                phone = receiptData.customerPhone.replace(/[^0-9]/g, '');
                if (phone.startsWith('0')) phone = '62' + phone.substring(1);
            }

            const shareOptions: any = {
                title: 'Struk Transaksi',
                message: \`Struk Transaksi \${settings.storeName || 'LitePOS'}\\nNo: \${receiptData.invoiceNumber}\`,
                url: uri,
            };

            // If we have a phone number, use shareSingle for WhatsApp
            if (phone) {
                shareOptions.social = Share.Social.WHATSAPP;
                shareOptions.whatsAppNumber = phone;
                try {
                    await Share.shareSingle(shareOptions);
                    return;
                } catch (singleError: any) {
                    console.log('shareSingle error:', singleError);
                }
            }
            
            // Fallback: Just open the share sheet
            await Share.open({
                title: 'Struk Transaksi',
                url: uri,
                message: shareOptions.message
            });

        } catch (error: any) {
            console.log('Share error:', error);
            if (error.message !== 'User did not share') {
                Alert.alert('Gagal', 'Tidak dapat membagikan gambar struk.');
            }
        }
    };

    const printReceipt = async () => {
        if (!settings.printerAddress || !settings.printerType) {
            Alert.alert('Info', 'Belum ada printer yang dikonfigurasi.\\nMasuk ke menu Pengaturan untuk mengatur printer.');
            return;
        }

        const hasPerms = await requestPrinterPermissions();
        if (!hasPerms && settings.printerType === 'BLE') {
            Alert.alert('Izin Ditolak', 'Dibutuhkan izin Bluetooth untuk mencetak.');
            return;
        }

        setIsPrinting(true);
        try {
            const printerClass = settings.printerType === 'USB' ? USBPrinter : BLEPrinter;
            try { await printerClass.init(); } catch { /* Already initialized */ }
            try {
                if (settings.printerType === 'BLE') {
                    await printerClass.connectPrinter(settings.printerAddress);
                } else {
                    const [vendorStr, productStr] = settings.printerAddress.split('|');
                    await printerClass.connectPrinter(Number(vendorStr), Number(productStr));
                }
            } catch { /* Already connected */ }

            await printerClass.printText(buildReceiptText());
        } catch (e: any) {
            Alert.alert('Gagal Mencetak', e?.message || 'Error saat mencetak. Pastikan printer menyala dan sudah di-pair via Bluetooth.');
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <View style={tw\`flex-1 bg-gray-300 dark:bg-gray-900\`}>
            {/* Header */}
            <View style={tw\`bg-white dark:bg-gray-800 px-4 py-4 flex-row items-center shadow-sm z-10\`}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={tw\`mr-3\`}>
                    <Icon name="arrow-left" size={24} color={tw.color('gray-600')} />
                </TouchableOpacity>
                <Text style={tw\`text-xl font-bold text-gray-800 dark:text-gray-100 flex-1\`}>Printer dan Struk</Text>
            </View>

            <ScrollView contentContainerStyle={tw\`p-6 items-center\`} showsVerticalScrollIndicator={false}>
                
                {/* The Paper Receipt inside ViewShot */}
                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0, backgroundColor: '#ffffff' }} style={tw\`bg-white w-full max-w-[320px] shadow-md mb-8\`}>
                    <View style={tw\`p-5 bg-white\`}>
                        {/* Logo */}
                        <View style={tw\`items-center mb-4\`}>
                            <Image 
                                source={LITEPOS_LOGO} 
                                style={{ width: 60, height: 60, resizeMode: 'contain', tintColor: '#000' }} 
                            />
                        </View>
                        
                        <Text style={tw\`text-center font-mono text-xs font-bold text-black mb-1\`}>{settings.storeName || 'LITEPOS'}</Text>
                        {settings.storeAddress ? <Text style={tw\`text-center font-mono text-[10px] text-black\`}>{settings.storeAddress}</Text> : null}
                        {settings.storePhone ? <Text style={tw\`text-center font-mono text-[10px] text-black mb-2\`}>{settings.storePhone}</Text> : null}
                        
                        <View style={tw\`w-full border-t border-dashed border-gray-400 my-2\`} />
                        
                        <View style={tw\`flex-row justify-between mb-1\`}>
                            <View>
                                <Text style={tw\`font-mono text-[10px] text-black\`}>{new Date(receiptData.createdAt).toLocaleString('id-ID')}</Text>
                                <Text style={tw\`font-mono text-[10px] text-black\`}>{receiptData.invoiceNumber}</Text>
                            </View>
                            <View>
                                <Text style={tw\`font-mono text-[10px] text-black text-right\`}>{user?.name || 'Kasir'}</Text>
                            </View>
                        </View>

                        <View style={tw\`w-full border-t border-dashed border-gray-400 my-2\`} />

                        {receiptData.items.map((item: any, idx: number) => (
                            <View key={idx} style={tw\`mb-2\`}>
                                <Text style={tw\`font-mono text-[11px] text-black\`} numberOfLines={2}>{item.name}</Text>
                                <View style={tw\`flex-row justify-between\`}>
                                    <Text style={tw\`font-mono text-[11px] text-black\`}>{item.quantity} x {item.price.toLocaleString('id-ID')}</Text>
                                    <Text style={tw\`font-mono text-[11px] text-black\`}>{(item.price * item.quantity).toLocaleString('id-ID')}</Text>
                                </View>
                                {item.notes ? (
                                    <Text style={tw\`font-mono text-[10px] text-gray-600\`}>* {item.notes}</Text>
                                ) : null}
                            </View>
                        ))}

                        <View style={tw\`w-full border-t border-dashed border-gray-400 my-2\`} />

                        {receiptData.discountAmount > 0 && (
                            <>
                                <View style={tw\`flex-row justify-between mb-1\`}>
                                    <Text style={tw\`font-mono text-[11px] text-black\`}>Subtotal</Text>
                                    <Text style={tw\`font-mono text-[11px] text-black\`}>{(receiptData.subtotal || receiptData.total + receiptData.discountAmount).toLocaleString('id-ID')}</Text>
                                </View>
                                <View style={tw\`flex-row justify-between mb-1\`}>
                                    <Text style={tw\`font-mono text-[11px] text-black\`}>Diskon</Text>
                                    <Text style={tw\`font-mono text-[11px] text-black\`}>-{receiptData.discountAmount.toLocaleString('id-ID')}</Text>
                                </View>
                            </>
                        )}

                        <View style={tw\`flex-row justify-between mt-1 mb-1\`}>
                            <Text style={tw\`font-mono text-[12px] font-bold text-black\`}>Total</Text>
                            <Text style={tw\`font-mono text-[12px] font-bold text-black\`}>{receiptData.total.toLocaleString('id-ID')}</Text>
                        </View>
                        <View style={tw\`flex-row justify-between mb-1\`}>
                            <Text style={tw\`font-mono text-[11px] text-black\`}>Bayar ({receiptData.paymentMethod})</Text>
                            <Text style={tw\`font-mono text-[11px] text-black\`}>{receiptData.cashAmount.toLocaleString('id-ID')}</Text>
                        </View>
                        <View style={tw\`flex-row justify-between\`}>
                            <Text style={tw\`font-mono text-[11px] text-black\`}>Kembali</Text>
                            <Text style={tw\`font-mono text-[11px] text-black\`}>{receiptData.changeAmount.toLocaleString('id-ID')}</Text>
                        </View>

                        <View style={tw\`w-full border-t border-dashed border-gray-400 my-4\`} />
                        
                        <Text style={tw\`text-center font-mono text-[10px] text-black\`}>
                            {settings.receiptFooter || 'Terima Kasih!'}
                        </Text>
                        <Text style={tw\`text-center font-mono text-[10px] text-black mt-1\`}>Powered by LitePOS</Text>
                        
                    </View>
                </ViewShot>

                {/* Bottom Actions Container */}
                <View style={tw\`w-full max-w-[320px] mb-8\`}>
                    {!settings.printerAddress && (
                        <View style={tw\`flex-row items-center justify-center mb-4 bg-orange-100 py-2.5 rounded border border-orange-200\`}>
                            <Icon name="alert" size={14} color={tw.color('orange-600')} style={tw\`mr-2\`} />
                            <Text style={tw\`text-orange-700 text-[11px] font-bold\`}>Printer thermal belum diatur</Text>
                        </View>
                    )}

                    <View style={tw\`flex-row gap-2 mb-3\`}>
                        <TouchableOpacity
                            style={tw\`flex-1 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded items-center shadow-sm\`}
                            onPress={() => navigation.navigate('Main', { screen: 'Beranda' })}
                        >
                            <Text style={tw\`font-bold text-gray-700 dark:text-gray-200 text-sm\`}>Beranda</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={tw\`flex-1 py-3 bg-green-600 rounded items-center flex-row justify-center shadow-sm\`}
                            onPress={shareReceiptWA}
                        >
                            <Icon name="whatsapp" size={18} color="white" style={tw\`mr-1.5\`} />
                            <Text style={tw\`font-bold text-white text-sm\`}>Kirim WA</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={tw\`flex-1 py-3 bg-blue-600 rounded items-center flex-row justify-center shadow-sm \${isPrinting || !settings.printerAddress ? 'opacity-50' : ''}\`}
                            onPress={printReceipt}
                            disabled={isPrinting || !settings.printerAddress}
                        >
                            <Icon name="printer" size={18} color="white" style={tw\`mr-1.5\`} />
                            <Text style={tw\`font-bold text-white text-sm\`}>{isPrinting ? 'Cetak...' : 'Struk'}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={tw\`py-3 bg-gray-900 dark:bg-gray-700 rounded items-center shadow-sm\`}
                        onPress={() => navigation.navigate('POS')}
                    >
                        <Text style={tw\`font-bold text-white text-sm\`}>Transaksi Baru</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}
`;

fs.writeFileSync('src/screens/ReceiptPreviewScreen.tsx', newContent + newUiAndShare, 'utf8');
console.log('Done patching.');

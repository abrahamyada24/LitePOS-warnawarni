const fs = require('fs');

const filePath = 'd:/AndroidPos/src/screens/DashboardScreen.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Update MenuItem to accept style
content = content.replace(
    /const MenuItem = \(\{ icon, title, subtitle, color, bgColor, primary, onPress, delay = 0 \}: any\) => \{/g,
    "const MenuItem = ({ icon, title, subtitle, color, bgColor, primary, onPress, delay = 0, style }: any) => {"
);

content = content.replace(
    /return \(\s*<Animated\.View style=\{\{\s*opacity: fadeAnim,\s*transform: \[\{ translateY: slideAnim \}, \{ scale: scaleAnim \}\]\s*\}\}>\s*<TouchableOpacity/g,
    "return (\n        <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }, style]}>\n            <TouchableOpacity"
);

// 2. Add isTablet constant
content = content.replace(
    /const \{ width \} = Dimensions\.get\('window'\);/g,
    "const { width } = Dimensions.get('window');\nconst isTablet = width >= 768;"
);

// 3. Update summary state
content = content.replace(
    /const \[summary, setSummary\] = useState\(\{ todayRevenue: 0, todayCount: 0, todayReturns: 0 \}\);/g,
    "const [summary, setSummary] = useState({ todayRevenue: 0, todayCount: 0, todayReturns: 0, productsCount: 0, lowStockCount: 0 });"
);

// 4. Update loadData function
const loadDataReplacement = `            const data = await getStoreSummary(db);
            
            const [prodRes] = await db.executeSql('SELECT COUNT(*) as count FROM products');
            const productsCount = prodRes.rows.item(0).count || 0;
            
            const [lowStockRes] = await db.executeSql('SELECT COUNT(*) as count FROM products WHERE stock <= minStock AND isUnlimitedStock = 0');
            const lowStockCount = lowStockRes.rows.item(0).count || 0;
            
            setSummary({ ...data, productsCount, lowStockCount });`;

content = content.replace(
    /const data = await getStoreSummary\(db\);\s*setSummary\(data\);/g,
    loadDataReplacement
);

// 5. Update UI rendering for Hero & Stats
const heroStatsRegex = /\{\/\* ═══ HERO REVENUE CARD ═══ \*\/}[\s\S]*?(?=\{\/\* ═══ PENDING SALES ALERT ═══ \*\/})/;
const newHeroStats = `{/* ═══ HERO & STATS ROW (RESPONSIVE) ═══ */}
                {isTablet ? (
                    <View style={styles.tabletHeroRow}>
                        <Animated.View style={[styles.heroCard, { flex: 2, marginRight: 16, marginBottom: 0, opacity: headerAnim }]}>
                            <View style={styles.heroBlob1} />
                            <View style={styles.heroBlob2} />
                            <View style={styles.heroTop}>
                                <View>
                                    <Text style={styles.heroLabel}>Pendapatan Hari Ini</Text>
                                    <Text style={styles.heroValue}>{formatRp(summary.todayRevenue)}</Text>
                                </View>
                                <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Laporan')}>
                                    <Icon name="arrow-top-right" size={16} color={COLORS.white} />
                                    <Text style={styles.heroBtnText}>Laporan</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.heroDivider} />
                            <View style={styles.heroBottom}>
                                <View style={styles.heroStat}>
                                    <Icon name="trending-up" size={14} color={COLORS.accent} />
                                    <Text style={styles.heroStatTextGreen}>
                                        {summary.todayReturns > 0 ? \`\${summary.todayReturns} Retur\` : \`\${summary.todayCount} Transaksi\`}
                                    </Text>
                                </View>
                                <View style={styles.heroStat}>
                                    <Icon name="clock-outline" size={14} color={COLORS.white + 'AA'} />
                                    <Text style={styles.heroStatTextMuted}>Update: {updateTime}</Text>
                                </View>
                            </View>
                        </Animated.View>
                        <View style={{ flex: 1, justifyContent: 'space-between' }}>
                            <StatCard
                                icon="cart-variant"
                                label="Transaksi"
                                value={String(summary.todayCount)}
                                sub="Sukses hari ini"
                                color={COLORS.accent}
                                bgColor={COLORS.accentLight}
                                delay={100}
                                onPress={() => navigation.navigate('Laporan')}
                            />
                            <View style={{ height: 12 }} />
                            <StatCard
                                icon="package-variant"
                                label="Produk"
                                value={String(summary.productsCount)}
                                sub="Item aktif"
                                color={COLORS.primary}
                                bgColor={COLORS.primaryLight}
                                delay={150}
                                onPress={() => navigation.navigate('Main', { screen: 'Inventori' })}
                            />
                            <View style={{ height: 12 }} />
                            <StatCard
                                icon="alert-circle-outline"
                                label="Stok"
                                value={String(summary.lowStockCount)}
                                sub="Hampir habis"
                                color={COLORS.warning}
                                bgColor={COLORS.warningLight}
                                delay={200}
                                onPress={() => navigation.navigate('Main', { screen: 'Inventori' })}
                            />
                        </View>
                    </View>
                ) : (
                    <>
                        {/* ═══ HERO REVENUE CARD ═══ */}
                        <Animated.View style={[styles.heroCard, { opacity: headerAnim }]}>
                            <View style={styles.heroBlob1} />
                            <View style={styles.heroBlob2} />
                            <View style={styles.heroTop}>
                                <View>
                                    <Text style={styles.heroLabel}>Pendapatan Hari Ini</Text>
                                    <Text style={styles.heroValue}>{formatRp(summary.todayRevenue)}</Text>
                                </View>
                                <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Laporan')}>
                                    <Icon name="arrow-top-right" size={16} color={COLORS.white} />
                                    <Text style={styles.heroBtnText}>Laporan</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.heroDivider} />
                            <View style={styles.heroBottom}>
                                <View style={styles.heroStat}>
                                    <Icon name="trending-up" size={14} color={COLORS.accent} />
                                    <Text style={styles.heroStatTextGreen}>
                                        {summary.todayReturns > 0 ? \`\${summary.todayReturns} Retur\` : \`\${summary.todayCount} Transaksi\`}
                                    </Text>
                                </View>
                                <View style={styles.heroStat}>
                                    <Icon name="clock-outline" size={14} color={COLORS.white + 'AA'} />
                                    <Text style={styles.heroStatTextMuted}>Update: {updateTime}</Text>
                                </View>
                            </View>
                        </Animated.View>

                        {/* ═══ STAT CARDS ROW ═══ */}
                        <View style={styles.statsRow}>
                            <StatCard
                                icon="cart-variant"
                                label="Transaksi"
                                value={String(summary.todayCount)}
                                sub="Sukses hari ini"
                                color={COLORS.accent}
                                bgColor={COLORS.accentLight}
                                delay={100}
                                onPress={() => navigation.navigate('Laporan')}
                            />
                            <View style={{ width: 12 }} />
                            <StatCard
                                icon="package-variant"
                                label="Produk"
                                value={String(summary.productsCount)}
                                sub="Item aktif"
                                color={COLORS.primary}
                                bgColor={COLORS.primaryLight}
                                delay={150}
                                onPress={() => navigation.navigate('Main', { screen: 'Inventori' })}
                            />
                            <View style={{ width: 12 }} />
                            <StatCard
                                icon="alert-circle-outline"
                                label="Stok"
                                value={String(summary.lowStockCount)}
                                sub="Hampir habis"
                                color={COLORS.warning}
                                bgColor={COLORS.warningLight}
                                delay={200}
                                onPress={() => navigation.navigate('Main', { screen: 'Inventori' })}
                            />
                        </View>
                    </>
                )}

                `;
content = content.replace(heroStatsRegex, newHeroStats);

// 6. Update UI rendering for Menu Utama
const menuRegex = /\{\/\* ═══ MENU UTAMA ═══ \*\/}[\s\S]*?(?=<View style=\{\{ height: 32 \}\} \/>)/;
const newMenu = `{/* ═══ MENU UTAMA ═══ */}
                <Text style={styles.sectionTitle}>Menu Utama</Text>

                <View style={isTablet ? styles.tabletMenuGrid : {}}>
                    <MenuItem
                        icon="point-of-sale"
                        title="Buka Kasir (POS)"
                        subtitle="Mulai transaksi penjualan"
                        primary
                        delay={250}
                        onPress={() => navigation.navigate('POS')}
                        style={isTablet ? styles.tabletMenuFull : {}}
                    />

                    {(user?.role === 'ADMIN' || user?.role === 'OWNER') && (
                        <>
                            {!isTablet && <View style={{ height: 12 }} />}
                            <MenuItem
                                icon="chart-box-outline"
                                title="Laporan & Pengeluaran"
                                subtitle="Histori, retur, dan biaya"
                                color={COLORS.primary}
                                bgColor={COLORS.primaryLight}
                                delay={300}
                                onPress={() => navigation.navigate('Laporan')}
                                style={isTablet ? styles.tabletMenuHalf : {}}
                            />

                            {!isTablet && <View style={{ height: 12 }} />}
                            <MenuItem
                                icon="database-outline"
                                title="Kelola Data"
                                subtitle="Produk, kategori & pelanggan"
                                color="#7B61FF"
                                bgColor="#F0EDFF"
                                delay={350}
                                onPress={() => navigation.navigate('Main', { screen: 'Inventori' })}
                                style={isTablet ? styles.tabletMenuHalf : {}}
                            />

                            {!isTablet && <View style={{ height: 12 }} />}
                            <MenuItem
                                icon="account-multiple-outline"
                                title="Kontak & Pelanggan"
                                subtitle="Data pelanggan & supplier"
                                color={COLORS.accent}
                                bgColor={COLORS.accentLight}
                                delay={400}
                                onPress={() => navigation.navigate('Main', { screen: 'Kontak' })}
                                style={isTablet ? styles.tabletMenuHalf : {}}
                            />

                            {settings.enableDineTable && (
                                <>
                                    {!isTablet && <View style={{ height: 12 }} />}
                                    <MenuItem
                                        icon="silverware-fork-knife"
                                        title="Manajemen Meja"
                                        subtitle="Kelola meja dine-in"
                                        color="#059669"
                                        bgColor="#ECFDF5"
                                        delay={450}
                                        onPress={() => navigation.navigate('TableManagement')}
                                        style={isTablet ? styles.tabletMenuHalf : {}}
                                    />
                                </>
                            )}
                        </>
                    )}
                </View>

                `;
content = content.replace(menuRegex, newMenu);

// 7. Add Tablet Styles
const stylesInjection = `    tabletHeroRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    tabletMenuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    tabletMenuFull: {
        width: '100%',
        marginBottom: 16,
    },
    tabletMenuHalf: {
        width: '48%',
        marginBottom: 16,
    },
});`;

content = content.replace(/\}\);\s*$/, stylesInjection);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("DashboardScreen modified successfully");

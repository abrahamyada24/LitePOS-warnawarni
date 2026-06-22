/* eslint-disable @next/next/no-img-element */
"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Grid, List, AlignJustify, MessageCircle, ShoppingBag, X, ChevronLeft, ZoomIn, ZoomOut, Package } from 'lucide-react';

export default function KatalogPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [settings, setSettings] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState('grid');
    const [loading, setLoading] = useState(true);

    // Detail Modal State
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
            const res = await fetch(`${API_URL}/api/catalog`);
            const json = await res.json();
            if (json.success) {
                setProducts(json.data.products);
                setCategories(json.data.categories);
                setSettings(json.data.settings);
            }
        } catch (error) {
            console.error("Gagal mengambil data katalog", error);
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const getAPIUrl = () => process.env.NEXT_PUBLIC_API_URL || '';

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${getAPIUrl()}${imageUrl}`;
    };

    const openProductDetail = (product) => {
        setSelectedProduct(product);
        setShowDetail(true);
        setZoomLevel(1);
        setImagePosition({ x: 0, y: 0 });
    };

    const closeProductDetail = () => {
        setShowDetail(false);
        setSelectedProduct(null);
        setZoomLevel(1);
        setImagePosition({ x: 0, y: 0 });
    };

    const openWhatsApp = (product) => {
        let phone = settings?.phone || '';
        if (!phone) {
            alert('Nomor WhatsApp toko belum diatur.');
            return;
        }
        if (phone.startsWith('0')) {
            phone = '62' + phone.slice(1);
        }
        phone = phone.replace(/\D/g, '');
        const message = `Halo, saya ingin bertanya tentang produk *${product.name}* (Harga: ${formatRupiah(product.price)}). Apakah masih tersedia?`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const toggleViewMode = () => {
        if (viewMode === 'grid') setViewMode('list');
        else if (viewMode === 'list') setViewMode('compact');
        else setViewMode('grid');
    };

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat = selectedCategory === 'All' || p.categoryId === parseInt(selectedCategory);
        return matchSearch && matchCat;
    });

    // Zoom handlers
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.5, 4));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => {
            const newZoom = Math.max(prev - 0.5, 1);
            if (newZoom === 1) setImagePosition({ x: 0, y: 0 });
            return newZoom;
        });
    };

    const handleMouseDown = (e) => {
        if (zoomLevel <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging || zoomLevel <= 1) return;
        setImagePosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    }, [isDragging, zoomLevel, dragStart]);

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e) => {
        if (zoomLevel <= 1) return;
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - imagePosition.x, y: touch.clientY - imagePosition.y });
    };

    const handleTouchMove = useCallback((e) => {
        if (!isDragging || zoomLevel <= 1) return;
        const touch = e.touches[0];
        setImagePosition({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y
        });
    }, [isDragging, zoomLevel, dragStart]);

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* ==================== STORE HEADER ==================== */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-5 flex items-center gap-4">
                {settings?.logoUrl && (
                    <div className="w-14 h-14 rounded-full bg-white overflow-hidden border-2 border-white/50 shrink-0 flex items-center justify-center">
                        <img
                            src={getImageUrl(settings.logoUrl)}
                            alt="Logo Toko"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold truncate">{settings?.storeName || 'Katalog Toko'}</h1>
                    {settings?.address && <p className="text-xs text-white/80 truncate mt-0.5">{settings.address}</p>}
                </div>
            </div>

            {/* ==================== TOOLBAR ==================== */}
            <div className="bg-white sticky top-0 z-40 shadow-sm px-4 py-3 flex items-center gap-3">
                {isSearching ? (
                    <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-3 py-2">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Cari produk..."
                            className="bg-transparent border-none outline-none flex-1 ml-2 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button onClick={() => { setIsSearching(false); setSearchQuery(''); }}>
                            <X size={18} className="text-gray-500" />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 relative">
                            <select
                                className="w-full bg-gray-100 text-gray-700 text-sm rounded-lg px-3 py-2.5 appearance-none outline-none font-medium"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="All">Semua Kategori</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                        <button onClick={() => setIsSearching(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                            <Search size={22} />
                        </button>
                        <button onClick={toggleViewMode} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                            {viewMode === 'grid' && <Grid size={22} />}
                            {viewMode === 'list' && <List size={22} />}
                            {viewMode === 'compact' && <AlignJustify size={22} />}
                        </button>
                    </>
                )}
            </div>

            {/* ==================== PRODUCT LIST ==================== */}
            <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3' : 'flex flex-col gap-3'}`}>
                {filteredProducts.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center text-gray-400">
                        <ShoppingBag size={48} className="mb-4 opacity-50" />
                        <p>Tidak ada produk ditemukan</p>
                    </div>
                ) : (
                    filteredProducts.map(product => {
                        const imageUrl = getImageUrl(product.imageUrl);

                        {/* ===== GRID VIEW ===== */}
                        if (viewMode === 'grid') {
                            return (
                                <div key={product.id} onClick={() => openProductDetail(product)} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
                                    <div className="aspect-square bg-gray-100 relative flex items-center justify-center overflow-hidden">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-gray-300 flex flex-col items-center gap-1">
                                                <Package size={32} />
                                            </div>
                                        )}
                                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${product.stock <= 5 ? 'bg-red-50 text-red-500' : 'bg-white/90 backdrop-blur-sm text-gray-600'}`}>
                                            {product.stock <= 5 ? `Sisa ${product.stock}` : `${product.stock} Stok`}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-sm text-gray-800 line-clamp-2 leading-tight">{product.name}</h3>
                                        <p className="font-bold text-gray-900 text-sm mt-1">{formatRupiah(product.price)}<span className="text-[10px] text-gray-400 font-normal"> /Pcs</span></p>
                                    </div>
                                </div>
                            );
                        }

                        {/* ===== LIST VIEW ===== */}
                        if (viewMode === 'list') {
                            return (
                                <div key={product.id} onClick={() => openProductDetail(product)} className="bg-white rounded-xl p-3 flex gap-3 items-center shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Package size={24} className="text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-gray-800 font-medium truncate">{product.name}</h3>
                                        <p className="font-bold text-gray-900 mt-0.5">{formatRupiah(product.price)}<span className="text-xs text-gray-400 font-normal"> /Pcs</span></p>
                                        <p className={`text-xs mt-0.5 font-medium ${product.stock <= 5 ? 'text-red-500' : 'text-gray-500'}`}>{product.stock} Stok</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                        <MessageCircle size={18} />
                                    </div>
                                </div>
                            );
                        }

                        {/* ===== COMPACT VIEW ===== */}
                        return (
                            <div key={product.id} onClick={() => openProductDetail(product)} className="bg-white px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 flex justify-between items-center active:bg-gray-100 transition-colors">
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-gray-800 font-medium truncate">{product.name}</h3>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <p className="font-bold text-gray-900">{formatRupiah(product.price)}<span className="text-xs text-gray-400 font-normal"> /Pcs</span></p>
                                        <p className={`text-xs font-medium ${product.stock <= 5 ? 'text-red-500' : 'text-gray-500'}`}>{product.stock} Stok</p>
                                    </div>
                                </div>
                                <MessageCircle size={20} className="text-green-500 shrink-0 ml-3" />
                            </div>
                        );
                    })
                )}
            </div>

            {/* ==================== PRODUCT DETAIL MODAL ==================== */}
            {showDetail && selectedProduct && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col">
                    {/* Detail Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                        <button onClick={closeProductDetail} className="p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full">
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="text-sm font-medium text-gray-700 truncate mx-3 flex-1 text-center">Detail Produk</h2>
                        <div className="w-8"></div>
                    </div>

                    {/* Detail Body (Scrollable) */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Product Image with Zoom */}
                        <div className="relative bg-gray-100 w-full aspect-square overflow-hidden select-none"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                        >
                            {getImageUrl(selectedProduct.imageUrl) ? (
                                <img
                                    src={getImageUrl(selectedProduct.imageUrl)}
                                    alt={selectedProduct.name}
                                    className="w-full h-full object-contain transition-transform duration-200"
                                    style={{
                                        transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                                    }}
                                    draggable={false}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                    <Package size={64} />
                                    <p className="text-sm mt-2">Tidak ada gambar</p>
                                </div>
                            )}

                            {/* Zoom Controls */}
                            {getImageUrl(selectedProduct.imageUrl) && (
                                <div className="absolute bottom-3 right-3 flex gap-2">
                                    <button onClick={handleZoomOut} disabled={zoomLevel <= 1} className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md disabled:opacity-30 active:scale-90 transition-transform">
                                        <ZoomOut size={18} className="text-gray-700" />
                                    </button>
                                    <button onClick={handleZoomIn} disabled={zoomLevel >= 4} className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md disabled:opacity-30 active:scale-90 transition-transform">
                                        <ZoomIn size={18} className="text-gray-700" />
                                    </button>
                                </div>
                            )}

                            {/* Zoom Indicator */}
                            {zoomLevel > 1 && (
                                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                                    {zoomLevel.toFixed(1)}x
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="px-5 py-4">
                            {selectedProduct.category && (
                                <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2.5 py-1 rounded-full">{selectedProduct.category.name}</span>
                            )}
                            <h1 className="text-xl font-bold text-gray-900 mt-3">{selectedProduct.name}</h1>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {formatRupiah(selectedProduct.price)}
                                <span className="text-sm text-gray-400 font-normal"> /Pcs</span>
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${selectedProduct.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedProduct.stock <= 5 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    Stok: {selectedProduct.stock}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fixed Bottom: WhatsApp CTA */}
                    <div className="shrink-0 border-t border-gray-100 bg-white px-5 py-4">
                        <button
                            onClick={() => openWhatsApp(selectedProduct)}
                            className="w-full bg-[#25D366] hover:bg-[#1fba59] active:bg-[#1aa84f] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-green-500/20"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Pesan via WhatsApp
                        </button>
                    </div>
                </div>
            )}

            {/* ==================== FLOATING WA BUTTON ==================== */}
            <button
                onClick={() => {
                    let phone = settings?.phone || '';
                    if (!phone) return;
                    if (phone.startsWith('0')) phone = '62' + phone.slice(1);
                    phone = phone.replace(/\D/g, '');
                    window.open(`https://wa.me/${phone}?text=Halo,%20saya%20ingin%20bertanya%20tentang%20katalog%20toko%20Anda.`, '_blank');
                }}
                className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform z-40"
            >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
        </div>
    );
}

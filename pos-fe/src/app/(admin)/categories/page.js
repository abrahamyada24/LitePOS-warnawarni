"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, TrendingUp, Package, Utensils, ArrowUpRight, ImageIcon, Trash2, Edit, Loader2, Filter } from 'lucide-react';
import { useStore } from '@/store/useStore';
import CategoryModal from '@/components/CategoryModal';
import { showAlert } from '@/utils/swal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CategoriesPage() {
    const { categories, fetchDataMaster } = useStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    useEffect(() => {
        fetchDataMaster();
    }, []);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('//')) {
            return path.startsWith('//') ? `https:${path}` : path;
        }
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${API_URL}/${cleanPath}`;
    };

    const getSpanClass = (size) => {
        switch (size) {
            case 'large': return 'md:col-span-2 md:row-span-2';
            case 'tall': return 'md:col-span-1 md:row-span-2';
            case 'wide': return 'md:col-span-2 md:row-span-1';
            default: return 'md:col-span-1 md:row-span-1';
        }
    }

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (category, e) => {
        e.stopPropagation();
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();

        const confirmed = await showAlert.confirm(
            "Hapus Kategori?",
            "PERHATIAN: Kategori hanya bisa dihapus jika tidak memiliki produk di dalamnya."
        );

        if (confirmed) {
            try {
                showAlert.loading("Menghapus kategori...");
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/products/categories/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const result = await res.json();

                if (res.ok && result.success) {
                    showAlert.success("Terhapus!", "Kategori berhasil dihilangkan.");
                    await fetchDataMaster();
                } else {

                    showAlert.error("Gagal Hapus", result.message || "Pastikan kategori sudah kosong dari produk sebelum dihapus.");
                }
            } catch (error) {
                showAlert.error("Network Error", "Gagal menghubungi server.");
            }
        }
    };

    const handleSaveCategory = async (formData) => {
        const token = localStorage.getItem('token');
        const data = new FormData();
        data.append('name', formData.name);
        data.append('displayType', formData.size);

        if (formData.imageFile) {
            data.append('image', formData.imageFile);
        }

        try {
            showAlert.loading(editingCategory ? "Memperbarui..." : "Menyimpan...");

            const url = editingCategory
                ? `${API_URL}/api/products/categories/${editingCategory.id}`
                : `${API_URL}/api/products/categories`;

            const method = editingCategory ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });

            const result = await res.json();

            if (res.ok && result.success) {
                setIsModalOpen(false);
                await fetchDataMaster();
                showAlert.success("Berhasil!", editingCategory ? "Kategori diperbarui." : "Kategori baru aktif.");
            } else {
                showAlert.error("Gagal Simpan", result.message || "Terjadi kesalahan saat menyimpan data.");
            }

        } catch (error) {
            showAlert.error("Error Jaringan", "Koneksi ke backend bermasalah.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Kategori Menu</h2>
                    <p className="text-gray-500 text-sm font-medium">Kelola tata letak dan kelompok menu restoran Anda.</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari kategori..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all text-sm font-medium"
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 shadow-xl shadow-blue-200 transition-all active:scale-95 whitespace-nowrap font-bold text-sm"
                    >
                        <Plus size={20} strokeWidth={3} /> Tambah
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] gap-6">
                {/* Modern Placeholder */}
                <div
                    onClick={handleAdd}
                    className="md:col-span-1 md:row-span-1 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all cursor-pointer bg-white group shadow-sm"
                >
                    <div className="p-4 bg-gray-50 rounded-3xl shadow-sm mb-3 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                        <Plus size={28} className="group-hover:text-blue-600" />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-[0.2em]">Tambah Kategori</span>
                </div>

                {filteredCategories.map((cat) => (
                    <div
                        key={cat.id}
                        className={`group relative rounded-[2.5rem] overflow-hidden border border-gray-50 bg-white hover:shadow-2xl transition-all duration-500 cursor-pointer ${getSpanClass(cat.displayType || 'normal')}`}
                        onClick={(e) => handleEdit(cat, e)}
                    >
                        <div className="absolute inset-0">
                            {cat.imageUrl ? (
                                <img src={getImageUrl(cat.imageUrl)} alt={cat.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            ) : (
                                <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-300">
                                    <ImageIcon size={48} strokeWidth={1} />
                                </div>
                            )}
                            {/* Visual Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        </div>

                        {/* Quick Actions Panel */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
                            <button
                                onClick={(e) => handleDelete(cat.id, e)}
                                className="p-3 rounded-2xl bg-white/10 backdrop-blur-xl text-white hover:bg-red-500 hover:scale-110 transition-all shadow-lg border border-white/10"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="absolute inset-0 p-7 flex flex-col justify-between z-10">
                            <div className="flex flex-wrap gap-2">
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-white text-[10px] font-black border border-white/10 uppercase tracking-tighter shadow-sm">
                                    <TrendingUp size={12} className="text-green-400" /> {cat.growth || '0%'}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-white text-[10px] font-black border border-white/10 uppercase tracking-tighter shadow-sm">
                                    <Package size={12} /> {cat.totalStock || 0} ITEMS
                                </span>
                            </div>

                            <div className="space-y-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="text-white font-black text-2xl tracking-tight leading-none group-hover:text-blue-400 transition-colors">
                                    {cat.name}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-300 text-[11px] font-bold uppercase tracking-widest">
                                    <Utensils size={12} className="text-blue-500" />
                                    <span>{cat.productCount || 0} MENU ITEMS</span>
                                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 text-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCategory}
                initialData={editingCategory}
            />
        </div>
    );
}
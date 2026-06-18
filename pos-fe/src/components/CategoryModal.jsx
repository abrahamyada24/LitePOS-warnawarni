"use client";

import { useState, useEffect } from 'react';
import { X, UploadCloud, LayoutGrid, Save, ImageIcon, Info, Edit3, Grid2X2, Maximize, AppWindow } from 'lucide-react';

export default function CategoryModal({ isOpen, onClose, onSave, initialData }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const [name, setName] = useState('');
  const [size, setSize] = useState('normal');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // --- HELPER UNTUK PREVIEW GAMBAR ---
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('//')) {
      return path.startsWith('//') ? `https:${path}` : path;
    }
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_URL}/${cleanPath}`;
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setSize(initialData.displayType || 'normal');
        setPreviewUrl(getImageUrl(initialData.imageUrl));
      } else {
        setName('');
        setSize('normal');
        setImageFile(null);
        setPreviewUrl('');
      }
    }
  }, [isOpen, initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, size, imageFile });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-300">

        {/* Modern Header - Dark Theme for Premium Look */}
        <div className="px-10 py-8 flex justify-between items-center bg-gray-950 text-white relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-[1.2rem] shadow-lg shadow-blue-500/20">
              <Grid2X2 size={24} />
            </div>
            <div>
              <h3 className="font-black text-2xl tracking-tight leading-none">
                {initialData ? 'Update Category' : 'New Category'}
              </h3>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.3em] mt-1.5">Management Studio</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

            {/* Foto Section */}
            <div className="md:col-span-5 space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Visual Preview</label>
              <div className="aspect-square rounded-[2.5rem] bg-gray-50 border-4 border-gray-100 flex flex-col items-center justify-center text-gray-400 relative overflow-hidden group hover:border-blue-500/30 transition-all cursor-pointer shadow-inner">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="flex flex-col items-center gap-3 group-hover:text-blue-500 transition-colors">
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <UploadCloud size={32} strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Pilih Gambar Utama</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Edit3 className="text-white" size={32} />
                </div>
              </div>
            </div>

            {/* Input Section */}
            <div className="md:col-span-7 space-y-8">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Nama Kategori</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] text-gray-900 font-bold text-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-300 shadow-sm"
                  placeholder="e.g. Traditional Food"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 ml-1">Bento Grid Layout</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'normal', label: 'Standard', size: '1x1', icon: AppWindow },
                    { id: 'wide', label: 'Wide', size: '2x1', icon: Maximize },
                    { id: 'tall', label: 'Tall', size: '1x2', icon: Maximize },
                    { id: 'large', label: 'Featured', size: '2x2', icon: Grid2X2 },
                  ].map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSize(opt.id)}
                        className={`p-4 rounded-[1.5rem] border-2 text-left transition-all relative group ${size === opt.id
                            ? 'border-blue-500 bg-blue-50/50 text-blue-900 shadow-md ring-8 ring-blue-500/5'
                            : 'border-gray-100 text-gray-400 hover:border-gray-200 bg-white'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-black text-xs uppercase tracking-tighter">{opt.label}</p>
                          <Icon size={14} className={size === opt.id ? 'text-blue-500' : 'text-gray-300'} />
                        </div>
                        <p className="text-[10px] font-bold opacity-60">{opt.size} Grid Units</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Tips Box */}
          <div className="bg-blue-50/50 p-6 rounded-[2rem] flex items-start gap-4 border border-blue-100/50">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Info size={20} />
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed font-bold italic opacity-80 uppercase tracking-tight">
              Sistem akan mengalkulasi statistik stok dan performa penjualan di bawah kelompok kategori ini secara otomatis setiap 24 jam.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-800 font-black uppercase tracking-[0.2em] text-[10px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-12 py-5 bg-blue-500 text-white rounded-[1.5rem] hover:bg-blue-600 shadow-2xl shadow-blue-500/30 transition-all active:scale-95 font-black text-sm flex items-center gap-3 uppercase tracking-widest"
            >
              <Save size={20} strokeWidth={3} />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
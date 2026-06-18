"use client";

import { useState } from 'react';
import { X, Save, Package, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';

export default function StockModal({ isOpen, onClose, onSave, products }) {
  const [formData, setFormData] = useState({
    productId: '',
    type: 'IN', 
    qty: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ productId: '', type: 'IN', qty: '', description: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Package size={20} className="text-blue-500" />
            Stock Opname (Penyesuaian)
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Produk</label>
            <div className="relative">
                <select 
                    required
                    value={formData.productId}
                    onChange={(e) => setFormData({...formData, productId: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white appearance-none"
                >
                    <option value="">-- Cari Produk --</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.sku} - {p.name} (Stok: {p.stock})
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Perubahan</label>
                <div className="flex flex-col gap-2">
                    <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${formData.type === 'IN' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                        <input 
                            type="radio" 
                            name="type" 
                            value="IN" 
                            checked={formData.type === 'IN'} 
                            onChange={() => setFormData({...formData, type: 'IN'})}
                            className="hidden" 
                        />
                        <ArrowDownRight size={18} />
                        <span className="font-bold text-sm">Masuk (In)</span>
                    </label>
                    <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${formData.type === 'OUT' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}>
                        <input 
                            type="radio" 
                            name="type" 
                            value="OUT" 
                            checked={formData.type === 'OUT'} 
                            onChange={() => setFormData({...formData, type: 'OUT'})}
                            className="hidden" 
                        />
                        <ArrowUpRight size={18} />
                        <span className="font-bold text-sm">Keluar (Out)</span>
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Qty)</label>
                <input 
                    required
                    type="number" 
                    min="1"
                    value={formData.qty}
                    onChange={(e) => setFormData({...formData, qty: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-lg"
                    placeholder="0"
                />
                <p className="text-xs text-gray-400 mt-1">
                    {formData.type === 'IN' ? 'Menambah stok gudang.' : 'Mengurangi stok (rusak/hilang).'}
                </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Alasan</label>
            <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                <textarea 
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="Contoh: Restock dari supplier A, atau Barang kadaluarsa..."
                ></textarea>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-200 font-medium flex items-center gap-2 transition-colors"
            >
              <Save size={18} />
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
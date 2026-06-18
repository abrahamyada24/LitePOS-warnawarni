"use client";

import { X, User } from 'lucide-react';

export default function MemberModal({ isOpen, onClose, memberSearch, setMemberSearch, filteredMembers, handleMemberSelect, getImageUrl }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden zoom-in-95">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800">Cari Member</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="p-4">
                <input 
                    autoFocus
                    type="text"
                    placeholder="Ketik nama atau No HP..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-4 pr-4 py-2 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 mb-4"
                />
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredMembers.length > 0 ? (
                        filteredMembers.map(member => (
                            <button key={member.id} onClick={() => handleMemberSelect(member)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                        {member.imageUrl ? <img src={getImageUrl(member.imageUrl)} className="w-full h-full object-cover"/> : <User className="m-2 text-gray-500"/>}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{member.name}</p>
                                        <p className="text-xs text-gray-500">{member.memberId} • {member.phone}</p>
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 text-sm">Tidak ada member ditemukan.</p>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
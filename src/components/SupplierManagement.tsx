import React, { useState } from 'react';
import { Supplier } from '../types';
import { Search, Plus, Trash2, Edit, Save, X, Phone, MapPin, Mail, Briefcase } from 'lucide-react';

interface SupplierManagementProps {
  suppliers: Supplier[];
  currentRole: string;
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onUpdateSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onLogActivity: (action: string, details: string) => void;
}

export default function SupplierManagement({
  suppliers,
  currentRole,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  onLogActivity,
}: SupplierManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setName('');
    setPhone('');
    setAddress('');
    setEmail('');
    setShowModal(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setName(supplier.name);
    setPhone(supplier.phone);
    setAddress(supplier.address);
    setEmail(supplier.email || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert('Mohon lengkapi data wajib (Nama, Nomor Telepon, Alamat).');
      return;
    }

    if (editingSupplier) {
      onUpdateSupplier({
        ...editingSupplier,
        name,
        phone,
        address,
        email: email || undefined,
      });
      onLogActivity('Edit Supplier', `Mengubah informasi supplier partner: ${name}`);
    } else {
      onAddSupplier({
        name,
        phone,
        address,
        email: email || undefined,
      });
      onLogActivity('Tambah Supplier', `Menyimpan rekanan supplier baru: ${name}`);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus supplier "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      onDeleteSupplier(id);
      onLogActivity('Hapus Supplier', `Menghapus rekanan supplier: ${name}`);
    }
  };

  const isAllowedToManage = ['Admin', 'Apoteker', 'Kasir'].includes(currentRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-bold text-slate-800 text-lg">Manajemen Supplier & Rekanan</h1>
          <p className="text-xs text-slate-500">
            Kelola data distributor farmasi, penyedia BMHP, dan mitra pengadaan kebutuhan operasional klinik
          </p>
        </div>
        {isAllowedToManage && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Rekanan Supplier Baru</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        {/* Search Filter bar */}
        <div className="flex justify-between items-center pb-2 flex-wrap gap-3">
          <div className="text-sm font-bold text-slate-850">
            Daftar Supplier Aktif ({suppliers.length} Rekanan)
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 w-64 pl-8"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Suppliers List Table */}
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left font-sans text-slate-700 table-auto border-collapse">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 bg-slate-50 uppercase font-bold tracking-wider">
                <th className="px-4 py-3">REKANAN SUPPLIER</th>
                <th className="px-4 py-3">TELEPON / KONTAK</th>
                <th className="px-4 py-3">ALAMAT DISTRIBUSI</th>
                <th className="px-4 py-3">ALAMAT EMAIL</th>
                {isAllowedToManage && <th className="px-4 py-3 text-right">AKSI</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">{sup.name}</span>
                        <span className="text-[10px] text-slate-450 font-mono font-bold uppercase">{sup.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-600 font-medium">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{sup.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 max-w-xs">
                    <div className="flex items-start space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-450 mt-0.5 shrink-0" />
                      <span className="truncate" title={sup.address}>{sup.address}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-500">
                    {sup.email ? (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3.5 w-3.5 text-slate-450" />
                        <span>{sup.email}</span>
                      </div>
                    ) : (
                      <span className="text-slate-350 italic">Tidak ada email</span>
                    )}
                  </td>
                  {isAllowedToManage && (
                    <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(sup)}
                        className="p-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg transition-colors border border-sky-100 inline-flex items-center"
                        title="Edit data supplier"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sup.id, sup.name)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100 inline-flex items-center"
                        title="Hapus Supplier"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Tidak ada supplier yang cocok dengan kata kunci pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-150">
            <h2 className="font-bold text-slate-800 text-lg mb-4">
              {editingSupplier ? 'Perbarui Rekanan Supplier' : 'Daftarkan Supplier Rekanan Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Nama Perusahaan / Supplier *</label>
                <input
                  type="text"
                  placeholder="Contoh: PT. Sumber Medika Mandiri"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl leading-none focus:outline-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Nomor Telepon / Sales *</label>
                <input
                  type="text"
                  placeholder="Contoh: 0812-3456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Alamat Kantor / Gudang *</label>
                <textarea
                  placeholder="Contoh: Komplek Pergudangan Bizhub Block B-12, Bogor"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl h-20 resize-none focus:outline-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Email Resmi (Opsional)</label>
                <input
                  type="email"
                  placeholder="Contoh: sales@sumbermedika.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-150 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
                >
                  {editingSupplier ? 'Perbarui Rekanan' : 'Simpan Rekanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

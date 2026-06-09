import React, { useState } from 'react';
import { Medicine, StockTransaction } from '../types';
import { Search, Plus, Trash2, Edit, AlertCircle, Sparkles, Check, ArrowRight, PackageX, Tags, FolderPlus, Coins, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';

interface MedicineInventoryProps {
  medicines: Medicine[];
  currentRole: string;
  onAddMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  onUpdateMedicine: (medicine: Medicine) => void;
  onLogActivity: (action: string, details: string) => void;
  medicineCategories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  stockTransactions: StockTransaction[];
  onAddStockTransaction: (
    medicineId: string,
    type: 'Stok Masuk' | 'Stok Keluar',
    qty: number,
    date: string,
    notes: string
  ) => void;
}

export default function MedicineInventory({
  medicines,
  currentRole,
  onAddMedicine,
  onUpdateMedicine,
  onLogActivity,
  medicineCategories = [],
  onAddCategory,
  onDeleteCategory,
  stockTransactions = [],
  onAddStockTransaction,
}: MedicineInventoryProps) {
  const [activeSubTab, setActiveSubTab] = useState<'katalog' | 'kategori' | 'transaksi'>('katalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedType, setSelectedType] = useState<'Semua' | 'Obat' | 'Non Obat'>('Semua');

  // Kategori input state
  const [newCategory, setNewCategory] = useState('');

  // Form state for Medicine
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState(medicineCategories[0] || 'Umum');
  const [stock, setStock] = useState(100);
  const [minStock, setMinStock] = useState(50);
  const [unit, setUnit] = useState('Tablet');
  const [price, setPrice] = useState(1000);
  const [expiryDate, setExpiryDate] = useState('2028-12-31');
  const [type, setType] = useState<'Obat' | 'Non Obat'>('Obat');

  // Manual stock mutasi state
  const [adjMedId, setAdjMedId] = useState('');
  const [adjType, setAdjType] = useState<'Stok Masuk' | 'Stok Keluar'>('Stok Masuk');
  const [adjQty, setAdjQty] = useState(10);
  const [adjDate, setAdjDate] = useState(new Date().toISOString().split('T')[0]);
  const [adjNotes, setAdjNotes] = useState('');

  const categoriesFilter = ['Semua', ...medicineCategories];

  const filteredMedicines = medicines.filter((m) => {
    // 3 Labels: Semua, Obat, and Non Obat filtering
    const matchesType = selectedType === 'Semua' || (m.type || 'Obat') === selectedType;
    
    // Non Obat has no category sub-tree list, so all Non Obat items are grouped into 1
    const matchesCategory =
      selectedType === 'Non Obat' ||
      selectedCategory === 'Semua' ||
      m.category === selectedCategory;

    const matchesQuery =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCategory && matchesQuery;
  });

  const handleOpenAddModal = () => {
    setEditingMedicine(null);
    setName('');
    setCode('OB-' + Math.floor(100 + Math.random() * 900));
    setCategory(medicineCategories[0] || 'Umum');
    setStock(100);
    setMinStock(50);
    setUnit('Tablet');
    setPrice(1000);
    setExpiryDate('2028-12-31');
    setType('Obat');
    setShowModal(true);
  };

  const handleOpenEditModal = (m: Medicine) => {
    setEditingMedicine(m);
    setName(m.name);
    setCode(m.code);
    setCategory(m.category);
    setStock(m.stock);
    setMinStock(m.minStock);
    setUnit(m.unit);
    setPrice(m.price);
    setExpiryDate(m.expiryDate);
    setType(m.type || 'Obat');
    setShowModal(true);
  };

  const handleSubmitMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !unit || price <= 0) {
      alert('Mohon isi semua data obat dengan benar.');
      return;
    }

    if (editingMedicine) {
      const updated: Medicine = {
        ...editingMedicine,
        name,
        code,
        category,
        stock: Number(stock),
        minStock: Number(minStock),
        unit,
        price: Number(price),
        expiryDate,
        type,
      };
      onUpdateMedicine(updated);
      onLogActivity('Modifikasi Farmasi', `Mengubah info katalog ${type} ${name} (ID: ${editingMedicine.id})`);
    } else {
      const mPayload: Omit<Medicine, 'id'> = {
        name,
        code,
        category,
        stock: Number(stock),
        minStock: Number(minStock),
        unit,
        price: Number(price),
        expiryDate,
        type,
      };
      onAddMedicine(mPayload);
      onLogActivity('Barang Baru', `Menambahkan katalog ${type} baru ke depo: ${name} (Code: ${code})`);
    }

    setShowModal(false);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCat = newCategory.trim();
    if (!cleanCat) return;

    if (medicineCategories.some(c => c.toLowerCase() === cleanCat.toLowerCase())) {
      alert('Kategori obat ini sudah terdaftar.');
      return;
    }

    onAddCategory(cleanCat);
    onLogActivity('Tambah Kategori Obat', `Menambahkan kategori obat baru: ${cleanCat}`);
    setNewCategory('');
  };

  const handleDeleteCategoryClick = (cat: string) => {
    const isUsed = medicines.some(m => m.category === cat);
    if (isUsed) {
      alert(`Kategori "${cat}" tidak dapat dihapus karena masih digunakan oleh beberapa katalog obat aktif.`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus kategori obat "${cat}"?`)) {
      onDeleteCategory(cat);
      onLogActivity('Hapus Kategori Obat', `Menghapus kategori obat: ${cat}`);
      if (selectedCategory === cat) {
        setSelectedCategory('Semua');
      }
    }
  };

  const handleManualAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjMedId) {
      alert('Mohon pilih barang depo terlebih dahulu.');
      return;
    }
    if (adjQty <= 0) {
      alert('Jumlah (Qty) transaksi harus lebih besar dari 0.');
      return;
    }
    if (!adjNotes.trim()) {
      alert('Mohon isi catatan atau alasan mutasi stok.');
      return;
    }

    const targetMed = medicines.find(m => m.id === adjMedId);
    if (!targetMed) return;

    if (adjType === 'Stok Keluar' && targetMed.stock < adjQty) {
      if (!confirm(`Sisa stok fisik di sistem saat ini (${targetMed.stock}) lebih sedikit dibanding mutasi keluar (${adjQty}). Apakah Anda ingin melanjutkan transaksi ini?`)) {
        return;
      }
    }

    onAddStockTransaction(adjMedId, adjType, adjQty, adjDate, adjNotes.trim());
    onLogActivity('Koreksi Stok Manual', `Mencatat mutasi manual ${adjType} item ${targetMed.name} sebanyak ${adjQty} satuan`);
    
    // Reset form states
    setAdjMedId('');
    setAdjQty(10);
    setAdjNotes('');
    alert('Mutasi manual berhasil diposting dan sisa stok inventaris otomatis diperbarui!');
  };

  const isAllowedToManage = ['Admin', 'Apoteker', 'Dokter', 'Perawat'].includes(currentRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-bold text-slate-800 text-lg">Depo & Inventaris Obat (Farmasi)</h1>
          <p className="text-xs text-slate-500">Mencatat stok, kemasan, batas kedaluwarsa, harga ecer, restorasi stok, dan manajemen kategori obat</p>
        </div>
        {isAllowedToManage && activeSubTab === 'katalog' && (
          <button
            id="btn-tambah-obat"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer border-none"
          >
            <Plus className="h-4 w-4" />
            <span>Katalog Barang Baru</span>
          </button>
        )}
      </div>

      {/* Sub Menu Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-1">
        <button
          onClick={() => setActiveSubTab('katalog')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 border-none cursor-pointer bg-transparent ${
            activeSubTab === 'katalog'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PackageX className="h-4 w-4" />
          <span>Katalog & Stok Barang</span>
        </button>

        <button
          onClick={() => setActiveSubTab('kategori')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 border-none cursor-pointer bg-transparent ${
            activeSubTab === 'kategori'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tags className="h-4 w-4" />
          <span>Sub Menu: Kategori Obat ({medicineCategories.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('transaksi')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 border-none cursor-pointer bg-transparent ${
            activeSubTab === 'transaksi'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Coins className="h-4 w-4 text-emerald-600" />
          <span className="font-bold text-slate-700">Sub Menu: Transaksi Stok ({stockTransactions.length})</span>
        </button>
      </div>

      {activeSubTab === 'katalog' ? (
        /* CATALOG LIST VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            
            {/* Combined Filter Jenis Obat & Kategori Obat as a dynamic dropdown list */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-1">
                <label className="block text-[11px] text-emerald-800 font-bold uppercase tracking-wider">
                  Gabungan Filter Jenis & Kategori Obat/Barang :
                </label>
                <select
                  id="combined-filter-dropdown"
                  value={`${selectedType}:${selectedCategory}`}
                  onChange={(e) => {
                    const [t, c] = e.target.value.split(':');
                    setSelectedType(t as any);
                    setSelectedCategory(c);
                  }}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Semua:Semua">🌟 Semua Jenis & Kategori</option>
                  
                  <optgroup label="💊 SEGMEN: LABELED OBAT (List Kategori)">
                    <option value="Obat:Semua">💊 Semua Kategori Obat</option>
                    {medicineCategories.map((cat) => (
                      <option key={`Obat:${cat}`} value={`Obat:${cat}`}>↳ Obat - {cat}</option>
                    ))}
                  </optgroup>

                  <optgroup label="📦 SEGMEN: NON-OBAT (Satu Kategori Utama)">
                    <option value="Non Obat:Semua">📦 Non Obat (Semua Gabung Beras & Alkes)</option>
                  </optgroup>
                </select>
              </div>

              <div className="w-full sm:w-60 space-y-1">
                <label className="block text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  Cari Nama atau Kode :
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari nama atau kode..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none pl-8"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Table Container listing medicine inventories */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left font-sans text-slate-700 table-auto border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-400 bg-slate-50 uppercase font-bold tracking-wider">
                    <th className="px-4 py-2.5">KODE / NAMA BARANG</th>
                    <th className="px-4 py-2.5">LABEL JENIS</th>
                    <th className="px-4 py-2.5">KATEGORI KELAS</th>
                    <th className="px-4 py-2.5">SISA STOK</th>
                    <th className="px-4 py-2.5">HARGA SATUAN</th>
                    <th className="px-4 py-2.5">KADALUWARSA</th>
                    {isAllowedToManage && <th className="px-4 py-2.5 text-right">AKSI</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMedicines.map((m) => {
                    const outOfStock = m.stock <= 0;
                    const criticalStock = m.stock <= m.minStock;
                    const isObatItem = (m.type || 'Obat') === 'Obat';
                    return (
                      <tr key={m.id} className={`hover:bg-slate-55/40 transition-colors ${
                        criticalStock ? 'bg-amber-50/20' : ''
                      }`}>
                        <td className="px-4 py-3 font-semibold">
                          <span className="font-mono block text-[10px] text-slate-400">{m.code}</span>
                          <span className="text-slate-800 block font-bold">{m.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isObatItem 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-250/50' 
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-250/50'
                          }`}>
                            {isObatItem ? '💊 Obat' : '📦 Non Obat'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-medium">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px]">
                            {m.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-slate-750 font-mono block">
                            {m.stock} {m.unit}
                          </span>
                          {outOfStock ? (
                            <span className="text-[10px] text-rose-600 block font-bold uppercase mt-0.5 animate-pulse">Habis</span>
                          ) : criticalStock ? (
                            <span className="text-[10px] text-amber-600 block font-bold uppercase mt-0.5">Restock Segera</span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 block uppercase mt-0.5 font-medium">Aman</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-emerald-800 font-bold font-mono">
                          Rp {m.price.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-slate-450 font-mono font-bold">
                          {m.expiryDate}
                        </td>
                        {isAllowedToManage && (
                          <td className="px-4 py-3 text-right">
                            <button
                              id={`btn-edit-obat-${m.id}`}
                              onClick={() => handleOpenEditModal(m)}
                              className="p-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg transition-colors border border-sky-100 inline-flex items-center cursor-pointer"
                              title="Edit data / Update Stock obat ini"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {filteredMedicines.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Tidak ada data inventaris di kategori dan label ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column sidebar: Depo Farmasi info card */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <PackageX className="h-40 w-40" />
              </div>
              
              <h3 className="font-bold text-sm tracking-wide border-b border-slate-800 pb-3 mb-4 uppercase">
                STATUS LIST DEPO SEKARANG
              </h3>

              <div className="space-y-4 text-xs font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Katalog Label Obat</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {medicines.filter(m => (m.type || 'Obat') === 'Obat').length} Jenis
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Katalog Label Non-Obat</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {medicines.filter(m => (m.type || 'Obat') === 'Non Obat').length} Jenis
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                  <span className="text-slate-450">Total Stok Fisik (Semua)</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {medicines.reduce((sum, item) => sum + item.stock, 0)} Satuan
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Batas Menipis (Warning)</span>
                  <span className="font-mono font-bold text-amber-450 text-sm">
                    {medicines.filter(m => m.stock <= m.minStock).length} Item
                  </span>
                </div>
              </div>

              <div className="mt-5 p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 text-[11px] leading-relaxed text-slate-400">
                <span className="font-bold text-amber-500 block">PENGINGAT KARTU STOK:</span>
                Semua pertambahan stok baru via sub-menu pembelian atau koreksi manual akan terintegrasi langsung ke ledger saldo balance stok.
              </div>
            </div>
          </div>
        </div>
      ) : activeSubTab === 'kategori' ? (
        /* CATEGORY MANAGEMENT VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* List of categories with count */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Daftar Kategori Obat Terintegrasi</h3>
              <p className="text-xs text-slate-500">Menghapus atau memantau kategori obat yang tersedia pada form input apotek</p>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left font-sans text-slate-700 table-auto border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-400 bg-slate-50 uppercase font-bold tracking-wider">
                    <th className="px-4 py-2.5">NAMA KATEGORI OBAT</th>
                    <th className="px-4 py-2.5">TOTAL KATALOG OBAT TERKAIT</th>
                    <th className="px-4 py-2.5 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicineCategories.map((cat, index) => {
                    const count = medicines.filter(m => m.category === cat).length;
                    return (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {cat}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500 font-semibold">
                          {count} Item Obat
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteCategoryClick(cat)}
                            className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100 inline-flex items-center cursor-pointer"
                            title="Hapus Kategori ini"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {medicineCategories.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-slate-400">
                        Belum ada kategori yang terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Category Form Column */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Tambah Kategori Baru</h3>
              <p className="text-xs text-slate-500">Mendaftarkan kategori baru agar tersedia saat input atau import obat</p>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Nama Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: Obat Bius, Antihistamin"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-emerald-600 leading-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border-none"
              >
                <FolderPlus className="h-4 w-4" />
                <span>Simpan Kategori</span>
              </button>
            </form>

            <div className="p-3.5 bg-sky-50 text-sky-800 rounded-xl text-[11px] leading-relaxed border border-sky-100">
              <span className="font-bold block mb-0.5">INFO INTEGRASI:</span>
              Kategori yang ditambahkan di sini akan langsung muncul pada pilihan dropdown kategori saat Anda menambahkan atau mengedit katalog obat.
            </div>
          </div>
        </div>
      ) : (
        /* TRANSACTION LEDGER AND ADJUSTMENT VIEW (SUB MENU TRANSAKSI STOK) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* LEDGER ENTRIES LIST */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span>Sub-Menu Transaksi: Buku Mutasi & Ledger Stok</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Histori balance kartu obat keluar-masuk (Penjualan, PO Suplier, Koreksi Manual)</p>
              </div>
              <div className="text-right text-xs bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700 font-bold">
                Balance: {medicines.reduce((sum, item) => sum + item.stock, 0)} Unit Terdaftar
              </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto text-xs border border-slate-100 rounded-xl">
              <table className="w-full text-left font-sans text-slate-700 table-auto border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-400 bg-slate-50 uppercase font-bold tracking-wider sticky top-0 bg-slate-50 z-10 text-[10px]">
                    <th className="px-4 py-3">TANGGAL & REF ID</th>
                    <th className="px-4 py-3">BARANG DEPO</th>
                    <th className="px-4 py-3">JENIS MUTASI</th>
                    <th className="px-4 py-3 text-center">QTY</th>
                    <th className="px-4 py-3 text-right">STOK AKHIR</th>
                    <th className="px-4 py-3 pl-6">ALASAN / KETERANGAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockTransactions.map((tx) => {
                    const isMasuk = tx.type === 'Stok Masuk';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono block text-slate-500 font-bold">{tx.date}</span>
                          <span className="font-semibold block text-[9px] text-slate-600 bg-sky-50 rounded px-1.5 py-0.5 inline-block mt-0.5 mt-1 border border-sky-100">{tx.reference}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-800 block">{tx.medicineName}</span>
                          <span className="font-mono text-[9px] text-slate-400 block">ID: {tx.medicineId}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black ${
                            isMasuk ? 'bg-emerald-50 text-emerald-700 font-mono' : 'bg-rose-50 text-rose-700 font-mono'
                          }`}>
                            {isMasuk ? '↑ STOK MASUK' : '↓ STOK KELUAR'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-center font-mono font-bold text-sm ${isMasuk ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isMasuk ? `+${tx.qty}` : `-${tx.qty}`}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700 font-black text-sm">
                          {tx.balanceAfter}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-medium pl-6 leading-relaxed text-[11px] max-w-[200px]">
                          {tx.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                  {stockTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        Belum ada mutasi stok yang tercatat dalam sistem.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ADJUSTMENT ENTRY FORM COLUMN */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Catat Mutasi Stok Manual</h3>
              <p className="text-xs text-slate-500">Form penyesuaian/koreksi stok, barang hilang, rusak, atau penambahan sample obat.</p>
            </div>

            <form onSubmit={handleManualAdjustmentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Pilih Barang dari Inventaris</label>
                <select
                  value={adjMedId}
                  onChange={e => setAdjMedId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-emerald-600 font-bold text-slate-800"
                  required
                >
                  <option value="" disabled>-- Pilih Barang --</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.code}] {m.name} ({m.type || 'Obat'} | Stok: {m.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Jenis Transaksi</label>
                  <select
                    value={adjType}
                    onChange={e => setAdjType(e.target.value as 'Stok Masuk' | 'Stok Keluar')}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-emerald-600 font-bold text-slate-800"
                    required
                  >
                    <option value="Stok Masuk">🟢 Stok Masuk (+)</option>
                    <option value="Stok Keluar">🔴 Stok Keluar (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Jumlah (Qty)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={adjQty}
                    onChange={e => setAdjQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-emerald-600 font-mono font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Tanggal Transaksi</label>
                <input
                  type="date"
                  value={adjDate}
                  onChange={e => setAdjDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-emerald-600 font-mono font-bold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Catatan / Keterangan Penyesuaian</label>
                <textarea
                  rows={4}
                  placeholder="Contoh: Stok opname bulanan, barang pecah di gudang, expired ampul, dll."
                  value={adjNotes}
                  onChange={e => setAdjNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 border-slate-200 focus:outline-emerald-600 text-xs leading-normal font-semibold text-slate-700"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors border-none cursor-pointer outline-none shadow-sm text-xs mt-2"
              >
                <span>Catat Mutasi & Sesuaikan Stok</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Medicine Modal popup */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <h2 className="font-bold text-slate-800 text-lg mb-4">
              {editingMedicine ? 'Update Informasi Katalog' : 'Tambah Katalog Depo Baru'}
            </h2>

            <form onSubmit={handleSubmitMedicine} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Kode Batch / Item</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm uppercase leading-none font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Kemasan Satuan (Unit)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tablet, Botol, Ampul"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Nama Deskriptif Barang</label>
                <input
                  type="text"
                  placeholder="Contoh: Paracetamol 500mg, Amoxicillin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              {/* 3 type label selection input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Jenis Inventaris</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Obat' | 'Non Obat')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Obat">💊 Obat</option>
                    <option value="Non Obat">📦 Non Obat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Kategori / Kelas Kelompok</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {medicineCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Stok Awal Tersedia</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Minimal Stok Aman (Min)</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Harga Satuan Eceran (Rp)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Tanggal Kedaluwarsa</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-150 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors border-none cursor-pointer"
                >
                  Urungkan
                </button>
                <button
                  id="btn-simpan-obat"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors border-none cursor-pointer"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

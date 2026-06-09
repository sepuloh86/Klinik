import React, { useState, useEffect } from 'react';
import { Purchase, Supplier, Medicine } from '../types';
import {
  Search,
  Plus,
  Calendar,
  ArrowDownLeft,
  Receipt,
  Percent,
  Building2,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle,
  Truck,
  RotateCcw,
  Info,
  DollarSign
} from 'lucide-react';

interface PurchaseManagementProps {
  purchases: Purchase[];
  suppliers: Supplier[];
  currentRole: string;
  onAddPurchase: (purchase: Omit<Purchase, 'id' | 'invoiceNumber'> & { medicineId?: string; qty?: number; paymentStatus?: 'Hutang' | 'Bayar Lunas' }) => void;
  onUpdatePurchase: (purchase: Purchase) => void;
  onDeletePurchase: (id: string) => void;
  onReceivePurchase: (purchaseId: string, qtyToReceive: number, date: string, notes: string) => void;
  onLogActivity: (action: string, details: string) => void;
  medicines: Medicine[];
}

export default function PurchaseManagement({
  purchases,
  suppliers,
  currentRole,
  onAddPurchase,
  onUpdatePurchase,
  onDeletePurchase,
  onReceivePurchase,
  onLogActivity,
  medicines = [],
}: PurchaseManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals status
  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [selectedViewPurchase, setSelectedViewPurchase] = useState<Purchase | null>(null);

  // General Form states
  const [supplierId, setSupplierId] = useState('');
  const [itemsDescription, setItemsDescription] = useState('');
  const [taxType, setTaxType] = useState<'Non PPn' | 'Include' | 'Exclude'>('Non PPn');
  const [amountInput, setAmountInput] = useState(100000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Pembelian Obat & BMHP');
  const [paymentStatusInput, setPaymentStatusInput] = useState<'Hutang' | 'Bayar Lunas'>('Hutang');

  // Integrasi Barang fields
  const [selectedMedId, setSelectedMedId] = useState('');
  const [purchaseQty, setPurchaseQty] = useState(10);
  const [unitPrice, setUnitPrice] = useState(1000);

  // Receive Form states inside view modal
  const [qtyToReceiveInput, setQtyToReceiveInput] = useState(1);
  const [receiveNotes, setReceiveNotes] = useState('');

  const purchaseCategories = [
    'Pembelian Obat & BMHP',
    'Alat Kesehatan & Medis',
    'Alat Tulis Kantor (ATK)',
    'Operasional & Perbaikan',
    'Inventaris Klinik & Gadget'
  ];

  const isObatCategory = category === 'Pembelian Obat & BMHP';
  const filteredCategoryMeds = medicines.filter(m => {
    const isObat = (m.type || 'Obat') === 'Obat';
    return isObatCategory ? isObat : !isObat;
  });

  // When category changes, auto-select the first matching item & price
  useEffect(() => {
    if (editingPurchase) return; // Ignore on Edit
    const isObat = category === 'Pembelian Obat & BMHP';
    const relevant = medicines.filter(m => {
      const isO = (m.type || 'Obat') === 'Obat';
      return isObat ? isO : !isO;
    });

    if (relevant.length > 0) {
      const defaultItem = relevant[0];
      setSelectedMedId(defaultItem.id);
      setUnitPrice(defaultItem.price);
      setItemsDescription(`Pembelian ${defaultItem.name} sebanyak ${purchaseQty} ${defaultItem.unit}`);
    } else {
      setSelectedMedId('');
      setUnitPrice(1000);
      setItemsDescription('');
    }
  }, [category, medicines, editingPurchase]);

  // When selection, qty or price changes, recalculate description and total amount
  useEffect(() => {
    const med = medicines.find(m => m.id === selectedMedId);
    if (med) {
      setAmountInput(purchaseQty * unitPrice);
      setItemsDescription(`Pembelian ${med.name} sebanyak ${purchaseQty} ${med.unit}`);
    }
  }, [selectedMedId, purchaseQty, unitPrice, medicines]);

  const handleMedicineSelectionChange = (id: string) => {
    setSelectedMedId(id);
    const med = medicines.find(m => m.id === id);
    if (med) {
      setUnitPrice(med.price);
    }
  };

  // PPn live calculations
  const calculateTaxBreakdown = (rawAmount: number, type: 'Non PPn' | 'Include' | 'Exclude') => {
    let base = rawAmount;
    let tax = 0;
    let total = rawAmount;

    if (type === 'Include') {
      tax = Math.round((rawAmount * 11) / 111);
      base = rawAmount - tax;
      total = rawAmount;
    } else if (type === 'Exclude') {
      base = rawAmount;
      tax = Math.round(rawAmount * 0.11);
      total = rawAmount + tax;
    } else {
      base = rawAmount;
      tax = 0;
      total = rawAmount;
    }

    return { base, tax, total };
  };

  const { base, tax, total } = calculateTaxBreakdown(amountInput, taxType);

  const filteredPurchases = purchases.filter(
    (p) =>
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.itemsDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingPurchase(null);
    setSupplierId(suppliers[0]?.id || '');
    setTaxType('Non PPn');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Pembelian Obat & BMHP');
    setPurchaseQty(50);
    setPaymentStatusInput('Hutang');
    
    // Default select first item
    const relevance = medicines.filter(m => (m.type || 'Obat') === 'Obat');
    if (relevance.length > 0) {
      setSelectedMedId(relevance[0].id);
      setUnitPrice(relevance[0].price);
      setAmountInput(50 * relevance[0].price);
      setItemsDescription(`Pembelian ${relevance[0].name} sebanyak 50 ${relevance[0].unit}`);
    } else {
      setAmountInput(100000);
      setItemsDescription('');
    }
    setShowModal(true);
  };

  const handleOpenEditModal = (p: Purchase) => {
    setEditingPurchase(p);
    setSupplierId(p.supplierId);
    setDate(p.date);
    setCategory(p.category);
    setTaxType(p.taxType);
    setSelectedMedId(p.medicineId || '');
    setPurchaseQty(p.qty || 0);

    const matchMed = medicines.find(m => m.id === p.medicineId);
    if (matchMed) {
      const rawPrice = p.qty && p.qty > 0 ? Math.round(p.baseAmount / p.qty) : matchMed.price;
      setUnitPrice(rawPrice);
    } else {
      setUnitPrice(1000);
    }

    setAmountInput(p.baseAmount + (p.taxType === 'Exclude' ? 0 : 0));
    setItemsDescription(p.itemsDescription);
    setPaymentStatusInput(p.paymentStatus || 'Hutang');
    setShowModal(true);
  };

  const handleDeleteClick = (p: Purchase) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pencatatan pembelian ${p.invoiceNumber}? \n\nTindakan ini tidak akan membalikkan stok yang sudah diterima.`)) {
      onDeletePurchase(p.id);
      onLogActivity('Hapus Pembelian', `Menghapus invoice pembelian ${p.invoiceNumber}`);
    }
  };

  const handleTogglePaymentStatus = (p: Purchase) => {
    if (p.paymentStatus === 'Bayar Lunas') {
      alert('Informasi Pembelian ini sudah lunas!');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin melunasi transaksi PO ${p.invoiceNumber} ini sebesar Rp ${p.totalAmount.toLocaleString('id-ID')}? \n\nHal ini otomatis akan dicatat sebagai KAS KELUAR.`)) {
      const updated: Purchase = {
        ...p,
        paymentStatus: 'Bayar Lunas'
      };
      onUpdatePurchase(updated);
      onLogActivity('Koreksi Pembayaran', `Melunasi tagihan Hutang PO ${p.invoiceNumber} menjadi Lunas / Terbayar.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      alert('Pilih supplier terlebih dahulu.');
      return;
    }
    if (!selectedMedId) {
      alert('Pilih barang inventaris terlebih dahulu.');
      return;
    }
    if (purchaseQty <= 0) {
      alert('Jumlah (Qty) pembelian wajib lebih besar dari 0.');
      return;
    }
    if (unitPrice <= 0) {
      alert('Harga beli per psc harus lebih besar dari 0.');
      return;
    }

    const selectedSupplier = suppliers.find((s) => s.id === supplierId)!;
    const breakdown = calculateTaxBreakdown(amountInput, taxType);

    if (editingPurchase) {
      const updated: Purchase = {
        ...editingPurchase,
        date,
        supplierId,
        supplierName: selectedSupplier.name,
        itemsDescription: itemsDescription.trim(),
        taxType,
        baseAmount: breakdown.base,
        taxAmount: breakdown.tax,
        totalAmount: breakdown.total,
        category,
        medicineId: selectedMedId,
        qty: purchaseQty,
        paymentStatus: paymentStatusInput
      };
      onUpdatePurchase(updated);
      onLogActivity('Edit Pembelian', `Mengubah rincian PO ${editingPurchase.invoiceNumber}`);
      alert('Data transaksi pembelian berhasil diperbarui!');
    } else {
      onAddPurchase({
        date,
        supplierId,
        supplierName: selectedSupplier.name,
        itemsDescription: itemsDescription.trim(),
        taxType,
        baseAmount: breakdown.base,
        taxAmount: breakdown.tax,
        totalAmount: breakdown.total,
        category,
        medicineId: selectedMedId,
        qty: purchaseQty,
        paymentStatus: paymentStatusInput
      });

      onLogActivity(
        'Pembelian Klinik',
        `Mencatat pembelian Rp ${breakdown.total.toLocaleString('id-ID')} kepada ${selectedSupplier.name} (${taxType}) - Status: ${paymentStatusInput}`
      );
    }

    setShowModal(false);
    setEditingPurchase(null);
  };

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedViewPurchase) return;

    const totalOrdered = selectedViewPurchase.qty || 0;
    const alreadyReceived = selectedViewPurchase.receivedQty || 0;
    const remaining = totalOrdered - alreadyReceived;

    if (qtyToReceiveInput <= 0) {
      alert('Jumlah receive harus minimal 1 unit!');
      return;
    }

    if (qtyToReceiveInput > remaining) {
      if (!confirm(`Jumlah yang Anda terima (${qtyToReceiveInput}) melebihi sisa pesanan PO (${remaining}). Apakah Anda yakin ingin memproses penerimaan berlebih ini?`)) {
        return;
      }
    }

    onReceivePurchase(
      selectedViewPurchase.id,
      qtyToReceiveInput,
      new Date().toISOString().split('T')[0],
      receiveNotes.trim()
    );

    onLogActivity(
      'Receive Barang',
      `Menerima fisik ${qtyToReceiveInput} unit barang untuk PO ${selectedViewPurchase.invoiceNumber}`
    );

    alert(`Sukses! ${qtyToReceiveInput} unit barang berhasil dimasukkan ke sisa stok aktif Depo.`);
    
    // Refresh modal info
    const reloaded = purchases.find(p => p.id === selectedViewPurchase.id);
    if (reloaded) {
      const currentReceived = reloaded.receivedQty || 0;
      const newReceived = currentReceived + qtyToReceiveInput;
      const targetQty = reloaded.qty || 0;
      const reloadedStatus = newReceived >= targetQty ? 'Closed' : (newReceived > 0 ? 'Partial' : 'Pending');
      
      setSelectedViewPurchase({
        ...reloaded,
        receivedQty: Math.min(targetQty, newReceived),
        receiveStatus: reloadedStatus,
      });
    } else {
      setSelectedViewPurchase(null);
    }

    setQtyToReceiveInput(1);
    setReceiveNotes('');
  };

  const isAllowedToManage = ['Admin', 'Apoteker', 'Kasir'].includes(currentRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-bold text-slate-800 text-lg">Pembelian Klinik (Purchase Portal)</h1>
          <p className="text-xs text-slate-500">
            Pencatatan pembelian obat, BMHP, ATK, inventaris, dan kebutuhan operasional dengan perhitungan PPN 11% terintegrasi Kas Keluar
          </p>
        </div>
        {isAllowedToManage && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer border-none"
          >
            <Plus className="h-4 w-4" />
            <span>Catat Purchase Baru</span>
          </button>
        )}
      </div>

      {/* Stats of purchase breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200/65 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Total Transaksi</span>
            <span className="text-xl font-black text-slate-800 tracking-tight block mt-1">
              {purchases.length} Pembelian
            </span>
          </div>
          <Receipt className="h-8 w-8 text-slate-400 opacity-60" />
        </div>

        <div className="bg-red-50/70 border border-red-100 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-red-700 font-bold block uppercase tracking-wider font-mono">Total Pengeluaran (PO)</span>
            <span className="text-xl font-black text-red-800 tracking-tight block mt-1 font-mono">
              Rp {purchases.reduce((acc, p) => acc + p.totalAmount, 0).toLocaleString('id-ID')}
            </span>
          </div>
          <ArrowDownLeft className="h-8 w-8 text-red-500 opacity-60" />
        </div>

        <div className="bg-amber-50/70 border border-amber-100 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-700 font-bold block uppercase tracking-wider font-mono">Hutang Belum Terbayar</span>
            <span className="text-xl font-black text-amber-805 tracking-tight block mt-1 font-mono">
              Rp {purchases.filter(p => p.paymentStatus !== 'Bayar Lunas').reduce((acc, p) => acc + p.totalAmount, 0).toLocaleString('id-ID')}
            </span>
          </div>
          <Percent className="h-8 w-8 text-amber-500 opacity-60" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 flex-wrap gap-3">
          <div className="text-sm font-bold text-slate-850">
            Riwayat Pembelian & Log Penyerahan Depo
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari PO, deskripsi, supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 w-64 pl-8"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Purchase lists tables */}
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left font-sans text-slate-700 table-auto border-collapse">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 bg-slate-50 uppercase font-bold tracking-wider">
                <th className="px-4 py-3">NO INVOICE / TANGGAL</th>
                <th className="px-4 py-3">SUPPLIER REKANAN</th>
                <th className="px-4 py-3">URAIAN BARANG & KATEGORI</th>
                <th className="px-4 py-3">STATUS BAYAR</th>
                <th className="px-4 py-3">STATUS RECEIVE</th>
                <th className="px-4 py-3 text-right">TOTAL TRANSAKSI</th>
                <th className="px-4 py-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.map((pur) => {
                const isPaid = pur.paymentStatus === 'Bayar Lunas';
                const recStatus = pur.receiveStatus || 'Pending';
                
                return (
                  <tr key={pur.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Invoice & Date */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-800 block font-mono">{pur.invoiceNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center mt-0.5">
                        <Calendar className="h-3 w-3 mr-1" /> {pur.date}
                      </span>
                    </td>

                    {/* Supplier */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-750">{pur.supplierName}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-750 mb-1">
                        {pur.category}
                      </span>
                      <span className="block text-slate-650 leading-tight max-w-sm truncate font-semibold" title={pur.itemsDescription}>
                        {pur.itemsDescription}
                      </span>
                    </td>

                    {/* Column Pembayaran: clickable label status */}
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePaymentStatus(pur)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide border cursor-pointer transition-all ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                        title={isPaid ? "Terbayar (Selesai)" : "Hutang (Klik untuk Bayar Lunas)"}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                        <span>{isPaid ? 'Terbayar' : 'Hutang'}</span>
                      </button>
                    </td>

                    {/* Status Receive: pending, partial, closed */}
                    <td className="px-4 py-3.5">
                      {recStatus === 'Closed' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Closed (Received)
                        </span>
                      ) : recStatus === 'Partial' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-55 bg-amber-50 text-amber-700 border border-amber-200">
                          Partial (Received: {pur.receivedQty})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-205">
                          Pending PO
                        </span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-705 text-slate-800 text-sm">
                      Rp {pur.totalAmount.toLocaleString('id-ID')}
                    </td>

                    {/* Action Column: Lihat (receive), Edit, Delete as requested */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {/* Lihat */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedViewPurchase(pur);
                          }}
                          className="p-1 px-2 bg-sky-55/70 text-sky-700 hover:bg-sky-100 rounded-lg transition-colors border border-sky-200 flex items-center gap-1 cursor-pointer font-bold"
                          title="Lihat rincian PO & Receive Barang"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Lihat</span>
                        </button>

                        {/* Edit & Delete (Permitted for management staff) */}
                        {isAllowedToManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(pur)}
                              className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors border-none cursor-pointer"
                              title="Edit rincian item PO"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(pur)}
                              className="p-1 text-slate-600 hover:text-red-650 hover:bg-slate-100 rounded-md transition-colors border-none cursor-pointer"
                              title="Hapus riwayat PO ini"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-450">
                    Belum ada riwayat pencatatan pembelian yang tersimpan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Purchase modal popup */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-150">
            <h2 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Plus className="h-4 w-4" /></span>
              <span>{editingPurchase ? 'Edit Informasi Pembelian' : 'Catat Pembelian & Kebutuhan Baru'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Pos Kategori Belanja *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {purchaseCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-500 font-bold mb-1">Pilih Supplier Rekanan *</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    required
                  >
                    <option value="" disabled>-- Pilih Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Integrated inventory Item Selector */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60 space-y-3">
                <span className="font-extrabold text-[10px] text-emerald-800 block uppercase tracking-wider">
                  {isObatCategory ? '💊 Integrasi Depo Obat' : '📦 Integrasi Barang Non-Obat'}
                </span>
                
                <div>
                  <label className="block text-slate-550 font-bold mb-1">Nama Barang Depo *</label>
                  <select
                    value={selectedMedId}
                    onChange={(e) => handleMedicineSelectionChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white border-slate-250 focus:outline-emerald-600 font-bold text-slate-750"
                    required
                  >
                    <option value="" disabled>-- Pilih Barang Depo --</option>
                    {filteredCategoryMeds.map((m) => (
                      <option key={m.id} value={m.id}>
                        [{m.code}] {m.name} (Sisa: {m.stock} {m.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-550 font-bold mb-1">Jumlah Beli (Qty) *</label>
                    <input
                      type="number"
                      min="1"
                      value={purchaseQty}
                      onChange={(e) => setPurchaseQty(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl bg-white border-slate-250 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-550 font-bold mb-1">Harga Beli per Satuan (Rp) *</label>
                    <input
                      type="number"
                      min="100"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl bg-white border-slate-250 font-mono font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Uraian Detail Barang (Manual/Auto) *</label>
                <textarea
                  placeholder="Klik barang untuk menginisiasi uraian..."
                  value={itemsDescription}
                  onChange={(e) => setItemsDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl h-14 resize-none focus:outline-emerald-600 font-semibold"
                  required
                />
              </div>

              {/* Status Pembayaran selector during PO registration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Status Pembayaran</label>
                  <select
                    value={paymentStatusInput}
                    onChange={(e) => setPaymentStatusInput(e.target.value as 'Hutang' | 'Bayar Lunas')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-sans text-slate-700"
                  >
                    <option value="Hutang">⭕ Hutang (Belum Bayar)</option>
                    <option value="Bayar Lunas">🟢 Bayar Lunas (Lunas)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Kebijakan Pajak PPn (11%)</label>
                  <select
                    value={taxType}
                    onChange={(e) => setTaxType(e.target.value as 'PPn' | 'Non PPn' | 'Include' | 'Exclude')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-sans text-slate-700"
                  >
                    <option value="Non PPn">Non PPn</option>
                    <option value="Include">Include (Termasuk PPn)</option>
                    <option value="Exclude">Exclude (Belum PPn)</option>
                  </select>
                </div>
              </div>

              {/* Taxation live breakdown indicator */}
              <div className="p-3 bg-slate-900 text-slate-300 rounded-xl font-mono text-[11px] leading-relaxed space-y-1 border border-slate-800">
                <div className="flex justify-between">
                  <span>Harga Pokok/DPP:</span>
                  <span className="text-white">Rp {base.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak (PPN 11%):</span>
                  <span className="text-amber-400">Rp {tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-800 pt-1 text-xs">
                  <span>Pagu Transaksi:</span>
                  <span className="text-emerald-400">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPurchase(null);
                  }}
                  className="px-4 py-2 bg-slate-150 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors border-none cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors border-none cursor-pointer"
                >
                  {editingPurchase ? 'Simpan Perubahan' : 'Simpan Pembelian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details PO & RECEIVE Action Modal popup */}
      {selectedViewPurchase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 space-y-5">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-black px-2 py-0.5 rounded-md font-mono">Invoice Rincian</span>
                <h3 className="font-bold text-slate-850 text-base font-mono mt-1 text-emerald-800">{selectedViewPurchase.invoiceNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedViewPurchase(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Core PO info details list */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Supplier Rekanan</span>
                <span className="font-bold text-slate-800 block mt-0.5 text-sm">{selectedViewPurchase.supplierName}</span>
                <span className="text-slate-400 font-mono text-[10px] block">ID: {selectedViewPurchase.supplierId}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Tanggal PO</span>
                <span className="font-bold text-slate-800 block mt-0.5 text-sm">{selectedViewPurchase.date}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Kategori Belanja & Uraian</span>
                <span className="font-bold text-slate-705 block mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-sans">
                  <span className="font-mono bg-slate-200/50 px-1.5 py-0.5 rounded mr-1.5 text-[9px] text-slate-600 tracking-wide font-black uppercase">
                    {selectedViewPurchase.category}
                  </span>
                  {selectedViewPurchase.itemsDescription}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Status Pembayaran</span>
                <div className="mt-1">
                  {selectedViewPurchase.paymentStatus === 'Bayar Lunas' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-250">
                      🟢 Terbayar Lunas (Saldo Berkurang)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        handleTogglePaymentStatus(selectedViewPurchase);
                        // Refresh info inside modal
                        const refreshed = purchases.find(p => p.id === selectedViewPurchase.id);
                        if (refreshed) setSelectedViewPurchase(refreshed);
                      }}
                      className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-250 hover:bg-rose-100 cursor-pointer"
                    >
                      🛑 Hutang (Klik Untuk Bayar Lunas)
                    </button>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[9px]">Nilai Faktur Pembelian</span>
                <span className="font-mono font-black text-rose-700 block mt-0.5 text-base">
                  Rp {selectedViewPurchase.totalAmount.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">PPn ({selectedViewPurchase.taxType}): Rp {selectedViewPurchase.taxAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* RECEIVE STATUS PROGRESS BOX */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Truck className="h-4 w-4 text-indigo-650 text-indigo-600" />
                  <span>Logistik / Progress Penerimaan</span>
                </span>
                <span className="font-mono font-bold text-slate-600">
                  {selectedViewPurchase.receivedQty || 0} / {selectedViewPurchase.qty || 0} Unit Diterima
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(((selectedViewPurchase.receivedQty || 0) / (selectedViewPurchase.qty || 1)) * 100)
                    )}%`
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Receive Status:</span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  selectedViewPurchase.receiveStatus === 'Closed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : selectedViewPurchase.receiveStatus === 'Partial'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {selectedViewPurchase.receiveStatus || 'Pending'}
                </span>
              </div>
            </div>

            {/* RECEIVE SUBMIT FORM (Render only if status is not closed) */}
            {selectedViewPurchase.receiveStatus !== 'Closed' ? (
              <form onSubmit={handleReceiveSubmit} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 space-y-3.5 text-xs">
                <h4 className="font-extrabold text-[11px] text-indigo-850 uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-indigo-600" />
                  <span>Register Penerimaan Barang Baru</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Jumlah diterima saat ini:</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty yg datang"
                      value={qtyToReceiveInput}
                      onChange={(e) => setQtyToReceiveInput(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border rounded-xl bg-white focus:outline-indigo-650 font-mono font-bold text-slate-700"
                      required
                    />
                    <span className="text-[10px] text-slate-450 block mt-1">
                      Sisa PO yang ditunggu: {(selectedViewPurchase.qty || 0) - (selectedViewPurchase.receivedQty || 0)} unit
                    </span>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Memo penerimaan:</label>
                    <textarea
                      placeholder="e.g. Batch #41, Expire clear, etc."
                      value={receiveNotes}
                      onChange={(e) => setReceiveNotes(e.target.value)}
                      className="w-full px-3 py-1 bg-white border border-slate-250 rounded-xl h-12 resize-none text-[11px] leading-snug"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors border-none cursor-pointer outline-none shadow-sm"
                >
                  <Truck className="h-4 w-4" />
                  <span>Posting Penerimaan (Tambah Ke Stok Depo)</span>
                </button>
              </form>
            ) : (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-center flex flex-col items-center justify-center space-y-1 py-6">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                <span className="font-bold text-sm block">CLOSED - STOK PENUH</span>
                <span className="text-xs text-emerald-600 font-medium">Seluruh pesanan obat & barang dalam PO ini telah terekam aman di inventaris depo.</span>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedViewPurchase(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all border-none cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

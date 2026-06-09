import React, { useState } from 'react';
import { Patient, Transaction, Doctor, Queue } from '../types';
import { FileDown, Calendar, Search, CreditCard, ChevronRight, TrendingUp, TrendingDown, ClipboardCheck, ArrowUpRight, Plus, RefreshCw } from 'lucide-react';

interface FinancialReportsProps {
  patients: Patient[];
  transactions: Transaction[];
  doctors: Doctor[];
  queues: Queue[];
  currentRole: string;
  onAddTransaction: (trx: Omit<Transaction, 'id' | 'invoiceNumber'>) => void;
  onLogActivity: (action: string, details: string) => void;
}

export default function FinancialReports({
  patients,
  transactions,
  doctors,
  queues,
  currentRole,
  onAddTransaction,
  onLogActivity,
}: FinancialReportsProps) {
  const [activeReportTab, setActiveReportTab] = useState<'pasien' | 'finance' | 'labarugi' | 'dokter' | 'antrean'>('labarugi');
  
  // Transaction creation form state
  const [showTrxForm, setShowTrxForm] = useState(false);
  const [trxType, setTrxType] = useState<'Uang Masuk' | 'Uang Keluar'>('Uang Masuk');
  const [trxCategory, setTrxCategory] = useState('Pendaftaran & Konsultasi');
  const [trxAmount, setTrxAmount] = useState(100000);
  const [trxDescription, setTrxDescription] = useState('');
  const [trxPayerPayee, setTrxPayerPayee] = useState('');

  // Total counts for financial reports
  const incomeTrans = transactions.filter(t => t.type === 'Uang Masuk');
  const expenseTrans = transactions.filter(t => t.type === 'Uang Keluar');
  
  const totalIncome = incomeTrans.reduce((sum, current) => sum + current.amount, 0);
  const totalExpense = expenseTrans.reduce((sum, current) => sum + current.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const handleCreateTrx = (e: React.FormEvent) => {
    e.preventDefault();
    if (trxAmount <= 0 || !trxDescription || !trxPayerPayee) {
      alert('Mohon isi formulir transaksi secara valid.');
      return;
    }

    onAddTransaction({
      type: trxType,
      category: trxCategory,
      amount: Number(trxAmount),
      date: new Date().toISOString().split('T')[0],
      description: trxDescription,
      payerOrPayee: trxPayerPayee,
    });

    onLogActivity('Pencatatan Keuangan', `Mencatat transaksi ${trxType} senilai ${trxAmount.toLocaleString('id-ID')} - ${trxDescription}`);
    
    // Clear Form
    setShowTrxForm(false);
    setTrxDescription('');
    setTrxPayerPayee('');
  };

  const isAllowedToManageFinance = ['Admin', 'Kasir'].includes(currentRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="font-bold text-slate-800 text-lg">Pusat Laporan Terpadu (Reporting)</h1>
          <p className="text-xs text-slate-500">Melihat metrik pasien, audit log keuangan, status jadwal dokter, dan KPI performa antrean</p>
        </div>

        {/* Dynamic export simulations */}
        <button
          onClick={() => alert('Fitur Export PDF/Excel laporan sedang diinisiasi. Berkas akan terunduh otomatis.')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
        >
          <FileDown className="h-4 w-4" />
          <span>Export Laporan</span>
        </button>
      </div>

      {/* Sub tabs selectors */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-1">
        <button
          onClick={() => setActiveReportTab('labarugi')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeReportTab === 'labarugi'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="h-4 w-4 text-emerald-650" />
          <span className="font-bold">Laporan Laba / Rugi Bersih</span>
        </button>

        <button
          onClick={() => setActiveReportTab('finance')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeReportTab === 'finance'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Jurnal Arus Kas Manual</span>
        </button>

        <button
          onClick={() => setActiveReportTab('pasien')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeReportTab === 'pasien'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Laporan Demografi Pasien</span>
        </button>

        <button
          onClick={() => setActiveReportTab('dokter')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeReportTab === 'dokter'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Laporan Jadwal Dokter</span>
        </button>

        <button
          onClick={() => setActiveReportTab('antrean')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeReportTab === 'antrean'
              ? 'border-b-2 border-emerald-600 text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardCheck className="h-4 w-4" />
          <span>Laporan Antrean Harian</span>
        </button>
      </div>

      {/* Reports tab contents */}
      {activeReportTab === 'labarugi' ? (
        /* Laporan Laba / Rugi Bersih content view */
        <div id="laporan-laba-rugi-bersih" className="space-y-6">
          {/* Quick Recap of profit and loss */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-250 p-5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">Total Pendapatan (Kas Masuk)</span>
                <span className="text-xl font-black text-emerald-800 tracking-tight block mt-1 font-mono">
                  Rp {totalIncome.toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Semua klaim pasien, pelayanan obat & apotek</span>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500 opacity-60" />
            </div>

            <div className="bg-amber-50 border border-amber-250 p-5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-amber-700 font-bold block uppercase tracking-wider font-mono">Total Beban (Kas Keluar)</span>
                <span className="text-xl font-black text-amber-800 tracking-tight block mt-1 font-mono">
                  Rp {totalExpense.toLocaleString('id-ID')}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5 font-sans">Belanja obat, operasional & beban gaji</span>
              </div>
              <TrendingDown className="h-8 w-8 text-amber-500 opacity-60" />
            </div>

            <div className={`p-5 rounded-2xl flex items-center justify-between shadow-xs border ${
              netProfit >= 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-rose-50 border-rose-200'
            }`}>
              <div>
                <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                  netProfit >= 0 ? 'text-indigo-700' : 'text-rose-700'
                }`}>
                  Laba / Rugi Bersih (Net Profit)
                </span>
                <span className={`text-xl font-black tracking-tight block mt-1 font-mono ${
                  netProfit >= 0 ? 'text-indigo-800' : 'text-rose-800'
                }`}>
                  Rp {netProfit.toLocaleString('id-ID')}
                </span>
                <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[9px] font-black uppercase tracking-wide ${
                  netProfit >= 0 ? 'bg-emerald-105 bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800'
                }`}>
                  {netProfit >= 0 ? '🟢 Surplus Laba Bersih' : '🔴 Defisit Rugi Bersih'}
                </span>
              </div>
              <span className="text-2xl font-black">{netProfit >= 0 ? '📈' : '📉'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profit & Loss statement breakdown sheet */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-150 pb-3 flex justify-between items-center text-xs">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Laporan Perhitungan Laba / Rugi (P&L Chart)</h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">Audit ringkas faskes klinik sesuai transaksi riil terekam</p>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-md">PSAK Akuntansi</span>
                </div>

                {/* Income structure breakdown */}
                <div className="space-y-2.5 text-xs mt-4">
                  <div className="bg-slate-50 p-2.5 rounded-lg flex justify-between font-bold text-emerald-800 border-l-4 border-emerald-500 uppercase tracking-wide">
                    <span>1. PENDAPATAN OPERASIONAL SEKTOR UTAMA</span>
                    <span className="font-mono">Rp {totalIncome.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="pl-4 space-y-2 font-semibold">
                    <div className="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
                      <span className="text-slate-600">↳ Pendaftaran Poli & Konsultasi Umum</span>
                      <span className="font-mono font-bold text-slate-750">
                        Rp {incomeTrans.filter(t => t.category === 'Pendaftaran & Konsultasi').reduce((s, x) => s + x.amount, 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
                      <span className="text-slate-600">↳ Pelayanan Depo Resep & Apotek</span>
                      <span className="font-mono font-bold text-slate-750">
                        Rp {incomeTrans.filter(t => t.category === 'Pelayanan Obat & Apotek').reduce((s, x) => s + x.amount, 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
                      <span className="text-slate-600">↳ Klaim Jaminan BPJS Kesehatan</span>
                      <span className="font-mono font-bold text-slate-750">
                        Rp {incomeTrans.filter(t => t.category === 'Klaim BPJS Kesehatan').reduce((s, x) => s + x.amount, 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Expense structure breakdown */}
                  <div className="bg-slate-50 p-2.5 rounded-lg flex justify-between font-bold text-rose-800 border-l-4 border-rose-500 uppercase tracking-wide mt-5">
                    <span>2. BEBAN & PENGELUARAN OPERASIONAL</span>
                    <span className="font-mono">Rp {totalExpense.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="pl-4 space-y-2 font-semibold">
                    <div className="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
                      <span className="text-slate-600">↳ Belanja Sediaan Obat & BMHP (PO Supplier Pelunasan)</span>
                      <span className="font-mono font-bold text-slate-750">
                        Rp {expenseTrans.filter(t => t.category === 'Pembelian Obat & BMHP').reduce((s, x) => s + x.amount, 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
                      <span className="text-slate-600">↳ Utilitas & Sarana Operasional Kantor</span>
                      <span className="font-mono font-bold text-slate-750">
                        Rp {expenseTrans.filter(t => t.category === 'Biaya Operasional').reduce((s, x) => s + x.amount, 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-100 pb-1.5">
                      <span className="text-slate-600">↳ Beban Gaji Karyawan, Dokter & Staff Medis</span>
                      <span className="font-mono font-bold text-slate-750">
                        Rp {expenseTrans.filter(t => t.category === 'Gaji Karyawan & Staff').reduce((s, x) => s + x.amount, 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Statement Sheet Bottom */}
              <div className={`p-4 rounded-xl flex justify-between items-center text-xs font-black border uppercase mt-4 ${
                netProfit >= 0 ? 'bg-gradient-to-r from-emerald-50 to-indigo-50 border-emerald-250 text-indigo-900' : 'bg-rose-50 border-rose-150 text-rose-900'
              }`}>
                <span>LABA BERSIH OPERASIONAL (OPERATING INCOME) :</span>
                <span className="font-mono text-sm">
                  Rp {netProfit.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* QUICK TRANSACTION COMPONENT JURNAL FORM */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-250 rounded-2xl p-5 text-xs">
                <h3 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-1">
                  <Plus className="h-4 w-4 text-emerald-600" />
                  <span>Jurnal Buku Kas Baru</span>
                </h3>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">Pencatatan mutasi kas langsung untuk memengaruhi laporan laba/rugi faskes secara real-time.</p>

                <form onSubmit={handleCreateTrx} className="space-y-3 font-semibold">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Tipe Aliran Kas *</label>
                    <select
                      value={trxType}
                      onChange={e => {
                        setTrxType(e.target.value as any);
                        setTrxCategory(e.target.value === 'Uang Masuk' ? 'Pendaftaran & Konsultasi' : 'Biaya Operasional');
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 text-slate-750"
                    >
                      <option value="Uang Masuk">📥 Kas Masuk (Penerimaan)</option>
                      <option value="Uang Keluar">📤 Kas Keluar (Pengeluaran)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Kategori Rekening *</label>
                    <select
                      value={trxCategory}
                      onChange={e => setTrxCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-750"
                    >
                      {trxType === 'Uang Masuk' ? (
                        <>
                          <option value="Pendaftaran & Konsultasi">Pendaftaran & Konsultasi</option>
                          <option value="Pelayanan Obat & Apotek">Pelayanan Obat & Apotek</option>
                          <option value="Klaim BPJS Kesehatan">Klaim BPJS Kesehatan</option>
                        </>
                      ) : (
                        <>
                          <option value="Pembelian Obat & BMHP">Pembelian Obat & BMHP</option>
                          <option value="Biaya Operasional">Biaya Operasional (Listrik, Wifi, Air)</option>
                          <option value="Gaji Karyawan & Staff">Gaji Karyawan & Staff</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Nominal (Rp) *</label>
                      <input
                        type="number"
                        min="1"
                        value={trxAmount}
                        onChange={e => setTrxAmount(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Pihak Kedua *</label>
                      <input
                        type="text"
                        placeholder="Contoh: PLN, Vendor Farma"
                        value={trxPayerPayee}
                        onChange={e => setTrxPayerPayee(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Keterangan Jurnal *</label>
                    <input
                      type="text"
                      placeholder="e.g. Pembelian bahan medis kassa steril"
                      value={trxDescription}
                      onChange={e => setTrxDescription(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-bold cursor-pointer border-none"
                  >
                    Posting Jurnal Kas Masuk/Keluar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : activeReportTab === 'finance' ? (
        /* Income and Expenses (Uang Masuk dan Keluar) */
        <div id="laporan-uang" className="space-y-6">
          {/* Stats financial state block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50/70 border border-emerald-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">Total Pendapatan (In)</span>
                <span className="text-xl font-black text-emerald-800 tracking-tight block mt-1">
                  Rp {totalIncome.toLocaleString('id-ID')}
                </span>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500 opacity-60 shrink-0" />
            </div>

            <div className="bg-rose-50/70 border border-rose-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-rose-700 font-bold block uppercase tracking-wider">Total Pengeluaran (Out)</span>
                <span className="text-xl font-black text-rose-800 tracking-tight block mt-1">
                  Rp {totalExpense.toLocaleString('id-ID')}
                </span>
              </div>
              <TrendingDown className="h-8 w-8 text-rose-500 opacity-60 shrink-0" />
            </div>

            <div className="bg-sky-50 border border-sky-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-sky-700 font-bold block uppercase tracking-wider">Saldo Netto (Surplus)</span>
                <span className="text-xl font-black text-sky-800 tracking-tight block mt-1">
                  Rp {netProfit.toLocaleString('id-ID')}
                </span>
              </div>
              <span className="text-2xl font-bold">💳</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Transactions lists table (Col 2) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Log Aliran Kas Keuangan Klinik</h3>
                  <p className="text-xs text-slate-500">Mencatat kwitansi konsultasi umum dan pencairan tagihan BPJS</p>
                </div>
                {isAllowedToManageFinance && (
                  <button
                    id="btn-add-transaksi-keuangan"
                    onClick={() => setShowTrxForm(!showTrxForm)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Catat Cash</span>
                  </button>
                )}
              </div>

              {showTrxForm && (
                <form onSubmit={handleCreateTrx} className="bg-slate-50 p-4 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs animate-fade-in mb-4">
                  <div className="md:col-span-2 flex justify-between items-center border-b pb-1.5">
                    <span className="font-bold text-slate-700">Audit Arus Kas Baru</span>
                    <button type="button" onClick={() => setShowTrxForm(false)} className="text-slate-400 hover:text-slate-600 font-bold">Close ✕</button>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tipe Aliran Dana</label>
                    <select
                      value={trxType}
                      onChange={e => {
                        setTrxType(e.target.value as any);
                        setTrxCategory(e.target.value === 'Uang Masuk' ? 'Pendaftaran & Konsultasi' : 'Pembelian Obat & BMHP');
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg"
                    >
                      <option value="Uang Masuk">Uang Masuk (Klaim/Invoice)</option>
                      <option value="Uang Keluar">Uang Keluar (Operasional/Farmasi)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Kategori Rekening</label>
                    <select
                      value={trxCategory}
                      onChange={e => setTrxCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border rounded-lg"
                    >
                      {trxType === 'Uang Masuk' ? (
                        <>
                          <option value="Pendaftaran & Konsultasi">Pendaftaran & Konsultasi</option>
                          <option value="Klaim BPJS Kesehatan">Klaim BPJS Kesehatan</option>
                          <option value="Pelayanan Obat & Apotek">Pelayanan Obat & Apotek</option>
                        </>
                      ) : (
                        <>
                          <option value="Pembelian Obat & BMHP">Pembelian Obat & BMHP</option>
                          <option value="Biaya Operasional">Biaya Operasional (Listrik/Wifi)</option>
                          <option value="Gaji Karyawan & Staff">Gaji Karyawan & Staff</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Jumlah Pemindahbukuan (Rp)</label>
                    <input type="number" value={trxAmount} onChange={e => setTrxAmount(Number(e.target.value))} className="w-full p-2 bg-white rounded border" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Pihak Terkait (Payer/Payee)</label>
                    <input type="text" placeholder="Contoh: Budi Santoso, PLN, PBF" value={trxPayerPayee} onChange={e => setTrxPayerPayee(e.target.value)} className="w-full p-2 bg-white rounded border" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Uraian Transaksi Resmi</label>
                    <input type="text" placeholder="Uraian deskriptif laporan..." value={trxDescription} onChange={e => setTrxDescription(e.target.value)} className="w-full p-2 bg-white rounded border" required />
                  </div>
                  <div className="md:col-span-2 flex justify-end pt-1">
                    <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold">Simpan Transaksi</button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left font-sans text-slate-700 table-auto border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 text-slate-400 uppercase font-bold tracking-wider bg-slate-50/50">
                      <th className="px-3 py-2.5">INVOICE / TANGGAL</th>
                      <th className="px-3 py-2.5">TIPE / REKENING</th>
                      <th className="px-3 py-2.5">URAIAN / PIHAK KETIGA</th>
                      <th className="px-3 py-2.5 text-right">JUMLAH NOMINAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((t) => {
                      const isEntry = t.type === 'Uang Masuk';
                      return (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-3 font-semibold">
                            <span className="font-mono block text-slate-700">{t.invoiceNumber}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{t.date}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isEntry ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {t.type}
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-0.5">{t.category}</span>
                          </td>
                          <td className="px-3 py-3 text-slate-600">
                            <span className="font-semibold block text-slate-800">{t.payerOrPayee}</span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[190px]">{t.description}</span>
                          </td>
                          <td className={`px-3 py-3 font-mono font-bold text-right text-sm ${
                            isEntry ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {isEntry ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Simulated breakdown side categories (Col 1) */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800">
                <h3 className="font-bold text-xs uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Pos Pengeluaran Terbesar</h3>
                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300">
                      <span>Restocking Depo Obat</span>
                      <span>47%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full mt-1"><div className="h-1.5 bg-emerald-500 rounded-full w-[47%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300">
                      <span>Operasional (Listrik & Wifi)</span>
                      <span>31%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full mt-1"><div className="h-1.5 bg-sky-500 rounded-full w-[31%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold text-slate-300">
                      <span>BMHP & Alat Medis</span>
                      <span>22%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full mt-1"><div className="h-1.5 bg-purple-500 rounded-full w-[22%]"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeReportTab === 'pasien' ? (
        /* Patient Data Report */
        <div id="laporan-pasien" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Laporan Distribusi Kunjungan Pasien</h3>
            <p className="text-xs text-slate-500">Melihat demografi pendaftaran pasien aktif di database</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border rounded-xl flex justify-between items-center">
              <div>
                <span className="text-slate-400 text-[10px] font-bold block uppercase">TOTAL PASIEN UMUM</span>
                <span className="text-lg font-black text-slate-800">{patients.filter(p => p.type === 'Umum').length} Orang</span>
              </div>
              <span className="text-xl">👤</span>
            </div>
            
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-emerald-850 text-[10px] font-bold block uppercase">TOTAL PASIEN BPJS</span>
                <span className="text-lg font-black text-emerald-800">{patients.filter(p => p.type === 'BPJS').length} Orang</span>
              </div>
              <span className="text-xl">🟢</span>
            </div>

            <div className="p-4 bg-slate-50 border rounded-xl flex justify-between items-center">
              <div>
                <span className="text-slate-400 text-[10px] font-bold block uppercase font-mono">NIK Tervalidasi</span>
                <span className="text-lg font-black text-slate-800">{patients.length} NIK</span>
              </div>
              <span className="text-xl">✓</span>
            </div>
          </div>

          <div className="border border-slate-150 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="bg-slate-50 border-b font-bold text-slate-400 uppercase">
                  <th className="px-4 py-2.5">ID PASIEN</th>
                  <th className="px-4 py-2.5">NAMA PASIEN</th>
                  <th className="px-4 py-2.5">NIK</th>
                  <th className="px-4 py-2.5">KONTAK</th>
                  <th className="px-4 py-2.5">TIPE KASUS</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">{p.id}</td>
                    <td className="px-4 py-3 font-semibold">{p.name} ({p.gender === 'Laki-laki' ? 'L' : 'P'})</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{p.nik}</td>
                    <td className="px-4 py-3 font-mono">{p.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.type === 'BPJS' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {p.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeReportTab === 'dokter' ? (
        /* Doctor Schedules Report */
        <div id="laporan-dokter" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Laporan Jadwal Kerja Poliklinik Dokter</h3>
            <p className="text-xs text-slate-500">Rekapitulasi ruang operasional dan kuota piket dokter</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {doctors.map((d) => (
              <div key={d.id} className="p-4 bg-slate-50/60 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 text-xs block truncate">{d.name}</span>
                <span className="text-[10px] text-slate-400 block">{d.specialist}</span>
                <span className="text-[10px] text-slate-500 block font-semibold mt-2">Ruang: {d.room}</span>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mt-2.5 ${
                  d.onDuty ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                }`}>
                  {d.onDuty ? 'On Duty' : 'Cuti'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Daily Patient Queues KPI metrics summary */
        <div id="laporan-antrean" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Metrik Kecepatan Pelayanan Antrean</h3>
            <p className="text-xs text-slate-500">Mengkalkulasi kecepatan respons pemeriksaan dokter faskes tingkat satu</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl">
              <span className="text-[10px] text-sky-800 font-bold block uppercase">Rata-rata Menunggu</span>
              <span className="text-xl font-black text-sky-900 block mt-1">14.2 Menit</span>
              <p className="text-[10px] text-slate-400 mt-1">Target SPM: &lt; 30 Menit</p>
            </div>
            <div className="p-4 bg-emerald-50/70 border border-emerald-150 rounded-xl">
              <span className="text-[10px] text-emerald-800 font-bold block uppercase">Pasien Selesai</span>
              <span className="text-xl font-black text-emerald-900 block mt-1">68 Pasien</span>
              <p className="text-[10px] text-slate-400 mt-1">Status resep diterbitkan</p>
            </div>
            <div className="p-4 bg-amber-50/70 border border-amber-150 rounded-xl">
              <span className="text-[10px] text-amber-800 font-bold block uppercase">Pasien Antre</span>
              <span className="text-xl font-black text-amber-900 block mt-1">{queues.filter(q => q.status === 'Menunggu').length} Pasien</span>
              <p className="text-[10px] text-slate-400 mt-1">Berada di ruang tunggu lobby</p>
            </div>
            <div className="p-4 bg-rose-50/70 border border-rose-150 rounded-xl">
              <span className="text-[10px] text-rose-850 font-bold block uppercase font-mono">Dibatalkan/Batal</span>
              <span className="text-xl font-black text-rose-900 block mt-1">{queues.filter(q => q.status === 'Batal').length} Kasus</span>
              <p className="text-[10px] text-slate-400 mt-1">Pasien tidak hadir di panggilan</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

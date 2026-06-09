import React from 'react';
import { Patient, Queue, Medicine, Transaction, ActivityLog, Doctor } from '../types';
import { Users, ClipboardList, PackageOpen, TrendingUp, TrendingDown, Clock, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Activity } from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  queues: Queue[];
  medicines: Medicine[];
  transactions: Transaction[];
  activityLogs: ActivityLog[];
  doctors: Doctor[];
  currentRole: string;
  onNavigateToView: (view: string) => void;
}

export default function Dashboard({
  patients,
  queues,
  medicines,
  transactions,
  activityLogs,
  doctors,
  currentRole,
  onNavigateToView,
}: DashboardProps) {
  
  // Business logic calculations
  const totalPatients = patients.length;
  const currentActiveQueues = queues.filter(q => q.status === 'Menunggu' || q.status === 'Diperiksa').length;
  
  // Medicine alert list (drugs with stock <= minStock)
  const lowStockDrugs = medicines.filter(m => m.stock <= m.minStock);
  
  // Finance counts
  const totalIncome = transactions
    .filter(t => t.type === 'Uang Masuk')
    .reduce((sum, current) => sum + current.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'Uang Keluar')
    .reduce((sum, current) => sum + current.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Active Doctors
  const activeDoctorsCount = doctors.filter(d => d.onDuty).length;

  // Format currency
  const numToRupiah = (num: number) => {
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      {/* Visual Welcome Banner */}
      <div id="greeting-banner" className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 rounded-3xl p-6 text-white overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none flex items-center justify-end pr-8">
          <Activity className="h-40 w-40 text-white" />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10">
            Sistem Informasi Klinik Utama
          </span>
          <h1 className="text-xl md:text-2xl font-bold mt-2.5">Selamat Datang Kembali di Aplikasi Portal Klinik Medika!</h1>
          <p className="text-xs text-white/80 mt-1 leading-relaxed">
            Anda login sebagai <strong className="text-white underline">{currentRole}</strong>. Monitor rekam medis, antrean kasir, rujukan medis, serta stok depo farmasi Anda secara terpadu hari ini.
          </p>
        </div>
      </div>

      {/* Primary Analytics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Pasien Terdaftar</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight block mt-1">{totalPatients}</span>
            <button 
              onClick={() => onNavigateToView('pasien')}
              className="text-emerald-600 hover:text-emerald-800 text-[10px] font-bold mt-1 inline-flex items-center space-x-1"
            >
              <span>Ketuk Direktori</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 2: Active Queues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Antrean Aktif</span>
            <span className="text-2xl font-black text-sky-600 tracking-tight block mt-1">{currentActiveQueues}</span>
            <button 
              onClick={() => onNavigateToView('antrean')}
              className="text-sky-600 hover:text-sky-800 text-[10px] font-bold mt-1 inline-flex items-center space-x-1"
            >
              <span>Layar Antrean</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="h-10 w-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Stat 3: Depo Farmasi Stock warning */}
        <div className={`p-5 rounded-2xl border shadow-xs flex items-center justify-between ${
          lowStockDrugs.length > 0 ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-white border-slate-100 text-slate-800'
        }`}>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Peringatan Obat Kritis</span>
            <span className={`text-2xl font-black tracking-tight block mt-1 ${lowStockDrugs.length > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              {lowStockDrugs.length} Item
            </span>
            <button 
              onClick={() => onNavigateToView('obat')}
              className="text-slate-500 hover:text-slate-800 text-[10px] font-bold mt-1 inline-flex items-center space-x-1"
            >
              <span>Inventaris Depo</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="h-10 w-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
            {lowStockDrugs.length > 0 ? (
              <AlertTriangle className="h-5 w-5 text-amber-600 animate-pulse" />
            ) : (
              <PackageOpen className="h-5 w-5" />
            )}
          </div>
        </div>

        {/* Stat 4: Financial Net Cashflow Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Saldo Netto Keuangan</span>
            <span className="text-base font-black text-emerald-700 tracking-tight block mt-1.5">{numToRupiah(netBalance)}</span>
            <button 
              onClick={() => onNavigateToView('laporan')}
              className="text-emerald-700 hover:text-emerald-950 text-[10px] font-bold mt-0.5 inline-flex items-center space-x-1"
            >
              <span>Laporan Lengkap</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Secondary segment: Row contain Stock Danger notifications and Doctors list on duty */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Farmasi Critically Stock Block */}
        <div className="lg:col-span-2 space-y-6">
          {lowStockDrugs.length > 0 && (
            <div id="low-stock-alert-panel" className="bg-rose-50 border border-rose-150 rounded-2xl p-5 flex items-start space-x-3.5">
              <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <h3 className="font-bold text-rose-950 text-xs uppercase tracking-wide">PERINGATAN! STOK DEPO OBAT LOKAL MENIPIS</h3>
                <p className="text-xs text-rose-800 leading-normal mt-1">
                  Obat berikut berada di bawah ambang batas aman minimal stok. Segera hubungi PBF (Pedagang Besar Farmasi) rekanan untuk melakukan restocking sesegera mungkin agar pelayanan dokter dan klaim resep BPJS pasien tidak terhambat.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 cursor-pointer" onClick={() => onNavigateToView('obat')}>
                  {lowStockDrugs.slice(0, 4).map((drug) => (
                    <div key={drug.id} className="p-2.5 bg-white rounded-xl border border-rose-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{drug.name}</span>
                      <span className="font-mono bg-rose-150 text-rose-900 px-2 py-0.5 rounded font-bold text-[10px]">
                        Sisa: {drug.stock} {drug.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Simple Visual Representation of Weekly Visit Count Metrics (using pure responsive HTML style with no complex d3 bloat) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Statistik Pasien & Kunjungan Mingguan</h3>
                <p className="text-xs text-slate-500">Estimasi rasio pasien umum vs pasien rujukan BPJS Kesehatan</p>
              </div>
              <div className="flex items-center space-x-3.5 text-[10px] font-bold">
                <span className="flex items-center space-x-1.5"><code className="h-2.5 w-2.5 bg-sky-500 rounded-full inline-block"></code> <span className="text-slate-500">UMUM</span></span>
                <span className="flex items-center space-x-1.5"><code className="h-2.5 w-2.5 bg-emerald-600 rounded-full inline-block"></code> <span className="text-slate-500">BPJS</span></span>
              </div>
            </div>

            {/* Simulated bar chart block */}
            <div className="space-y-4 pt-2">
              {[
                { day: 'Senin', umum: 12, bpjs: 25 },
                { day: 'Selasa', umum: 15, bpjs: 28 },
                { day: 'Rabu', umum: 18, bpjs: 32 },
                { day: 'Kamis', umum: 14, bpjs: 26 },
                { day: 'Jumat', umum: 22, bpjs: 40 },
                { day: 'Sabtu', umum: 10, bpjs: 12 }
              ].map((item, idx) => {
                const total = item.umum + item.bpjs;
                const max = 65; // Scale mapping
                const ratioUmum = (item.umum / max) * 100;
                const ratioBpjs = (item.bpjs / max) * 100;

                return (
                  <div key={idx} className="flex items-center space-x-4 text-xs">
                    <span className="w-12 font-medium text-slate-500">{item.day}</span>
                    <div className="grow h-6 bg-slate-100 rounded-md overflow-hidden flex">
                      <div style={{ width: `${ratioUmum}%` }} className="bg-sky-500 hover:opacity-90 transition-opacity" title={`Pasien Umum: ${item.umum}`}></div>
                      <div style={{ width: `${ratioBpjs}%` }} className="bg-emerald-600 hover:opacity-90 transition-opacity" title={`Pasien BPJS: ${item.bpjs}`}></div>
                    </div>
                    <span className="w-16 font-mono font-bold text-right text-slate-700">{total} Vis</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side Column: Active Doctors on duty & Recent chronological log excerpt */}
        <div className="space-y-6">
          
          {/* Active Doctor List */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Dokter Praktik Hari Ini</h3>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                {activeDoctorsCount} Aktif
              </span>
            </div>

            <div className="space-y-3.5">
              {doctors.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all leading-normal">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xl">🩺</span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{doc.name}</h4>
                      <p className="text-[10px] text-slate-500">{doc.specialist}</p>
                    </div>
                  </div>
                  
                  <span className={`h-2.5 w-2.5 rounded-full inline-block ${
                    doc.onDuty ? 'bg-emerald-500 border border-emerald-100 animate-pulse' : 'bg-slate-300'
                  }`} title={doc.onDuty ? 'Sedang Praktik (On Duty)' : 'Tidak Praktik / Cuti'} />
                </div>
              ))}
            </div>
          </div>

          {/* Simple Recent Chronological log excerpt */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Kelola Log Aktivitas</h3>
              <button 
                onClick={() => onNavigateToView('log')}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-3">
              {activityLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="text-[11px] leading-relaxed border-l-2 border-slate-200 pl-3">
                  <p className="text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </p>
                  <p className="font-semibold text-slate-700">{log.userName} ({log.userRole})</p>
                  <p className="text-slate-500">{log.details.slice(0, 60)}...</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

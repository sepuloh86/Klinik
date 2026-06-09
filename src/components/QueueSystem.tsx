import React, { useState } from 'react';
import { Queue, Patient, Doctor, MedicalRecord, Medicine, Transaction, RolePermission } from '../types';
import { Plus, Check, Play, UserX, Volume2, Monitor, RefreshCw, Layout, ArrowRight, Home, CreditCard, Receipt, Database, CheckCircle2, Printer } from 'lucide-react';

interface QueueSystemProps {
  queues: Queue[];
  patients: Patient[];
  doctors: Doctor[];
  medicalRecords: MedicalRecord[];
  medicines: Medicine[];
  permissions: RolePermission[];
  currentRole: string;
  onAddQueue: (patientId: string, doctorId: string) => void;
  onUpdateQueueStatus: (id: string, status: Queue['status']) => void;
  onAddTransaction: (trxPayload: Omit<Transaction, 'id' | 'invoiceNumber'>) => void;
  onLogActivity: (action: string, details: string) => void;
}

export default function QueueSystem({
  queues,
  patients,
  doctors,
  medicalRecords,
  medicines,
  permissions,
  currentRole,
  onAddQueue,
  onUpdateQueueStatus,
  onAddTransaction,
  onLogActivity,
}: QueueSystemProps) {
  const [activeTab, setActiveTab] = useState<'admin' | 'display'>('admin');
  const [queueSubTab, setQueueSubTab] = useState<'pendaftaran' | 'dokter' | 'kasir' | 'obat'>('pendaftaran');

  // Dynamic queue counters/categories for Loket Pendaftaran, Kasir, and Farmasi
  const [pendaftaranCounters, setPendaftaranCounters] = useState<string[]>(() => {
    const saved = localStorage.getItem('pendaftaranCounters');
    return saved ? JSON.parse(saved) : ['Loket Pendaftaran 1', 'Loket Pendaftaran 2'];
  });

  const [kasirCounters, setKasirCounters] = useState<string[]>(() => {
    const saved = localStorage.getItem('kasirCounters');
    return saved ? JSON.parse(saved) : ['Kasir Utama', 'Kasir BPJS'];
  });

  const [farmasiCounters, setFarmasiCounters] = useState<string[]>(() => {
    const saved = localStorage.getItem('farmasiCounters');
    return saved ? JSON.parse(saved) : ['Apotek / Farmasi 1', 'Apotek / Farmasi 2'];
  });

  // Track called queue number and patient at each counter
  const [activeCounterCalls, setActiveCounterCalls] = useState<Record<string, { queueNo: string; patientName: string; time: string }>>(() => {
    const saved = localStorage.getItem('activeCounterCalls');
    return saved ? JSON.parse(saved) : {};
  });

  // Selected calling counter per row inside each tab
  const [selectedCallCounter, setSelectedCallCounter] = useState<Record<string, string>>({});

  // Input state for adding counters
  const [newCounterFormName, setNewCounterFormName] = useState('');

  // Save changes helper
  const handleAddCounter = (category: 'pendaftaran' | 'kasir' | 'farmasi') => {
    if (!newCounterFormName.trim()) return;
    const name = newCounterFormName.trim();
    if (category === 'pendaftaran') {
      if (pendaftaranCounters.includes(name)) {
        alert('Nama loket pendaftaran sudah terdaftar!');
        return;
      }
      const updated = [...pendaftaranCounters, name];
      setPendaftaranCounters(updated);
      localStorage.setItem('pendaftaranCounters', JSON.stringify(updated));
      onLogActivity('Tambah Loket', `Menambahkan Loket Pendaftaran baru: ${name}`);
    } else if (category === 'kasir') {
      if (kasirCounters.includes(name)) {
        alert('Nama kasir sudah terdaftar!');
        return;
      }
      const updated = [...kasirCounters, name];
      setKasirCounters(updated);
      localStorage.setItem('kasirCounters', JSON.stringify(updated));
      onLogActivity('Tambah Kasir', `Menambahkan loket Kasir baru: ${name}`);
    } else if (category === 'farmasi') {
      if (farmasiCounters.includes(name)) {
        alert('Nama loket farmasi sudah terdaftar!');
        return;
      }
      const updated = [...farmasiCounters, name];
      setFarmasiCounters(updated);
      localStorage.setItem('farmasiCounters', JSON.stringify(updated));
      onLogActivity('Tambah Farmasi', `Menambahkan loket Farmasi baru: ${name}`);
    }
    setNewCounterFormName('');
  };

  const handleCallQueueAtCounter = (q: Queue, counterName: string) => {
    speakQueue(q, counterName);
    const updated = {
      ...activeCounterCalls,
      [counterName]: {
        queueNo: q.queueNumber,
        patientName: q.patientName,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }
    };
    setActiveCounterCalls(updated);
    localStorage.setItem('activeCounterCalls', JSON.stringify(updated));
  };
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [selectedBillingQueue, setSelectedBillingQueue] = useState<Queue | null>(null);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'QRIS/Debit'>('Tunai');
  const [selectedApotekQueue, setSelectedApotekQueue] = useState<Queue | null>(null);
  const [selectedPrintPrescription, setSelectedPrintPrescription] = useState<MedicalRecord | null>(null);
  const [selectedPrintCert, setSelectedPrintCert] = useState<MedicalRecord | null>(null);

  const getBillingDetails = (patientId: string) => {
    // Find medical record of today for this patient
    const record = medicalRecords.find(
      (r) => r.patientId === patientId && r.date === new Date().toISOString().split('T')[0]
    );
    
    const isBpjs = selectedBillingQueue?.patientType === 'BPJS';
    const consultationFee = isBpjs ? 0 : 150000;
    
    let medsCost = 0;
    const itemsList: Array<{ name: string; qty: number; price: number; subtotal: number }> = [];

    if (record && record.prescribedMeds) {
      record.prescribedMeds.forEach((m) => {
        const medObj = medicines.find((x) => x.id === m.id || x.name === m.name);
        // Medical records are free for BPJS
        const itemPrice = isBpjs ? 0 : (medObj?.price || 15000);
        const itemSubtotal = itemPrice * m.qty;
        medsCost += itemSubtotal;
        itemsList.push({
          name: m.name,
          qty: m.qty,
          price: itemPrice,
          subtotal: itemSubtotal,
        });
      });
    }

    const totalBill = consultationFee + medsCost;

    return {
      consultationFee,
      itemsList,
      medsCost,
      totalBill,
      recordId: record?.id || null,
      diagnosis: record?.diagnosis || 'Pemeriksaan Umum',
    };
  };

  const handleConfirmPayment = () => {
    if (!selectedBillingQueue) return;
    const { totalBill, diagnosis } = getBillingDetails(selectedBillingQueue.patientId);

    if (totalBill > 0) {
      onAddTransaction({
        type: 'Uang Masuk',
        category: 'Pelayanan Pasien & Obat',
        amount: totalBill,
        date: new Date().toISOString().split('T')[0],
        description: `Pembayaran Kasir Resep/Medis: ${selectedBillingQueue.patientName} (${diagnosis})`,
        payerOrPayee: selectedBillingQueue.patientName,
      });
    }

    // Advance queue status to 'Menunggu Obat'
    onUpdateQueueStatus(selectedBillingQueue.id, 'Menunggu Obat');
    onLogActivity('Penerimaan Kasir', `Menyelesaikan billing kasir sebesar Rp ${totalBill.toLocaleString('id-ID')} untuk pasien ${selectedBillingQueue.patientName}`);
    
    setSelectedBillingQueue(null);
    setCashAmount(0);
    alert('Pembayaran Berhasil! Antrean telah dikirim ke Depo Obat / Apotek.');
  };

  const handleConfirmDispense = () => {
    if (!selectedApotekQueue) return;
    onUpdateQueueStatus(selectedApotekQueue.id, 'Selesai');
    onLogActivity('Dispensing Obat', `Menyerahkan resep obat apotek kepada pasien ${selectedApotekQueue.patientName}`);
    setSelectedApotekQueue(null);
    alert('Penyerahan Obat Selesai! Antrean pasien telah ditutup status Selesai.');
  };

  // Filter queues of today
  const activeQueues = queues.filter((q) => q.status !== 'Selesai' && q.status !== 'Batal');
  const completedQueues = queues.filter((q) => q.status === 'Selesai' || q.status === 'Batal');

  // Find active room info
  const getDoctorDetails = (doctorId: string) => {
    return doctors.find((d) => d.id === doctorId);
  };

  const handleCreateQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId) return;

    onAddQueue(selectedPatientId, selectedDoctorId);
    
    const p = patients.find((pat) => pat.id === selectedPatientId);
    const d = doctors.find((doc) => doc.id === selectedDoctorId);
    onLogActivity('Registrasi Antrean', `Menambahkan pasien ${p?.name} ke antrean dokter ${d?.name}`);
    
    setSelectedPatientId('');
    setSelectedDoctorId('');
  };

  // Text-To-Speech (Panggilan Antrean Suara)
  const speakQueue = (queue: Queue, locationOverride?: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Panggilan suara tidak didukung di browser ini.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech
    
    const docInfo = getDoctorDetails(queue.doctorId);
    const roomClean = locationOverride || docInfo?.room.split(' - ')[0] || 'ruang pemeriksaan';
    
    // Indonesian language voice prompt - styled to be soft, polite, and gentle
    const textToSpeak = `Mohon perhatian, nomor antrean ${queue.queueNumber.split('').join(' ')}, atas nama ${queue.patientName}, silakan menuju ke ${roomClean}. Terima kasih.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'id-ID';
    
    // Voice configurations for a gentle, soft, and polite female receptionist voice:
    // Rate slightly slower (0.82) makes it sound serene, clear, and highly polite (cewek lembut)
    utterance.rate = 0.82;
    // Moderate pitch (1.18) makes the voice sound naturally feminine and warm
    utterance.pitch = 1.18;

    // Search specifically for an Indonesian female voice (e.g. Gadis, Cantika, Yuna, Damayanti, Sari, Zira)
    const voices = window.speechSynthesis.getVoices();
    let idVoice = voices.find((v) => 
      (v.lang.includes('ID') || v.lang.includes('id')) && 
      (v.name.toLowerCase().includes('female') || 
       v.name.toLowerCase().includes('gadis') || 
       v.name.toLowerCase().includes('cantika') || 
       v.name.toLowerCase().includes('zira') || 
       v.name.toLowerCase().includes('yuna') || 
       v.name.toLowerCase().includes('damayanti') || 
       v.name.toLowerCase().includes('sari') || 
       v.name.toLowerCase().includes('wulan') || 
       v.name.toLowerCase().includes('indri') || 
       v.name.toLowerCase().includes('lisa') || 
       v.name.toLowerCase().includes('dina') || 
       v.name.toLowerCase().includes('online'))
    );
    
    // Fallback search: any Indonesian voice that is not explicitly male
    if (!idVoice) {
      idVoice = voices.find((v) => 
        (v.lang.includes('ID') || v.lang.includes('id')) && 
        !v.name.toLowerCase().includes('male')
      );
    }
    
    // Final fallback to any Indonesian voice
    if (!idVoice) {
      idVoice = voices.find((v) => v.lang.includes('ID') || v.lang.includes('id'));
    }
    
    if (idVoice) {
      utterance.voice = idVoice;
    }

    utterance.onstart = () => setSpeaking(queue.id);
    utterance.onend = () => setSpeaking(null);
    utterance.onerror = () => setSpeaking(null);

    window.speechSynthesis.speak(utterance);
    
    onLogActivity('Panggilan Antrean', `Melakukan panggilan suara untuk antrean ${queue.queueNumber} (${queue.patientName})`);
  };

  const isAllowedToManage = ['Admin', 'Perawat', 'Dokter'].includes(currentRole);
  const userPerm = permissions.find(p => p.role === currentRole);
  const isAllowedPendaftaran = currentRole === 'Admin' || currentRole === 'Perawat' || currentRole === 'Dokter' || !!userPerm?.canManagePendaftaranQueue;
  const isAllowedKasir = currentRole === 'Admin' || currentRole === 'Kasir' || !!userPerm?.canManageKasirQueue;
  const isAllowedObat = currentRole === 'Admin' || currentRole === 'Apoteker' || !!userPerm?.canManageObatQueue;

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-xs gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
            <Layout className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base">Manajemen Antrean Klinik</h1>
            <p className="text-xs text-slate-500">Antrean real-time pelayanan loket, dokter, kasir, dan depo obat</p>
          </div>
        </div>

        <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Loket & Control</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('display')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'display'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="h-3.5 w-3.5 animate-pulse" />
            <span>Monitor TV Lobby</span>
          </button>
        </div>
      </div>

      {activeTab === 'admin' ? (
        <div className="space-y-6">
          {/* SUBMENU ANTREAN SELECTORS */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-xs">
            <button
              type="button"
              onClick={() => setQueueSubTab('pendaftaran')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                queueSubTab === 'pendaftaran'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>1. Antrian Pendaftaran</span>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-lg ${queueSubTab === 'pendaftaran' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {queues.filter(q => q.status === 'Menunggu Pendaftaran').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setQueueSubTab('dokter')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                queueSubTab === 'dokter'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <span>2. Antrian Pemeriksaan Dokter/poli</span>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-lg ${queueSubTab === 'dokter' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {queues.filter(q => q.status === 'Menunggu' || q.status === 'Diperiksa').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setQueueSubTab('kasir')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                queueSubTab === 'kasir'
                  ? 'bg-indigo-650 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>3. Antrian Kasir</span>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-lg ${queueSubTab === 'kasir' ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {queues.filter(q => q.status === 'Menunggu Kasir').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setQueueSubTab('obat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                queueSubTab === 'obat'
                  ? 'bg-emerald-655 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>4. Antrian Farmasi</span>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-lg ${queueSubTab === 'obat' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {queues.filter(q => q.status === 'Menunggu Obat').length}
              </span>
            </button>
          </div>

          {/* TAB CONTENT: 1. PENDAFTARAN */}
          {queueSubTab === 'pendaftaran' && (
            <div id="antrean-tab-pendaftaran" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
              {/* Left Column Feed */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                    <div>
                      <h2 className="font-bold text-slate-800 text-sm">Alur Antrian Pendaftaran Masuk</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Verifikasi dokumen dan panggil pasien yang baru datang untuk divalidasi ke Poliklinik</p>
                    </div>
                    <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-3 py-1 rounded-full border border-sky-200">
                      {queues.filter(q => q.status === 'Menunggu Pendaftaran').length} Menunggu Loket
                    </span>
                  </div>

                  {queues.filter(q => q.status === 'Menunggu Pendaftaran').length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <p className="text-sm font-semibold">Tidak ada pasien di antrian pendaftaran saat ini.</p>
                      <p className="text-xs mt-1">Gunakan formulir disamping untuk mendaftarkan pasien baru, atau cetak nomor antrean dari loket mandiri.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {queues.filter(q => q.status === 'Menunggu Pendaftaran').map((q) => {
                        const targetLek = selectedCallCounter[q.id] || pendaftaranCounters[0] || 'Loket Pendaftaran 1';

                        return (
                          <div key={q.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="h-11 w-11 rounded-lg flex flex-col items-center justify-center font-bold font-mono text-white shadow-xs bg-sky-500">
                                <span className="text-[8px] uppercase tracking-wide opacity-80 leading-none">NO</span>
                                <span className="text-sm mt-0.5 leading-none">{q.queueNumber}</span>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-bold text-slate-800 text-xs">{q.patientName}</h3>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    q.patientType === 'BPJS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-705 border border-slate-200'
                                  }`}>
                                    {q.patientType}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Rencana DPJP: {q.doctorName}</p>
                                <p className="text-[10px] text-slate-450 mt-0.5">Ruang: {q.room}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[10px] text-slate-500">Panggil di:</span>
                                <select
                                  value={targetLek}
                                  onChange={(e) => setSelectedCallCounter({ ...selectedCallCounter, [q.id]: e.target.value })}
                                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] focus:outline-none"
                                >
                                  {pendaftaranCounters.map((ctr) => (
                                    <option key={ctr} value={ctr}>{ctr}</option>
                                  ))}
                                </select>
                              </div>

                              <button
                                type="button"
                                title="Panggil ke Loket"
                                onClick={() => handleCallQueueAtCounter(q, targetLek)}
                                className={`p-2 rounded-lg border text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center space-x-1 ${
                                  speaking === q.id ? 'bg-amber-100 text-amber-700 border-amber-300 animate-pulse shadow-xs' : 'bg-white border-slate-200'
                                }`}
                              >
                                <Volume2 className="h-4 w-4" />
                                <span className="text-[10px] font-bold">Panggil</span>
                              </button>

                              {isAllowedPendaftaran && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateQueueStatus(q.id, 'Menunggu');
                                      onLogActivity('Kirim Ke Dokter', `Mengirim pasien ${q.patientName} (${q.queueNumber}) ke ruang praktek ${q.doctorName}`);
                                      alert(`Sukses mengirim ${q.patientName} ke antrean pemeriksaan dokter.`);
                                    }}
                                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg cursor-pointer transition-colors flex items-center space-x-1"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Kirim ke Dokter/Poli</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Yakin ingin membatalkan antrean ${q.queueNumber}?`)) {
                                        onUpdateQueueStatus(q.id, 'Batal');
                                        onLogActivity('Batal Antrean', `Membatalkan antrean pendaftaran ${q.queueNumber} (${q.patientName})`);
                                      }
                                    }}
                                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 cursor-pointer transition-colors"
                                    title="Batalkan Antrean"
                                  >
                                    <UserX className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Display Operational Grid of Loket */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-xs mb-1">Status Operasional Loket Pendaftaran</h3>
                  <p className="text-[11px] text-slate-450 mb-4">Daftar loket pendaftaran aktif klinik dan antrean yang sedang dilayani</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {pendaftaranCounters.map((ctr) => {
                      const call = activeCounterCalls[ctr];
                      return (
                        <div key={ctr} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between space-y-2.5">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-705 text-xs">{ctr}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${call ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-500'}`}>
                              {call ? 'Memanggil' : 'Standby'}
                            </span>
                          </div>
                          {call ? (
                            <div>
                              <p className="text-lg font-black font-mono text-sky-600 leading-none">{call.queueNo}</p>
                              <p className="text-[11px] text-slate-600 font-medium truncate mt-1">{call.patientName}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Waktu: {call.time}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">Belum melayani antrean</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column Form & Management */}
              <div className="space-y-6">
                {/* Register Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h2 className="font-bold text-slate-800 text-sm mb-1">Registrasi Pasien Masuk</h2>
                  <p className="text-xs text-slate-450 mb-5">Mendaftarkan pasien yang hadir fisik ke loket poliklinik</p>

                  {isAllowedPendaftaran ? (
                    <form onSubmit={handleCreateQueue} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Pilih Pasien Terdaftar</label>
                        <select
                          value={selectedPatientId}
                          onChange={(e) => setSelectedPatientId(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                          required
                        >
                          <option value="">-- Cari Nama Pasien --</option>
                          {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.type} - NIK: {p.nik.slice(0, 6)}...)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Pilih Poliklinik & Dokter</label>
                        <select
                          value={selectedDoctorId}
                          onChange={(e) => setSelectedDoctorId(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                          required
                        >
                          <option value="">-- Pilih Poli Tujuan --</option>
                          {doctors.map((d) => (
                            <option key={d.id} value={d.id} disabled={!d.onDuty}>
                              {d.specialist} - {d.name} {!d.onDuty ? '(Tidak Praktik)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Daftarkan Antrean</span>
                      </button>
                    </form>
                  ) : (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-xs">
                      <p className="font-bold">Akses Terbatas</p>
                      <p className="mt-1">Pendaftaran antrean hanya diotorisasi untuk role Admin, Perawat, atau Dokter.</p>
                    </div>
                  )}
                </div>

                {/* Manage Loket counters */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h2 className="font-bold text-slate-800 text-sm mb-1">Tambah Loket Pendaftaran</h2>
                  <p className="text-xs text-slate-450 mb-4">Tambahkan loket pendaftaran kustom ke dalam sistem antrean</p>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Contoh: Loket Pendaftaran 3, Loket BPJS"
                      value={newCounterFormName}
                      onChange={(e) => setNewCounterFormName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCounter('pendaftaran')}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      (+) Tambah Loket Pendaftaran
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. PEMERIKSAAN DOKTER */}
          {queueSubTab === 'dokter' && (
            <div id="antrean-tab-pendaftaran" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Left Column Feed */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                    <div>
                      <h2 className="font-bold text-slate-800 text-sm">Pelayanan Antrean Pemeriksaan Dokter</h2>
                      <p className="text-[11px] text-slate-505 mt-0.5">Daftar pasien menunggu pemeriksaan atau sedang di dalam ruangan dokter poli</p>
                    </div>
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-200">
                      {queues.filter(q => q.status === 'Menunggu' || q.status === 'Diperiksa').length} Antrean Aktif
                    </span>
                  </div>

                  {queues.filter(q => q.status === 'Menunggu' || q.status === 'Diperiksa').length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <p className="text-sm font-semibold">Tidak ada antrean tunggu pemeriksaan saat ini.</p>
                      <p className="text-xs mt-1">Silakan daftarkan rujukan pasien baru memakai form disamping.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {queues.filter(q => q.status === 'Menunggu' || q.status === 'Diperiksa').map((q) => {
                        const docInfo = getDoctorDetails(q.doctorId);

                        // Find if there is an active examination under the same doctor where a medical record hasn't been saved yet
                        const unfinishedExamForThisDoctor = queues.find(
                          (otherQ) =>
                            otherQ.doctorId === q.doctorId &&
                            otherQ.status === 'Diperiksa' &&
                            !medicalRecords.some(
                              (mr) =>
                                mr.patientId === otherQ.patientId &&
                                mr.doctorId === otherQ.doctorId &&
                                mr.date === new Date().toISOString().split('T')[0]
                            )
                        );

                        const isExamActiveAndUnfinished = q.status === 'Diperiksa' && unfinishedExamForThisDoctor?.id === q.id;
                        const isDoctorBusyWithAnotherPatient = q.status === 'Menunggu' && !!unfinishedExamForThisDoctor;

                        // Check if today's medical record has prescription meds
                        const recordForToday = medicalRecords.find(
                          (mr) =>
                            mr.patientId === q.patientId &&
                            mr.doctorId === q.doctorId &&
                            mr.date === new Date().toISOString().split('T')[0]
                        );
                        const hasPrescription = recordForToday && recordForToday.prescribedMeds && recordForToday.prescribedMeds.length > 0;
                        const hasCertificate = !!(recordForToday && recordForToday.doctorCertificate);

                        return (
                          <div key={q.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center space-x-4">
                              <div className={`h-11 w-11 rounded-lg flex flex-col items-center justify-center font-bold font-mono text-white shadow-xs ${
                                q.status === 'Diperiksa' ? 'bg-sky-500 animate-pulse' : 'bg-slate-400'
                              }`}>
                                <span className="text-[8px] uppercase tracking-wide opacity-80 leading-none">NO</span>
                                <span className="text-sm mt-0.5 leading-none">{q.queueNumber}</span>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-bold text-slate-800 text-xs">{q.patientName}</h3>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    q.patientType === 'BPJS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-705 border border-slate-200'
                                  }`}>
                                    {q.patientType}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{q.doctorName}</p>
                                <p className="text-[10px] text-indigo-655 font-bold mt-0.5">📌 {docInfo?.room || q.room || 'Poli Umum'}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
                              {/* Print prescription button if doctor completed */}
                              {hasPrescription && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPrintPrescription(recordForToday)}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-105 text-rose-700 font-extrabold text-[10px] rounded-lg border border-rose-150 flex items-center space-x-1 cursor-pointer transition-all"
                                  title="Cetak Resep Dokter"
                                >
                                  <Printer className="h-3 w-3 text-rose-500" />
                                  <span>Cetak Resep</span>
                                </button>
                              )}

                              {hasCertificate && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPrintCert(recordForToday)}
                                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-105 text-indigo-700 font-extrabold text-[10px] rounded-lg border border-indigo-150 flex items-center space-x-1 cursor-pointer transition-all"
                                  title="Cetak Surat Keterangan Dokter (Sakit/Sehat)"
                                >
                                  <Printer className="h-3 w-3 text-indigo-500" />
                                  <span>Cetak Surat Ket. ({recordForToday.doctorCertificate?.type})</span>
                                </button>
                              )}

                              {/* Call Speaker Button */}
                              <button
                                type="button"
                                title="Panggil Antre"
                                onClick={() => speakQueue(q)}
                                className={`p-2 rounded-lg border text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer ${
                                  speaking === q.id ? 'bg-amber-100 text-amber-700 border-amber-300 animate-bounce shadow-xs' : 'bg-white border-slate-200'
                                }`}
                              >
                                <Volume2 className="h-4 w-4" />
                              </button>

                              {isAllowedPendaftaran && (
                                <>
                                  {q.status === 'Menunggu' ? (
                                    isDoctorBusyWithAnotherPatient ? (
                                      <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-400 font-medium text-[9px] rounded-lg text-right italic leading-tight select-none">
                                        Dr. {unfinishedExamForThisDoctor?.doctorName.split(',')[0]} sedang memeriksa {unfinishedExamForThisDoctor?.patientName}
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => onUpdateQueueStatus(q.id, 'Diperiksa')}
                                        className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[10px] rounded-lg transition-colors flex items-center space-x-1 border border-sky-100 cursor-pointer"
                                      >
                                        <Play className="h-3 w-3 fill-current" />
                                        <span>Panggil Periksa</span>
                                      </button>
                                    )
                                  ) : (
                                    isExamActiveAndUnfinished ? (
                                      <div className="px-3 py-1.5 bg-amber-50 border border-amber-150 text-amber-700 font-black text-[9px] rounded-lg select-all animate-pulse uppercase flex items-center space-x-1">
                                        <span>🩺</span>
                                        <span>Dokter Sedang Memeriksa Pasien</span>
                                      </div>
                                    ) : (
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <button
                                          type="button"
                                          title="Rujuk ke Kasir Pembayaran"
                                          onClick={() => {
                                            onUpdateQueueStatus(q.id, 'Menunggu Kasir');
                                            onLogActivity('Rujuk Pasien', `Merujuk pasien ${q.patientName} ke Kasir Pembayaran`);
                                            alert(`Antrean ${q.queueNumber} dirujuk ke Kasir Pembayaran.`);
                                          }}
                                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg border border-indigo-150 flex items-center space-x-0.5 cursor-pointer"
                                        >
                                          <CreditCard className="h-3 w-3" />
                                          <span>Ke Kasir</span>
                                        </button>

                                        <button
                                          type="button"
                                          title="Rujuk Langsung ke Apotek"
                                          onClick={() => {
                                            onUpdateQueueStatus(q.id, 'Menunggu Obat');
                                            onLogActivity('Rujuk Pasien', `Merujuk pasien ${q.patientName} langsung ke Apotek/Farmasi`);
                                            alert(`Antrean ${q.queueNumber} dirujuk ke Apotek Farmasi.`);
                                          }}
                                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-705 font-bold text-[10px] rounded-lg border border-emerald-150 flex items-center space-x-0.5 cursor-pointer"
                                        >
                                          <Plus className="h-3 w-3" />
                                          <span>Ke Apotek</span>
                                        </button>
                                        
                                        <button
                                          type="button"
                                          title="Selesaikan Secara Penuh"
                                          onClick={() => {
                                            onUpdateQueueStatus(q.id, 'Selesai');
                                            onLogActivity('Tutup Antrean', `Menutup pemeriksaan pasien ${q.patientName} secara penuh`);
                                            alert(`Antrean ${q.queueNumber} selesai dilayani secara penuh!`);
                                          }}
                                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold text-[10px] rounded-lg border border-slate-205 flex items-center space-x-0.5 cursor-pointer"
                                        >
                                          <Check className="h-3 w-3" />
                                          <span>Selesai</span>
                                        </button>
                                      </div>
                                    )
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Batalkan antrean ${q.patientName}?`)) {
                                        onUpdateQueueStatus(q.id, 'Batal');
                                        onLogActivity('Batalkan Antrean', `Membatalkan kunjungan pasien ${q.patientName} hari ini`);
                                      }
                                    }}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100 cursor-pointer"
                                    title="Batalkan Antrean"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* History Section inline under it */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-xs">
                  <h3 className="font-bold text-slate-800 text-xs mb-4">Selesai Pemeriksaan Hari Ini ({completedQueues.length})</h3>
                  {completedQueues.length === 0 ? (
                    <p className="text-slate-400 italic py-1">Belum ada catatan antrean ditutup hari ini.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {completedQueues.map((q) => (
                        <div key={q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`font-mono text-[10px] font-black px-2 py-0.5 rounded text-white ${q.status === 'Selesai' ? 'bg-slate-400' : 'bg-rose-450'}`}>
                              {q.queueNumber}
                            </span>
                            <div>
                              <p className="font-bold text-slate-700 truncate max-w-[120px]">{q.patientName}</p>
                              <p className="text-[10px] text-slate-450 mt-0.5">{q.doctorName.split(',')[0]}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                            q.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-150 text-rose-800'
                          }`}>
                            {q.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Register Form Column */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit">
                  <h2 className="font-bold text-slate-800 text-sm mb-1">Registrasi Pasien Masuk</h2>
                  <p className="text-xs text-slate-450 mb-5">Mendaftarkan pasien yang hadir fisik ke loket poliklinik</p>

                  {isAllowedPendaftaran ? (
                    <form onSubmit={handleCreateQueue} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Pilih Pasien Terdaftar</label>
                        <select
                          value={selectedPatientId}
                          onChange={(e) => setSelectedPatientId(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                          required
                        >
                          <option value="">-- Cari Nama Pasien --</option>
                          {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.type} - NIK: {p.nik.slice(0, 6)}...)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Pilih Poliklinik & Dokter</label>
                        <select
                          value={selectedDoctorId}
                          onChange={(e) => setSelectedDoctorId(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500"
                          required
                        >
                          <option value="">-- Pilih Poli Tujuan --</option>
                          {doctors.map((d) => (
                            <option key={d.id} value={d.id} disabled={!d.onDuty}>
                              {d.specialist} - {d.name} {!d.onDuty ? '(Tidak Praktik)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Daftarkan Antrean</span>
                      </button>
                    </form>
                  ) : (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-xs">
                      <p className="font-bold">Akses Terbatas</p>
                      <p className="mt-1">Pendaftaran antrean hanya diotorisasi untuk role Admin, Perawat, atau Dokter.</p>
                    </div>
                  )}
                </div>
                
                {/* General Queue Stats card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs">
                  <h3 className="font-bold text-slate-700 mb-3.5 flex items-center space-x-1">
                    <span>ℹ️</span>
                    <span>Informasi Antre Hari Ini</span>
                  </h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Pasien Terdaftar</span>
                      <span className="font-bold text-slate-800">{queues.length} Orang</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Selesai Dilayani</span>
                      <span className="font-bold text-emerald-600">{queues.filter(q => q.status === 'Selesai').length} Orang</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Antrean Waiting List</span>
                      <span className="font-bold text-sky-600">{queues.filter(q => q.status === 'Menunggu').length} Orang</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Antrean Dibatalkan</span>
                      <span className="font-bold text-rose-500">{queues.filter(q => q.status === 'Batal').length} Orang</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. KASIR & BILLING */}
          {queueSubTab === 'kasir' && (
            <div id="antrean-tab-kasir" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
              {/* Left Column Feed */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="font-bold text-slate-800 text-sm">Pembayaran & Invoice Kasir Finansial</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Pasien yang telah selesai diperiksa dokter poliklinik dan membutuhkan penyelesaian tagihan</p>
                    </div>
                    <span className="bg-indigo-55 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full border border-indigo-200">
                      {queues.filter(q => q.status === 'Menunggu Kasir').length} Menunggu Billing
                    </span>
                  </div>

                  {queues.filter(q => q.status === 'Menunggu Kasir').length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <p className="text-sm font-semibold">Tidak ada antrean tunggu kasir saat ini.</p>
                      <p className="text-xs mt-1">Sistem akan otomatis mengalirkan antrean ke unit kasir setelah dokter merujuk dari poli.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {queues.filter(q => q.status === 'Menunggu Kasir').map((q) => {
                        const targetKas = selectedCallCounter[q.id] || kasirCounters[0] || 'Kasir 1';

                        return (
                          <div key={q.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                            <div className="flex items-center space-x-4">
                              <div className="h-11 w-11 rounded-lg bg-indigo-600 flex flex-col items-center justify-center font-bold font-mono text-white shadow-xs">
                                <span className="text-[8px] uppercase tracking-wide opacity-80 leading-none">BILL</span>
                                <span className="text-sm mt-0.5 leading-none">{q.queueNumber}</span>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-bold text-slate-800 text-xs">{q.patientName}</h3>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    q.patientType === 'BPJS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}>
                                    {q.patientType}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">Dokter Pemeriksa: {q.doctorName}</p>
                                <p className="text-[10px] font-bold text-indigo-600 mt-0.5">Status: Menunggu Kasir</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto font-sans">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[10px] text-slate-500">Panggil di:</span>
                                <select
                                  value={targetKas}
                                  onChange={(e) => setSelectedCallCounter({ ...selectedCallCounter, [q.id]: e.target.value })}
                                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] focus:outline-none"
                                >
                                  {kasirCounters.map((ctr) => (
                                    <option key={ctr} value={ctr}>{ctr}</option>
                                  ))}
                                </select>
                              </div>

                              <button
                                type="button"
                                title="Panggil ke Kasir"
                                onClick={() => handleCallQueueAtCounter(q, targetKas)}
                                className={`p-2 rounded-lg border text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center space-x-1 ${
                                  speaking === q.id ? 'bg-amber-100 text-amber-700 border-amber-300 animate-pulse shadow-xs' : 'bg-white border-slate-200'
                                }`}
                              >
                                <Volume2 className="h-4 w-4" />
                                <span className="text-[10px] font-bold">Panggil</span>
                              </button>

                              {isAllowedKasir && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBillingQueue(q);
                                    setCashAmount(0);
                                  }}
                                  className={`px-3 py-2 font-bold text-[10px] rounded-lg border flex items-center space-x-1 cursor-pointer transition-all ${
                                    selectedBillingQueue?.id === q.id
                                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs'
                                      : 'bg-indigo-50 border-indigo-150 text-indigo-700 hover:bg-indigo-105'
                                  }`}
                                >
                                  <CreditCard className="h-3 w-3" />
                                  <span>{selectedBillingQueue?.id === q.id ? 'Sedang Diproses' : 'Proses Bayar'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Display Operational Grid of Kasir */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-in text-xs">
                  <h3 className="font-bold text-slate-800 text-xs mb-1">Status Operasional Loket Kasir</h3>
                  <p className="text-[11px] text-slate-500 mb-4">Daftar loket kasir aktif yang sedang melayani transaksi pembayaran pasien</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kasirCounters.map((ctr) => {
                      const call = activeCounterCalls[ctr];
                      return (
                        <div key={ctr} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between space-y-2.5">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-700 text-xs">{ctr}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${call ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-550'}`}>
                              {call ? 'Transaksi' : 'Standby'}
                            </span>
                          </div>
                          {call ? (
                            <div>
                              <p className="text-lg font-black font-mono text-indigo-600 leading-none">{call.queueNo}</p>
                              <p className="text-[11px] text-slate-600 font-medium truncate mt-1">{call.patientName}</p>
                              <p className="text-[9px] text-slate-405 mt-0.5">Dilayani sejak: {call.time}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">Belum melayani antrean</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column Checkout Invoice */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 min-h-[300px]">
                  {selectedBillingQueue ? (
                    (() => {
                      const billDetails = getBillingDetails(selectedBillingQueue.patientId);
                      const changeAmount = cashAmount > 0 ? Math.max(0, cashAmount - billDetails.totalBill) : 0;
                      return (
                        <div className="space-y-5 animate-fade-in">
                          <div className="border-b border-dashed border-slate-200 pb-3">
                            <h3 className="font-bold text-slate-850 text-xs flex items-center space-x-1">
                              <Receipt className="h-4.5 w-4.5 text-indigo-600" />
                              <span>Invoice Kasir Klinik</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono tracking-wider">Antrean: {selectedBillingQueue.queueNumber} | {selectedBillingQueue.patientName}</p>
                          </div>

                          {/* Price Breakdowns */}
                          <div className="space-y-2 text-[11px]">
                            <div className="flex justify-between items-center text-slate-600 py-1 border-b border-slate-50">
                              <span>Konsultasi & Jasa Medis</span>
                              <span className="font-semibold text-slate-800">Rp {billDetails.consultationFee.toLocaleString('id-ID')}</span>
                            </div>
                            
                            {billDetails.itemsList.length === 0 ? (
                              <p className="text-[10px] text-slate-450 italic py-1">Tidak ada resep obat terdaftar hari ini</p>
                            ) : (
                              <div className="space-y-1 py-1">
                                <p className="text-[10px] font-bold text-slate-550 uppercase tracking-tight">Rincian Obat Resep:</p>
                                {billDetails.itemsList.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-slate-505 pl-2">
                                    <span>{item.name} (x{item.qty})</span>
                                    <span>Rp {item.subtotal.toLocaleString('id-ID')}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs font-black text-slate-800">
                              <span className="uppercase tracking-wider text-[10px] font-bold">TOTAL TAGIHAN</span>
                              <span className="text-sm font-black text-indigo-700">Rp {billDetails.totalBill.toLocaleString('id-ID')}</span>
                            </div>
                            
                            {selectedBillingQueue.patientType === 'BPJS' && (
                              <div className="p-2.5 bg-emerald-50 text-emerald-800 text-[10px] rounded-lg border border-emerald-100 font-medium">
                                ✓ Pasien klaim BPJS Kesehatan. Seluruh jasa medis dan resep obat ditanggung BPJS (Rp 0).
                              </div>
                            )}
                          </div>

                          {/* Payment Inputs */}
                          {billDetails.totalBill > 0 && (
                            <div className="space-y-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Metode Transaksi</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                  <button
                                    type="button"
                                    onClick={() => setPaymentMethod('Tunai')}
                                    className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                      paymentMethod === 'Tunai'
                                        ? 'bg-white text-slate-800 border-slate-300 shadow-xs'
                                        : 'text-slate-500 border-transparent hover:text-slate-700'
                                    }`}
                                  >
                                    Uang Tunai
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPaymentMethod('QRIS/Debit')}
                                    className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                      paymentMethod === 'QRIS/Debit'
                                        ? 'bg-white text-slate-800 border-slate-300 shadow-xs'
                                        : 'text-slate-500 border-transparent hover:text-slate-700'
                                    }`}
                                  >
                                    QRIS / Debit
                                  </button>
                                </div>
                              </div>

                              {paymentMethod === 'Tunai' && (
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Uang Diterima (Rp)</label>
                                  <input
                                    type="number"
                                    placeholder="Jumlah Tunai"
                                    value={cashAmount || ''}
                                    onChange={(e) => setCashAmount(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                  />
                                </div>
                              )}

                              {paymentMethod === 'Tunai' && cashAmount > 0 && (
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                                  <span>Kembalian</span>
                                  <span className="text-emerald-700 font-mono text-xs">Rp {changeAmount.toLocaleString('id-ID')}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Confirm Invoice buttons */}
                          <div className="space-y-2">
                            <button
                              type="button"
                              disabled={billDetails.totalBill > 0 && paymentMethod === 'Tunai' && cashAmount < billDetails.totalBill}
                              onClick={handleConfirmPayment}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-xs text-center flex items-center justify-center space-x-1.5"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Konfirmasi Lunas & Kirim Apotek</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedBillingQueue(null)}
                              className="w-full py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-[10px] text-slate-500 cursor-pointer text-center"
                            >
                              Batalkan Proses
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12 text-slate-400 h-full">
                      <Receipt className="h-8 w-8 text-slate-200 mb-2" />
                      <p className="font-semibold text-[11px] leading-relaxed">Belum Ada Sesi Billing Dipilih</p>
                      <p className="text-[10px] text-slate-450 max-w-[180px] mt-0.5">Silakan pilih tombol "Proses Bayar" di salah satu baris antrean sebelah kiri.</p>
                    </div>
                  )}
                </div>

                {/* Manage Kasir counters */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-fade-in mt-6">
                  <h2 className="font-bold text-slate-805 text-xs mb-1">Tambah Loket Kasir baru</h2>
                  <p className="text-[11px] text-slate-500 mb-4 font-normal">Tambahkan loket kasir baru (misal: Kasir 2, Kasir BPJS) ke sistem antrean</p>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Contoh: Kasir 2, Kasir BPJS"
                      value={newCounterFormName}
                      onChange={(e) => setNewCounterFormName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCounter('kasir')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      (+) Tambah Loket Kasir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. APOTEK & OBAT */}
          {queueSubTab === 'obat' && (
            <div id="antrean-tab-obat" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
              {/* Left Column Feed */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="font-bold text-slate-800 text-sm">Penyiapan & Penyerahan Resep Apotek</h2>
                      <p className="text-[11px] text-slate-500 mt-0.5">Daftar resep obat pasien yang sedang diproses di loket farmasi depo obat klinik</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200">
                      {queues.filter(q => q.status === 'Menunggu Obat').length} Menunggu Obat
                    </span>
                  </div>

                  {queues.filter(q => q.status === 'Menunggu Obat').length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <p className="text-sm font-semibold">Tidak ada antrean tunggu obat saat ini.</p>
                      <p className="text-xs mt-1">Sistem akan otomatis merujuk antrean ke apotek setelah pembayaran kasir divalidasi lunas.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {queues.filter(q => q.status === 'Menunggu Obat').map((q) => {
                        const targetFar = selectedCallCounter[q.id] || farmasiCounters[0] || 'Farmasi 1';

                        return (
                          <div key={q.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                            <div className="flex items-center space-x-4">
                              <div className="h-11 w-11 rounded-lg bg-emerald-600 flex flex-col items-center justify-center font-bold font-mono text-white shadow-xs">
                                <span className="text-[8px] uppercase tracking-wide opacity-80 leading-none">RX</span>
                                <span className="text-sm mt-0.5 leading-none">{q.queueNumber}</span>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2 font-sans">
                                  <h3 className="font-bold text-slate-800 text-xs">{q.patientName}</h3>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    q.patientType === 'BPJS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}>
                                    {q.patientType}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">Dokter Pemeriksa: {q.doctorName}</p>
                                <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Status: Antre Apotek</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto font-sans">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-[10px] text-slate-500">Panggil di:</span>
                                <select
                                  value={targetFar}
                                  onChange={(e) => setSelectedCallCounter({ ...selectedCallCounter, [q.id]: e.target.value })}
                                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] focus:outline-none"
                                >
                                  {farmasiCounters.map((ctr) => (
                                    <option key={ctr} value={ctr}>{ctr}</option>
                                  ))}
                                </select>
                              </div>

                              <button
                                type="button"
                                title="Panggil ke Farmasi"
                                onClick={() => handleCallQueueAtCounter(q, targetFar)}
                                className={`p-2 rounded-lg border text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center space-x-1 ${
                                  speaking === q.id ? 'bg-amber-100 text-amber-700 border-amber-300 animate-pulse shadow-xs' : 'bg-white border-slate-200'
                                }`}
                              >
                                <Volume2 className="h-4 w-4" />
                                <span className="text-[10px] font-bold">Panggil</span>
                              </button>

                              {isAllowedObat && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedApotekQueue(q)}
                                  className={`px-3 py-2 font-bold text-[10px] rounded-lg border flex items-center space-x-1 cursor-pointer transition-all ${
                                    selectedApotekQueue?.id === q.id
                                      ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                                      : 'bg-emerald-50 border-emerald-155 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  <Receipt className="h-3 w-3" />
                                  <span>{selectedApotekQueue?.id === q.id ? 'Sedang Diproses' : 'Rincian Resep'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Display Operational Grid of Farmasi */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-in text-xs">
                  <h3 className="font-bold text-slate-800 text-xs mb-1">Status Operasional Loket Farmasi</h3>
                  <p className="text-[11px] text-slate-500 mb-4">Daftar loket depo obat aktif yang sedang melayani dispensing dan penyerahan obat</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {farmasiCounters.map((ctr) => {
                      const call = activeCounterCalls[ctr];
                      return (
                        <div key={ctr} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between space-y-2.5">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-700 text-xs">{ctr}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${call ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-550'}`}>
                              {call ? 'Dispensing' : 'Standby'}
                            </span>
                          </div>
                          {call ? (
                            <div>
                              <p className="text-lg font-black font-mono text-emerald-600 leading-none">{call.queueNo}</p>
                              <p className="text-[11px] text-slate-600 font-medium truncate mt-1">{call.patientName}</p>
                              <p className="text-[9px] text-slate-405 mt-0.5">Layanan: {call.time}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">Belum melayani antrean</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column Pharmacy Dispense Panel */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 min-h-[300px]">
                  {selectedApotekQueue ? (
                    (() => {
                      // Find record today
                      const record = medicalRecords.find(
                        (r) => r.patientId === selectedApotekQueue.patientId && r.date === new Date().toISOString().split('T')[0]
                      );
                      return (
                        <div className="space-y-4 animate-fade-in">
                          <div className="border-b border-dashed border-slate-200 pb-3">
                            <h3 className="font-bold text-slate-850 text-xs flex items-center space-x-1">
                              <span>💊</span>
                              <span>Dispensing Resep Apoteker</span>
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-wider">Resep: {selectedApotekQueue.queueNumber} | {selectedApotekQueue.patientName}</p>
                          </div>

                          <div className="space-y-3.5 text-xs">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Kompilasi Obat & Dosis Yang Harus Diramu:</p>
                            
                            {!record || !record.prescribedMeds || record.prescribedMeds.length === 0 ? (
                              <p className="text-slate-450 italic text-[11px] py-2">Tidak ada daftar resep obat untuk pasien hari ini di sistem.</p>
                            ) : (
                              <div className="space-y-2">
                                {record.prescribedMeds.map((med, idx) => (
                                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-start justify-between">
                                    <div>
                                      <p className="font-bold text-slate-800 text-[11px] flex items-center flex-wrap gap-1">
                                        <span>{med.name}</span>
                                        {med.isNotAvailable && (
                                          <span className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 text-[8px] font-black rounded uppercase tracking-wider">
                                            Luar / Kosong
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-[9px] text-slate-500 mt-1 italic">Aturan: {med.usage}</p>
                                    </div>
                                    <span className="font-bold font-mono text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                                      x{med.qty}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action Hand-over Button */}
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <button
                              type="button"
                              onClick={handleConfirmDispense}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl cursor-pointer flex items-center justify-center space-x-1 shadow-xs"
                            >
                              <Check className="h-4 w-4" />
                              <span>Serahkan Obat & Selesai</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedApotekQueue(null)}
                              className="w-full py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-[10px] text-slate-500 cursor-pointer text-center"
                            >
                              Batalkan Proses
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12 text-slate-400 h-full">
                      <span>💊</span>
                      <p className="font-semibold text-[11px] mt-1.5">Belum Ada Sesi Ramu Dipilih</p>
                      <p className="text-[10px] text-slate-450 max-w-[180px] mt-0.5">Silakan pilih tombol "Rincian Resep" pada baris antrean obat sebelah kiri.</p>
                    </div>
                  )}
                </div>

                {/* Manage Farmasi counters */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-fade-in mt-6 text-xs">
                  <h2 className="font-bold text-slate-805 text-xs mb-1">Tambah Loket Farmasi baru</h2>
                  <p className="text-[11px] text-slate-500 mb-4 font-normal">Tambahkan depo/loket farmasi baru (misal: Farmasi 2, Farmasi Racikan) ke sistem antrean</p>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Contoh: Farmasi 2, Farmasi Racikan"
                      value={newCounterFormName}
                      onChange={(e) => setNewCounterFormName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCounter('farmasi')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      (+) Tambah Loket Farmasi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* HD TV Monitor Lobby */
        <div id="antrean-tv-screen" className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/5 -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-500/5 -ml-32 -mb-32 pointer-events-none"></div>

          {/* Header TV */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-8 relative z-10">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🏥</span>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-white uppercase">Klinik Pratama Sehat Utama</h2>
                <p className="text-[11px] text-slate-400 font-medium">Bekerja Sama Dengan BPJS Kesehatan & Asuransi Utama</p>
              </div>
            </div>
            
            <div className="text-right">
              <h3 className="text-lg font-mono font-bold text-emerald-400">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-xs text-slate-400 font-mono">Layar Utama Panggilan Antrean</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
            {/* Active Poliklinik Rooms (Col span 3) */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doc) => {
                const checkedQueue = activeQueues.find((q) => q.doctorId === doc.id && q.status === 'Diperiksa');
                const nextQueuesList = activeQueues.filter((q) => q.doctorId === doc.id && q.status === 'Menunggu');
                
                return (
                  <div key={doc.id} className="bg-slate-800/80 rounded-2xl border border-slate-700/60 p-6 flex flex-col justify-between min-h-[220px]">
                    <div className="pb-4 border-b border-slate-700/50">
                      <div className="flex justify-between items-start">
                        <span className="bg-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-sky-400/10">
                          {doc.specialist}
                        </span>
                        <span className="text-xs text-emerald-400 font-mono font-bold tracking-tight bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {doc.room.split(' - ')[1]}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-2 truncate">{doc.name}</h4>
                    </div>

                    {/* Big Called Number */}
                    <div className="my-4 text-center py-2 bg-slate-950/40 rounded-xl border border-slate-700/20 flex flex-col items-center justify-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">NOMOR SEDANG DIPANGGIL</p>
                      {checkedQueue ? (
                        <div className="flex items-center space-x-3">
                          <span className="text-4xl font-black font-mono tracking-tight text-emerald-400 animate-pulse">
                            {checkedQueue.queueNumber}
                          </span>
                          <button
                            title="Panggil Suara"
                            onClick={() => speakQueue(checkedQueue)}
                            className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold font-mono tracking-widest text-slate-600">- KOSONG -</span>
                      )}
                    </div>

                    {/* Waiting Next in Line */}
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">MENGANTRE BERIKUTNYA</p>
                      {nextQueuesList.length === 0 ? (
                        <p className="text-xs text-slate-600 italic">Belum ada pasien antre berikutnya</p>
                      ) : (
                        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                          {nextQueuesList.slice(0, 3).map((nq) => (
                            <span key={nq.id} className="text-xs font-mono font-extrabold bg-slate-700/60 border border-slate-600 px-2.5 py-1 rounded text-slate-300">
                              {nq.queueNumber}
                            </span>
                          ))}
                          {nextQueuesList.length > 3 && (
                            <span className="text-[10px] text-slate-500">+{nextQueuesList.length - 3} lagi</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar Right: Next queues feed on TV */}
            <div className="bg-slate-800/40 rounded-2xl border border-slate-700/30 p-6 flex flex-col justify-between min-h-[300px]">
              <div>
                <h3 className="font-bold text-slate-300 text-sm border-b border-slate-700 pb-3 mb-4 flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                  <span>Daftar Waiting List</span>
                </h3>
                
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {activeQueues.filter(q => q.status === 'Menunggu').map((q) => (
                    <div key={q.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/40">
                      <div>
                        <p className="text-xs font-extrabold text-white truncate max-w-[110px]">{q.patientName}</p>
                        <p className="text-[10px] text-sky-400">{getDoctorDetails(q.doctorId)?.specialist.split(' ').slice(-1).join('') || 'Umum'}</p>
                      </div>
                      <span className="font-mono text-xs font-black bg-slate-950/60 px-2 py-1 rounded text-amber-400">
                        {q.queueNumber}
                      </span>
                    </div>
                  ))}
                  {activeQueues.filter(q => q.status === 'Menunggu').length === 0 && (
                    <p className="text-xs text-slate-500 italic text-center py-8">Tidak ada daftar tunggu lama</p>
                  )}
                </div>
              </div>

              {/* Bottom running text or alert */}
              <div className="pt-4 border-t border-slate-700/40 lg:mt-6">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">PENGUMUMAN LOBBY</p>
                  <p className="text-xs text-emerald-400/90 leading-normal">
                    Pasien BPJS harap menyiapkan E-KTP atau Kartu KIS asli saat pemeriksaan dokter. Terima kasih.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cetak Resep Dokter Modal */}
      {selectedPrintPrescription && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto font-serif">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Exit */}
            <button
              onClick={() => setSelectedPrintPrescription(null)}
              className="absolute right-4 top-4 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500 font-sans text-xs cursor-pointer"
            >
              ✕
            </button>

            {/* Document Resep wrapper */}
            <div id="recipe-paper-print-queue" className="border-2 border-slate-800 p-6 space-y-4 text-slate-800 select-all text-left">
              <div className="flex items-center justify-between border-b pb-3 border-slate-800 font-sans">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏥</span>
                  <div>
                    <h2 className="font-extrabold text-xs tracking-tight uppercase text-indigo-900 leading-tight">Klinik Pratama Sehat Utama</h2>
                    <p className="text-[8px] text-slate-500">Jl. Boulevard Raya Barat No. 128, Kelapa Gading Selatan</p>
                  </div>
                </div>
                <div className="text-right text-[8px] text-slate-450 font-mono">
                  No. Resep: RX-{selectedPrintPrescription.id.replace('MR', '')}
                </div>
              </div>

              {/* Doctor Details */}
              <div className="text-xs font-sans space-y-0.5">
                <p className="font-bold text-slate-900">Dr. Penanggung Jawab: {selectedPrintPrescription.doctorName}</p>
                <p className="text-[9px] text-slate-450 font-mono">SIP: {doctors.find(d => d.name === selectedPrintPrescription.doctorName)?.sip || 'SIP.982/108/DISMA/2026'}</p>
                <p className="text-[9px] text-slate-500 block">Tanggal Peresepan: {selectedPrintPrescription.date}</p>
              </div>

              <hr className="border-slate-800" />

              {/* Prescription symbol list */}
              <div className="space-y-3">
                <div className="text-lg font-black font-serif italic tracking-wide">R/</div>
                
                <div className="pl-6 space-y-3.5">
                  {selectedPrintPrescription.prescribedMeds && selectedPrintPrescription.prescribedMeds.map((med, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex justify-between font-bold text-slate-850">
                        <span className="font-sans font-bold flex items-center">
                                          <span>{med.name}</span>
                                          {med.isNotAvailable && (
                                            <span className="ml-1.5 px-1 py-0.5 border border-dashed border-amber-700 text-amber-900 bg-amber-50 text-[7px] font-black uppercase rounded tracking-wide leading-none">
                                              Resep Luar
                                            </span>
                                          )}
                                        </span>
                        <span className="font-mono text-indigo-850">No. {med.qty}</span>
                      </div>
                      <p className="text-[10px] text-slate-550 italic mt-0.5 pl-1">S. {med.usage}</p>
                    </div>
                  ))}
                  
                  {(!selectedPrintPrescription.prescribedMeds || selectedPrintPrescription.prescribedMeds.length === 0) && (
                    <p className="text-xs italic text-slate-450 pl-2">Tidak ada rekomendasi resep obat formal.</p>
                  )}
                </div>
              </div>

              <hr className="border-dashed border-slate-400" />

              {/* Patient block footer */}
              <div className="text-[11px] font-sans space-y-1 bg-slate-50 p-2.5 border border-slate-200 rounded-lg">
                <p className="text-slate-705"><strong>Pro (Pasien):</strong> {selectedPrintPrescription.patientName}</p>
                <p className="text-[10px] text-slate-450 font-mono">Nomor Rekam Medis: {selectedPrintPrescription.id}</p>
                <p className="text-[10px] text-slate-450">Status Jaminan Layanan: {patients.find(p => p.id === selectedPrintPrescription.patientId)?.type || 'Umum'}</p>
              </div>

              {/* Doctor sign line */}
              <div className="pt-4 text-right font-sans text-xs">
                <span className="text-[9px] text-slate-400 block mb-12">Tanda Tangan & Cap Dokter</span>
                <strong className="underline text-slate-900 block">{selectedPrintPrescription.doctorName}</strong>
                <span className="text-[9px] font-mono text-slate-500">{doctors.find(d => d.name === selectedPrintPrescription.doctorName)?.sip || 'SIP.982'}</span>
              </div>
            </div>

            {/* Print trigger button controls */}
            <div className="mt-5 flex justify-end space-x-2 font-sans">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak / Download PDF</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedPrintPrescription(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cetak Surat Keterangan Dokter Modal */}
      {selectedPrintCert && selectedPrintCert.doctorCertificate && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto font-serif">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Exit */}
            <button
              onClick={() => setSelectedPrintCert(null)}
              className="absolute right-4 top-4 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500 font-sans text-xs cursor-pointer"
            >
              ✕
            </button>

            {/* Document Surat wrapper */}
            <div id="cert-paper-print-queue" className="border-2 border-slate-800 p-8 space-y-6 text-slate-800 select-all text-left">
              {/* Header */}
              <div className="text-center border-b-2 border-double pb-4 border-slate-800 font-sans">
                <div className="flex items-center justify-center space-x-2.5 mb-1">
                  <span className="text-3xl">🏥</span>
                  <div className="text-left">
                    <h2 className="font-black text-sm tracking-tight uppercase text-indigo-900 leading-tight">Klinik Pratama Sehat Utama</h2>
                    <p className="text-[9px] text-slate-500 font-medium">Jl. Boulevard Raya Barat No. 128, Kelapa Gading Selatan</p>
                    <p className="text-[8px] text-slate-400 font-mono">Telp: (021) 458-9201 | Email: info@sehatutama.co.id</p>
                  </div>
                </div>
              </div>

              {/* Title of Document */}
              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-xs uppercase tracking-wider underline text-slate-900">
                  {selectedPrintCert.doctorCertificate.type === 'Sakit' 
                    ? 'SURAT KETERANGAN ISTIRAHAT SAKIT' 
                    : 'SURAT KETERANGAN SEHAT'}
                </h3>
                <p className="text-[9px] text-slate-500 font-mono">No: {selectedPrintCert.id.replace('MR', 'SKD-')}/V/2026</p>
              </div>

              <div className="text-xs space-y-4 font-sans leading-relaxed text-slate-700">
                <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>

                {/* Patient Specifications */}
                <div className="grid grid-cols-12 gap-x-2 gap-y-1 pl-4">
                  <div className="col-span-4 text-slate-500 font-medium">Nama Lengkap</div>
                  <div className="col-span-8 font-bold text-slate-900">: {selectedPrintCert.patientName}</div>

                  <div className="col-span-4 text-slate-500 font-medium">Tgl Lahir / Umur</div>
                  <div className="col-span-8">: {(() => {
                    const patient = patients.find(p => p.id === selectedPrintCert.patientId);
                    if (!patient) return '-';
                    const birthYear = new Date(patient.birthDate).getFullYear();
                    const age = 2026 - birthYear;
                    return `${patient.birthDate} (${age} Tahun)`;
                  })()}</div>

                  <div className="col-span-4 text-slate-500 font-medium">Jenis Kelamin</div>
                  <div className="col-span-8">: {patients.find(p => p.id === selectedPrintCert.patientId)?.gender || '-'}</div>

                  <div className="col-span-4 text-slate-500 font-medium">Alamat Tinggal</div>
                  <div className="col-span-8 text-[11px] leading-tight">: {patients.find(p => p.id === selectedPrintCert.patientId)?.address || '-'}</div>
                </div>

                {/* Content body based on cert type */}
                {selectedPrintCert.doctorCertificate.type === 'Sakit' && selectedPrintCert.doctorCertificate.sickLeave ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-justify leading-relaxed">
                      Berdasarkan hasil pemeriksaan klinis yang telah kami lakukan terhadap pasien tersebut di atas, dengan ini menerangkan bahwa pasien dalam keadaan <strong>SAKIT</strong> sehingga membutuhkan istirahat untuk memulihkan kesehatannya.
                    </p>
                    <p className="text-justify leading-relaxed">
                      Kepadanya diberikan izin beristirahat tidak masuk kerja/sekolah selama <strong>{selectedPrintCert.doctorCertificate.sickLeave.durationDays} hari</strong>, terhitung sejak tanggal <strong>{selectedPrintCert.doctorCertificate.sickLeave.startDate}</strong> s/d <strong>{selectedPrintCert.doctorCertificate.sickLeave.endDate}</strong>.
                    </p>
                    <p>
                      <strong>Keperluan / Alasan:</strong> {selectedPrintCert.doctorCertificate.sickLeave.reason || 'Pemulihan Kesehatan / Istirahat Sakit'}
                    </p>
                  </div>
                ) : selectedPrintCert.doctorCertificate.healthCert ? (
                  <div className="space-y-4 pt-2">
                    <p className="text-justify leading-relaxed">
                      Berdasarkan hasil riwayat pemeriksaan fisik klinis jasmani yang telah kami lakukan pada hari ini, pasien tersebut di atas dinyatakan dalam kondisi <strong>SEHAT JASMANI</strong> dengan rincian data vital sebagai berikut:
                    </p>
                    
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px] bg-slate-50/55 max-w-sm mx-auto">
                      <table className="w-full text-left font-serif">
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="p-2.5 text-slate-500 font-sans">Tinggi Badan / Berat Badan</td>
                            <td className="p-2.5 font-bold text-slate-900 font-mono">{selectedPrintCert.doctorCertificate.healthCert.height} cm / {selectedPrintCert?.physicalExam?.weight || 0} kg</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-500 font-sans">Tekanan Darah (Tensi)</td>
                            <td className="p-2.5 font-bold text-slate-900 font-mono">{selectedPrintCert?.physicalExam?.bloodPressure || '-'} mmHg</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-500 font-sans">Golongan Darah</td>
                            <td className="p-2.5 font-extrabold text-slate-900 font-mono font-sans">{selectedPrintCert.doctorCertificate.healthCert.bloodType}</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-500 font-sans">Status Buta Warna</td>
                            <td className="p-2.5 font-bold text-slate-900 font-sans">{selectedPrintCert.doctorCertificate.healthCert.colorBlind === 'Ya' ? 'BUTA WARNA' : 'TIDAK BUTA WARNA'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p>
                      <strong>Keperluan Surat Keterangan:</strong> {selectedPrintCert.doctorCertificate.healthCert.purpose || 'Persyaratan Melamar Pekerjaan / Administrasi'}
                    </p>
                  </div>
                ) : null}

                <p className="pt-2 leading-relaxed">
                  Demikian surat keterangan pemeriksaan ini kami buat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
                </p>
              </div>

              {/* Doctor sign line */}
              <div className="pt-8 flex justify-between items-end font-sans text-xs">
                <div className="text-left font-mono text-[9px] text-slate-400">
                  MR-ID: {selectedPrintCert.id}
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[9px] text-slate-500">Jakarta, {selectedPrintCert.date}</p>
                  <span className="text-[9px] text-slate-405 block pb-12 font-medium">Dokter Pemeriksa,</span>
                  <strong className="underline text-slate-950 block font-bold">{selectedPrintCert.doctorName}</strong>
                  <span className="text-[9px] font-mono text-slate-500">{doctors.find(d => d.name === selectedPrintCert.doctorName)?.sip || 'SIP.982/108/DISMA/2026'}</span>
                </div>
              </div>
            </div>

            {/* Print trigger button controls */}
            <div className="mt-5 flex justify-end space-x-2 font-sans">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak / Download PDF</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedPrintCert(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

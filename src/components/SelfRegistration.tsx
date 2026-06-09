import React, { useState } from 'react';
import { Patient, Doctor, Queue } from '../types';
import {
  ArrowLeft,
  Search,
  UserPlus,
  UserCheck,
  CheckCircle,
  Printer,
  Calendar,
  AlertCircle,
  Info
} from 'lucide-react';

interface SelfRegistrationProps {
  patients: Patient[];
  doctors: Doctor[];
  queues: Queue[];
  onAddPatient: (patientPayload: Omit<Patient, 'id'>) => void;
  onAddQueue: (patientId: string, doctorId: string) => void;
  onLogActivity: (action: string, details: string) => void;
  onBackToLogin: () => void;
}

export default function SelfRegistration({
  patients,
  doctors,
  queues,
  onAddPatient,
  onAddQueue,
  onLogActivity,
  onBackToLogin
}: SelfRegistrationProps) {
  const [mode, setMode] = useState<'search' | 'register'>('search');
  const [searchNik, setSearchNik] = useState('');
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [searchError, setSearchError] = useState('');

  // Register form state
  const [nik, setNik] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [type, setType] = useState<'Umum' | 'BPJS'>('Umum');
  const [bpjsNumber, setBpjsNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState('');

  // Queue process state
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [activeStep, setActiveStep] = useState<1 | 2>(1); // 1: Patient ID, 2: Select Doc/Get Ticket
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<{
    queueNumber: string;
    patientName: string;
    doctorName: string;
    room: string;
    waitingAhead: number;
    datetime: string;
  } | null>(null);

  const handleSearchPatient = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setFoundPatient(null);

    if (!searchNik.trim()) {
      setSearchError('Silakan masukkan nomor NIK Anda.');
      return;
    }

    const patient = patients.find((p) => p.nik === searchNik.trim());
    if (patient) {
      setFoundPatient(patient);
      setActivePatient(patient);
      setActiveStep(2); // Proceed to doctor selection step
      onLogActivity('Pendaftaran Mandiri', `Pasien lama teridentifikasi lewat NIK: ${patient.name}`);
    } else {
      setSearchError('Pasien dengan NIK tersebut tidak ditemukan. Silakan daftarkan diri Anda di tab "Registrasi Baru".');
    }
  };

  const handleRegisterNewPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (nik.length !== 16) {
      alert('NIK harus terdiri dari 16 digit angka.');
      return;
    }
    if (type === 'BPJS' && !bpjsNumber) {
      alert('Nomor JKN-BPJS Kesehatan wajib diisi jika memilih jenis BPJS.');
      return;
    }

    // Check duplicate NIK
    const isExist = patients.some((p) => p.nik === nik);
    if (isExist) {
      alert('NIK sudah terdaftar dalam database sistem klinik!');
      return;
    }

    const patientPayload: Omit<Patient, 'id'> = {
      nik,
      name,
      gender,
      type,
      bpjsNumber: type === 'BPJS' ? bpjsNumber : undefined,
      birthDate,
      phone,
      address,
      registerDate: new Date().toISOString().split('T')[0],
      bpjsStatus: type === 'BPJS' ? 'Belum Dicek' : undefined,
    };

    // Trigger parent app state adding patient
    onAddPatient(patientPayload);

    // After state update, we find this newly added patient or synthesize temporary view
    // Since handleAddPatient pushes immediately, we can predict its identification
    const tempPatientId = 'P00' + (patients.length + 1);
    const simulatedPatient: Patient = {
      id: tempPatientId,
      ...patientPayload
    };

    setActivePatient(simulatedPatient);
    setActiveStep(2);
    onLogActivity('Kiosk Registrasi', `Pasien baru mendaftar mandiri NIK: ${name}`);
    alert('Pendaftaran Pasien baru berhasil! Silakan pilih poli dokter tujuan Anda berikut ini.');
  };

  const handleGetQueueTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    if (!selectedDoctorId) {
      alert('Silakan pilih salah satu poliklinik & dokter!');
      return;
    }

    const doctor = doctors.find((d) => d.id === selectedDoctorId);
    if (!doctor) return;

    // Call state-level queue injection
    onAddQueue(activePatient.id, selectedDoctorId);

    // Construct print ticket representation
    const prefix = selectedDoctorId === 'D001' ? 'A' : selectedDoctorId === 'D002' ? 'B' : selectedDoctorId === 'D003' ? 'D' : 'C';
    const queuesOfPoli = queues.filter((q) => q.doctorId === selectedDoctorId);
    const queueNo = `${prefix}-${String(queuesOfPoli.length + 1).padStart(2, '0')}`;
    const waitingAhead = queuesOfflineCount(selectedDoctorId);

    setGeneratedTicket({
      queueNumber: queueNo,
      patientName: activePatient.name,
      doctorName: doctor.name,
      room: doctor.room,
      waitingAhead: waitingAhead,
      datetime: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    });

    onLogActivity('Kiosk Antrean Mandiri', `Pasien ${activePatient.name} mengambil nomor antrean ${queueNo}`);
  };

  const queuesOfflineCount = (docId: string) => {
    return queues.filter((q) => q.doctorId === docId && (q.status === 'Menunggu' || q.status === 'Diperiksa')).length;
  };

  const handlePrintTicket = () => {
    window.print();
  };

  const handleResetKiosk = () => {
    setMode('search');
    setSearchNik('');
    setFoundPatient(null);
    setSearchError('');
    
    // Clear registration fields
    setNik('');
    setName('');
    setGender('Laki-laki');
    setType('Umum');
    setBpjsNumber('');
    setBirthDate('');
    setPhone('');
    setAddress('');

    setSelectedDoctorId('');
    setActiveStep(1);
    setActivePatient(null);
    setGeneratedTicket(null);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden">
        
        {/* Banner Header */}
        <div className="bg-sky-600 p-6 md:p-8 text-white relative">
          <button
            type="button"
            onClick={onBackToLogin}
            className="absolute left-6 top-6 md:top-8 text-white hover:text-sky-100 flex items-center space-x-1.5 text-xs font-semibold cursor-pointer transition-colors bg-white/10 px-3 py-1.5 rounded-xl border border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Portal Login</span>
          </button>

          <div className="text-center mt-6">
            <span className="text-4xl">🏥</span>
            <h1 className="font-extrabold text-xl md:text-2xl mt-3 tracking-tight">Kiosk Pendaftaran Mandiri</h1>
            <p className="text-sky-100 text-xs mt-1.5 max-w-sm mx-auto">Silakan daftarkan kunjungan Anda secara instan untuk mendapatkan nomor antrean pelayanan poliklinik</p>
          </div>
        </div>

        {/* Step Indicator */}
        {!generatedTicket && (
          <div className="flex border-b border-slate-100 bg-slate-50 text-xs px-6 py-4 justify-center space-x-8">
            <div className={`flex items-center space-x-2 pb-1 border-b-2 font-bold ${activeStep === 1 ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-400'}`}>
              <span className="h-5 w-5 rounded-full bg-sky-100 border border-sky-300 text-sky-700 flex items-center justify-center text-[10px]">1</span>
              <span>Identifikasi Pasien</span>
            </div>
            <div className={`flex items-center space-x-2 pb-1 border-b-2 font-bold ${activeStep === 2 ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-400'}`}>
              <span className="h-5 w-5 rounded-full bg-slate-100 border text-slate-500 flex items-center justify-center text-[10px]">2</span>
              <span>Poli & Tiket Antrean</span>
            </div>
          </div>
        )}

        {/* Main Forms Area */}
        <div className="p-6 md:p-8">
          
          {generatedTicket ? (
            /* PRINT TICKET SUCCESS VIEW */
            <div className="space-y-6 text-center animate-fade-in text-xs">
              <div className="flex flex-col items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-3">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-8 w-full">Antrean Berhasil Diambil!</h2>
                <p className="text-slate-500 max-w-xs mt-1">Silakan cetak nomor antrean Anda di bawah atau catat/tangkap layar token ini.</p>
              </div>

              {/* Virtual Printed Ticket Slip */}
              <div className="max-w-xs mx-auto bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-300 text-left font-mono relative text-[11px] text-slate-755 shadow-inner">
                {/* Decorative cutouts */}
                <div className="absolute -left-3 top-1/2 -mt-3 h-6 w-3 bg-white border-r border-slate-300 rounded-r-full"></div>
                <div className="absolute -right-3 top-1/2 -mt-3 h-6 w-3 bg-white border-l border-slate-300 rounded-l-full"></div>

                <div className="text-center border-b border-dashed border-slate-300 pb-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800">Sehat Utama</h3>
                  <p className="text-[9px] text-slate-400 font-sans mt-0.5">Klinik Pratama Rawat Jalan</p>
                </div>

                <div className="text-center py-6">
                  <p className="text-[10px] uppercase font-sans tracking-widest text-slate-400 font-bold">NOMOR ANTREAN</p>
                  <h1 className="text-5xl font-black tracking-tight text-sky-600 my-2 font-mono">{generatedTicket.queueNumber}</h1>
                  <p className="text-[10px] text-slate-500 font-sans mt-1 bg-sky-50 py-1 px-3 rounded-full inline-block border border-sky-100">
                    Sesi: Poli & Dokter Aktif
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-dashed border-slate-300 text-slate-650">
                  <div className="flex justify-between font-sans">
                    <span className="text-slate-400 text-[10px]">Nama Pasien</span>
                    <span className="font-bold text-slate-800 text-right">{generatedTicket.patientName}</span>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span className="text-slate-400 text-[10px]">Poli & Ruang</span>
                    <span className="font-bold text-slate-800 text-right">{generatedTicket.room}</span>
                  </div>
                  <div className="flex justify-between font-sans">
                    <span className="text-slate-400 text-[10px]">Dokter Pemeriksa</span>
                    <span className="font-bold text-slate-800 text-right">{generatedTicket.doctorName.split(',')[0]}</span>
                  </div>
                  <div className="flex justify-between font-sans pt-2 border-t border-slate-100">
                    <span className="text-slate-400 text-[10px]">Menunggu di Depan</span>
                    <span className="font-extrabold text-amber-600">{generatedTicket.waitingAhead} Orang</span>
                  </div>
                  <div className="flex justify-between font-sans text-[9px] text-slate-400 pt-3 text-center w-full block">
                    <span>{generatedTicket.datetime}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-sm mx-auto pt-4">
                <button
                  type="button"
                  onClick={handlePrintTicket}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak Tiket Fisik</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetKiosk}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Ambil Antrean Lagi
                </button>
              </div>
            </div>
          ) : activeStep === 1 ? (
            /* STEP 1: IDENTIFY PATIENT */
            <div className="space-y-6">
              
              {/* Option Selector Toggle */}
              <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => {
                    setMode('search');
                    setSearchError('');
                  }}
                  className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    mode === 'search'
                      ? 'bg-white text-slate-850 shadow-md border border-slate-200/30'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Search className="h-4 w-4" />
                  <span>Sudah Terdaftar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setSearchError('');
                  }}
                  className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-slate-850 shadow-md border border-slate-200/30'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Pasien Baru (Registrasi)</span>
                </button>
              </div>

              {mode === 'search' ? (
                /* PATIENT SEARCH SUBFORM */
                <form onSubmit={handleSearchPatient} className="space-y-4 animate-fade-in text-xs">
                  <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100/80 text-sky-800 flex items-start space-x-3 leading-relaxed">
                    <Info className="h-4.5 w-4.5 text-sky-650 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Informasi Pencarian NIK</p>
                      <p className="text-[10px] text-sky-700 mt-0.5">Bagi pasien yang sudah pernah berkunjung atau memiliki rekam medik terdaftar di klinik kami. Silakan ketik nomor induk kependudukan (NIK) 16 digit Anda di bawah ini.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1.5">Ketik NIK KTP Anda :</label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={16}
                        pattern="\d*"
                        placeholder="Contoh: 3171021405820003"
                        value={searchNik}
                        onChange={(e) => setSearchNik(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-350 rounded-2xl text-xs font-bold tracking-wider text-slate-800 focus:ring-2 focus:ring-sky-505 focus:bg-white focus:outline-none"
                      />
                      <Search className="h-4.5 w-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {searchError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span className="text-[10.5px] leading-snug">{searchError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <UserCheck className="h-4.5 w-4.5" />
                    <span>Lanjutkan & Cari Poli</span>
                  </button>
                </form>
              ) : (
                /* REGISTER NEW PATIENT SUBFORM */
                <form onSubmit={handleRegisterNewPatient} className="space-y-4 animate-fade-in text-xs text-slate-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Nomor NIK KTP (16 Digit)*</label>
                      <input
                        type="text"
                        maxLength={16}
                        required
                        placeholder="Ketik 16 Digit NIK"
                        value={nik}
                        onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Nama Lengkap Sesuai KTP*</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Muhammad Ali"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Jenis Kelamin*</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        required
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Tanggal Lahir Pasien*</label>
                      <input
                        type="date"
                        required
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Metode Jaminan Layanan*</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setType('Umum')}
                          className={`py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                            type === 'Umum'
                              ? 'bg-sky-50 text-sky-700 border-sky-300'
                              : 'text-slate-550 border-slate-250 bg-white hover:text-slate-800'
                          }`}
                        >
                          Mandiri (Umum)
                        </button>
                        <button
                          type="button"
                          onClick={() => setType('BPJS')}
                          className={`py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                            type === 'BPJS'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'text-slate-550 border-slate-250 bg-white hover:text-slate-800'
                          }`}
                        >
                          BPJS Kesehatan
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">No JKN-BPJS Kesehatan {type === 'BPJS' && '*'}</label>
                      <input
                        type="text"
                        maxLength={13}
                        disabled={type === 'Umum'}
                        placeholder={type === 'Umum' ? 'Khusus pasien BPJS Kesehatan' : 'Ketik 13 Digit nomor kepesertaan'}
                        value={bpjsNumber}
                        onChange={(e) => setBpjsNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 bg-slate-50 disabled:bg-slate-100 disabled:opacity-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        required={type === 'BPJS'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">No Handphone Aktif*</label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081299887766"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Alamat Tinggal Pasien Sesuai KTP*</label>
                    <textarea
                      required
                      placeholder="Tulis alamat rumah lengkap, rincian RT/RW, nomor rumah, kelurahan, dan kecamatan..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-sm cursor-pointer transition-colors mt-2"
                  >
                    Daftar Akun Baru & Ambil Tiket
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* STEP 2: SELECT DOCTOR & POLIKLINIK */
            <form onSubmit={handleGetQueueTicket} className="space-y-5 animate-fade-in text-xs text-slate-800">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">DATA PASIEN KEHADIRAN</span>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">{activePatient.name}</p>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">NIK: {activePatient.nik} | Jaminan: {activePatient.type}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(1);
                    setSelectedDoctorId('');
                  }}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Ubah
                </button>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-black text-slate-500 mb-3">PILIH POLIKLINIK & DOKTER TUJUAN :</label>
                <div className="grid grid-cols-1 gap-3">
                  {doctors.map((d) => {
                    const isSelected = selectedDoctorId === d.id;
                    const waitCount = queuesOfflineCount(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        disabled={!d.onDuty}
                        onClick={() => setSelectedDoctorId(d.id)}
                        className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          !d.onDuty
                            ? 'bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed'
                            : isSelected
                            ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-100 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{isSelected ? '✔️' : '👨‍⚕️'}</span>
                          <div>
                            <p className="font-extrabold text-slate-800">{d.name}</p>
                            <span className="text-[10.5px] text-slate-400 mt-0.5 block">{d.specialist} — 📌 {d.room}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg block ${
                            !d.onDuty
                              ? 'bg-slate-100 text-slate-400'
                              : isSelected
                              ? 'bg-sky-500 text-white'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {!d.onDuty ? 'TIDAK PRAKTIK' : `${waitCount} ANTREAN TUNGGU`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(1);
                    setSelectedDoctorId('');
                  }}
                  className="w-1/3 py-3 border border-slate-250 hover:bg-slate-50 rounded-xl font-bold cursor-pointer text-slate-500 text-center"
                >
                  Sebelumnya
                </button>
                <button
                  type="submit"
                  disabled={!selectedDoctorId}
                  className="w-2/3 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 select-none text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-md cursor-pointer text-center flex items-center justify-center space-x-1.5"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Ambil Antrean Sekarang</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}

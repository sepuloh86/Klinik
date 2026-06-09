import React, { useState } from 'react';
import { Patient } from '../types';
import { Search, Plus, UserPlus, FileEdit, Check, Crosshair, Users, Activity, ExternalLink, RefreshCw } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onAddPatient: (patient: Omit<Patient, 'id'>) => void;
  onUpdatePatient: (patient: Patient) => void;
  onLogActivity: (action: string, details: string) => void;
  onNavigateToRecord: (patientId: string) => void;
}

export default function PatientList({
  patients,
  onAddPatient,
  onUpdatePatient,
  onLogActivity,
  onNavigateToRecord,
}: PatientListProps) {
  const [activeTab, setActiveTab] = useState<'Umum' | 'BPJS'>('Umum');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal / Form states
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bpjsNumber, setBpjsNumber] = useState('');
  const [bpjsClass, setBpjsClass] = useState('Kelas 2');

  const filteredPatients = patients.filter((p) => {
    const matchesTab = p.type === activeTab;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nik.includes(searchQuery) ||
      (p.bpjsNumber && p.bpjsNumber.includes(searchQuery)) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setName('');
    setNik('');
    setGender('Laki-laki');
    setBirthDate('1990-01-01');
    setPhone('');
    setAddress('');
    setBpjsNumber('');
    setBpjsClass('Kelas 2');
    setShowModal(true);
  };

  const handleOpenEditModal = (p: Patient) => {
    setEditingPatient(p);
    setName(p.name);
    setNik(p.nik);
    setGender(p.gender);
    setBirthDate(p.birthDate);
    setPhone(p.phone);
    setAddress(p.address);
    setBpjsNumber(p.bpjsNumber || '');
    setBpjsClass(p.bpjsClass || 'Kelas 2');
    setShowModal(true);
  };

  const handleSubmitPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nik || !phone || !address) {
      alert('Mohon isi semua data wajib.');
      return;
    }

    if (editingPatient) {
      // Edit
      const updated: Patient = {
        ...editingPatient,
        name,
        nik,
        gender,
        birthDate,
        phone,
        address,
        bpjsNumber: activeTab === 'BPJS' ? bpjsNumber : undefined,
        bpjsClass: activeTab === 'BPJS' ? bpjsClass : undefined,
      };

      onUpdatePatient(updated);
      onLogActivity('Modifikasi Pasien', `Mengubah informasi rekam medis pasien ${name} (ID: ${editingPatient.id})`);
    } else {
      // Add
      const pPayload: Omit<Patient, 'id'> = {
        name,
        nik,
        type: activeTab,
        gender,
        birthDate,
        phone,
        address,
        registerDate: new Date().toISOString().split('T')[0],
        bpjsNumber: activeTab === 'BPJS' ? bpjsNumber : undefined,
        bpjsClass: activeTab === 'BPJS' ? bpjsClass : undefined,
        bpjsStatus: activeTab === 'BPJS' ? 'Belum Dicek' : undefined,
      };

      onAddPatient(pPayload);
      onLogActivity('Pasien Baru', `Menambahkan pasien baru atas nama ${name} kategori ${activeTab}`);
    }

    setShowModal(false);
  };

  const handleCheckBPJSMember = (p: Patient) => {
    if (!p.bpjsNumber) return;
    
    // Quick loader status change
    const updated = {
      ...p,
      bpjsStatus: 'Aktif' as const, // For mockup, we can say it's updated to Active
    };
    onUpdatePatient(updated);
    onLogActivity('Pengecekan BPJS', `Memverifikasi BPJS ${p.name} (${p.bpjsNumber}) -> Aktif`);
    alert(`Status Kartu KIS/BPJS ${p.name} dinyatakan AKTIF (Kelas 2)`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg">Direktori & Registrasi Pasien</h1>
            <p className="text-xs text-slate-500">Log pendaftaran pasien rawat jalan umum dan asuransi BPJS Kesehatan</p>
          </div>
        </div>

        <button
          id="btn-registrasi-pasien"
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span>Daftar Pasien Baru</span>
        </button>
      </div>

      {/* Tabs list & search block */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-3">
          <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('Umum')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'Umum'
                  ? 'bg-white text-slate-800 shadow-xs border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Pasien Umum ({patients.filter((p) => p.type === 'Umum').length})</span>
            </button>
            <button
              id="tab-bpjs-pasien"
              onClick={() => setActiveTab('BPJS')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'BPJS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Pasien BPJS ({patients.filter((p) => p.type === 'BPJS').length})</span>
            </button>
          </div>

          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Cari nama, NIK, alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pl-9 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Patient Grid / Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-700 table-auto border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase font-bold tracking-wider">
                <th className="px-4 py-3">ID / NIK</th>
                <th className="px-4 py-3">Nama Lengkap / Gender</th>
                <th className="px-4 py-3">Tgl Lahir / Kontak</th>
                {activeTab === 'BPJS' && (
                  <>
                    <th className="px-4 py-3">No. Kartu KIS</th>
                    <th className="px-4 py-3">Kelas / Status BPJS</th>
                  </>
                )}
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-bold text-slate-800 block">{p.id}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{p.nik}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-800 block text-sm">{p.name}</span>
                    <span className="text-slate-500 block text-[10px]">{p.gender}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-slate-700 block font-medium">{p.birthDate}</span>
                    <span className="text-slate-500 block font-mono">{p.phone}</span>
                  </td>
                  {activeTab === 'BPJS' && (
                    <>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-sm tracking-wider font-semibold text-emerald-800 bg-emerald-50 max-w-[120px] truncate block px-2 py-0.5 rounded-lg border border-emerald-100/40">
                          {p.bpjsNumber || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-slate-700 font-medium block">{p.bpjsClass}</span>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            p.bpjsStatus === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.bpjsStatus === 'Tidak Aktif'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.bpjsStatus}
                          </span>
                          
                          {p.bpjsStatus !== 'Aktif' && (
                            <button
                              onClick={() => handleCheckBPJSMember(p)}
                              className="text-emerald-600 hover:text-emerald-800 text-[10px] uppercase font-bold flex items-center"
                              title="Picu verifikasi kartu"
                            >
                              <RefreshCw className="h-2.5 w-2.5 mr-0.5 animate-spin-hover" />
                              <span>Sinc</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3.5 max-w-[180px] break-words">
                    <span className="text-slate-600 line-clamp-2 leading-normal">{p.address}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => onNavigateToRecord(p.id)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all"
                      title="Lihat Berkas Medis"
                    >
                      RM Medis
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg transition-all border border-sky-100 inline-flex items-center"
                      title="Edit Data Pasien"
                    >
                      <FileEdit className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'BPJS' ? 7 : 5} className="text-center py-12 text-slate-400">
                    Tidak ada pasien '{activeTab}' terdaftar yang sesuai kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Patient Modal popup */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <h2 className="font-bold text-slate-800 text-lg mb-4">
              {editingPatient ? 'Edit Profil Medik Pasien' : `Registrasi Pasien ${activeTab} Baru`}
            </h2>

            <form onSubmit={handleSubmitPatient} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Nama Lengkap Pasien</label>
                <input
                  type="text"
                  placeholder="Nama lengkap sesuai KTP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Nomor Induk Kependudukan (NIK)</label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="NIK 16 digit"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm leading-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">No. Handphone / Telepon</label>
                <input
                  type="text"
                  placeholder="Nomor ponsel aktif WA"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\s+/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>

              {activeTab === 'BPJS' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <div>
                    <label className="block text-emerald-800 font-semibold mb-1">No. Kartu BPJS</label>
                    <input
                      type="text"
                      maxLength={13}
                      placeholder="Nomor kartu KIS 13 digit"
                      value={bpjsNumber}
                      onChange={(e) => setBpjsNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-sm"
                      required={activeTab === 'BPJS'}
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-800 font-semibold mb-1">Kelas Layanan</label>
                    <select
                      value={bpjsClass}
                      onChange={(e) => setBpjsClass(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    >
                      <option value="Kelas 1">Kelas 1</option>
                      <option value="Kelas 2">Kelas 2</option>
                      <option value="Kelas 3">Kelas 3</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Alamat Lengkap Domisili</label>
                <textarea
                  placeholder="Alamat tempat tinggal lengkap..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-16"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-150 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Urungkan
                </button>
                <button
                  id="btn-simpan-pasien"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Simpan Profil Pasien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { ClinicProfile, RolePermission, ThemeColor, Doctor } from '../types';
import { defaultPermissions } from '../utils/initialData';
import { Upload, Palette, Settings, UserCheck, CheckCircle2, ShieldAlert, Image, Save, Plus, Trash2, Sparkles, FolderTree } from 'lucide-react';

interface ClinicSettingsProps {
  profile: ClinicProfile;
  permissions: RolePermission[];
  theme: ThemeColor;
  doctors: Doctor[];
  onChangeProfile: (profile: ClinicProfile) => void;
  onChangeTheme: (theme: ThemeColor) => void;
  onChangePermissions: (permissions: RolePermission[]) => void;
  onUpdateDoctors: (doctors: Doctor[]) => void;
  onLogActivity: (action: string, details: string) => void;
}

export default function ClinicSettings({
  profile,
  permissions,
  theme,
  doctors,
  onChangeProfile,
  onChangeTheme,
  onChangePermissions,
  onUpdateDoctors,
  onLogActivity,
}: ClinicSettingsProps) {
  const [activeTabSetting, setActiveTabSetting] = useState<'profile' | 'theme' | 'roles' | 'antrean'>('profile');
  const [selectedMatrixRole, setSelectedMatrixRole] = useState<string>('Admin');

  // New States for Doctor Registration inside Queue Setup tab
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpec, setNewDocSpec] = useState('');
  const [newDocSip, setNewDocSip] = useState('');
  const [newDocRoom, setNewDocRoom] = useState('');

  const handleAddNewDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName || !newDocSpec || !newDocSip || !newDocRoom) return;

    const newDoctorObj: Doctor = {
      id: 'D00' + (doctors.length + 1),
      name: newDocName,
      specialist: newDocSpec,
      sip: newDocSip,
      room: newDocRoom,
      onDuty: true,
      schedule: {
        Senin: '08:00 - 13:00',
        Selasa: '08:00 - 13:00',
        Rabu: '08:00 - 13:00',
        Kamis: '08:00 - 13:00',
        Jumat: '08:00 - 13:00'
      }
    };

    onUpdateDoctors([...doctors, newDoctorObj]);
    onLogActivity('Registrasi Dokter & Ruangan Baru', `Menambahkan dokter ${newDocName} di ruangan ${newDocRoom}`);
    
    // Clear form
    setNewDocName('');
    setNewDocSpec('');
    setNewDocSip('');
    setNewDocRoom('');
    alert('Dokter & ruangan baru berhasil didaftarkan!');
  };

  const rows = [
    { label: 'Dashboard Klinik', field: 'canViewDashboard', isSub: false },
    { label: 'Pendaftaran Mandiri', field: 'canViewPendaftaranMandiri', isSub: false },
    { label: 'Sistem Queue Antrean', field: 'canViewQueues', isSub: false },
    { label: '↳ Submenu: Antrean Pendaftaran & Pengecekan', field: 'canManagePendaftaranQueue', isSub: true },
    { label: '↳ Submenu: Antrean Kasir', field: 'canManageKasirQueue', isSub: true },
    { label: '↳ Submenu: Antrean Obat', field: 'canManageObatQueue', isSub: true },
    { label: '↳ Submenu: Monitor TV Lobby', field: 'canViewMonitorTVLobby', isSub: true },
    { label: 'Daftar Pasien KIS', field: 'canManagePatients', isSub: false },
    { label: '↳ Submenu: Kategori Pasien Umum', field: 'canManagePatientsUmum', isSub: true },
    { label: '↳ Submenu: Kategori Pasien BPJS', field: 'canManagePatientsBPJS', isSub: true },
    { label: 'Rekam Medis & Rujukan', field: 'canManageMedicalRecords', isSub: false },
    { label: '↳ Submenu: Catatan Rekam Medis (Anamnesa & SOAP)', field: 'canManageCatatanRekamMedis', isSub: true },
    { label: '↳ Submenu: Surat Rujukan & Form Rujukan Kustom', field: 'canManageSuratRujukan', isSub: true },
    { label: 'Jadwal Kerja Dokter', field: 'canManageSchedules', isSub: false },
    { label: '↳ Submenu: Jadwal Kerja Mingguan', field: 'canManageJadwalKerja', isSub: true },
    { label: '↳ Submenu: Laporan Kegiatan Harian Medis', field: 'canManageLaporanKegiatanHarian', isSub: true },
    { label: 'Inventaris Depo Obat', field: 'canManageInventory', isSub: false },
    { label: '↳ Submenu: Katalog & Stok Depo', field: 'canManageMedicineKatalog', isSub: true },
    { label: '↳ Submenu: Kategori & Golongan Obat', field: 'canManageMedicineKategori', isSub: true },
    { label: '↳ Submenu: Transaksi Alur Masuk Keluar', field: 'canManageMedicineTransaksi', isSub: true },
    { label: 'Supplier Rekanan', field: 'canManageSupplier', isSub: false },
    { label: 'Pembelian Klinik (PO)', field: 'canManagePurchasePO', isSub: false },
    { label: 'Laporan Audit & KPI', field: 'canManageFinance', isSub: false },
    { label: '↳ Submenu: Laba Rugi Operasional', field: 'canViewLabaRugiReport', isSub: true },
    { label: '↳ Submenu: Buku Kas & Keuangan', field: 'canViewBukuKasReport', isSub: true },
    { label: '↳ Submenu: Demografi & Kunjungan Pasien', field: 'canViewDemografiPasienReport', isSub: true },
    { label: '↳ Submenu: KPI Dokter & Tenaga Medis', field: 'canViewKpiDokterReport', isSub: true },
    { label: '↳ Submenu: SLA & Analisis Antrean', field: 'canViewSlaAntreanReport', isSub: true },
    { label: 'Karyawan / Pegawai', field: 'canManageEmployees', isSub: false },
    { label: 'Cek BPJS Kesehatan', field: 'canViewBPJSChecker', isSub: false },
    { label: 'Log Aktivitas Sistem', field: 'canViewActivityLog', isSub: false },
    { label: 'Pengaturan', field: 'canViewClinicSettings', isSub: false },
    { label: '↳ Submenu: Profil Klinik & Logo', field: 'canManageClinicProfileAndLogo', isSub: true },
    { label: '↳ Submenu: Skema Tema Warna', field: 'canManageThemeColorSchema', isSub: true },
    { label: '↳ Submenu: Matriks Hak Akses', field: 'canManageRoleAccessMatrix', isSub: true },
    { label: '↳ Submenu: Setup Antrean (Dokter & Ruangan)', field: 'canManageQueueSetup', isSub: true },
  ];

  // Profile Form States
  const [clinicName, setClinicName] = useState(profile.name);
  const [tagline, setTagline] = useState(profile.tagline);
  const [address, setAddress] = useState(profile.address);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [website, setWebsite] = useState(profile.website);
  const [logoBase64, setLogoBase64] = useState(profile.logo);

  // Loading logo trigger
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const resultBase64 = uploadEvent.target?.result as string;
      setLogoBase64(resultBase64);
      onLogActivity('Upload Logo Klinik', `Berhasil mengganti logo klinik baru`);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeProfile({
      name: clinicName,
      tagline,
      address,
      phone,
      email,
      website,
      logo: logoBase64
    });
    onLogActivity('Modifikasi Profil Klinik', `Mengupdate informasi administratif Klinik`);
    alert('Informasi profil klinik berhasil diperbarui!');
  };

  // Toggle user permissions matrix
  const handleTogglePermission = (roleIndex: number, field: keyof RolePermission) => {
    const updatedPermissions = [...permissions];
    const rolePermission = updatedPermissions[roleIndex];
    
    // Safety check - avoid mutating role name
    if (field === 'role' || field === 'description') return;

    // Mutate boolean flag
    (rolePermission[field] as boolean) = !rolePermission[field];
    onChangePermissions(updatedPermissions);
    onLogActivity('Ubah Hak Akses', `Mengubah kebijakan otorisasi/hak akses sistem untuk peran ${rolePermission.role}`);
  };

  const handleToggleCRUDPermission = (roleIndex: number, field: string, op: 'C' | 'R' | 'U' | 'D') => {
    const updatedPermissions = [...permissions];
    const rolePermission = updatedPermissions[roleIndex];
    if (!rolePermission) return;

    if (op === 'R') {
      rolePermission[field] = !rolePermission[field];
    } else {
      const key = `${field}_${op}`;
      const currentVal = rolePermission[key] !== undefined ? !!rolePermission[key] : !!rolePermission[field];
      rolePermission[key] = !currentVal;
    }

    onChangePermissions(updatedPermissions);
    onLogActivity('Ubah Otorisasi', `Mengubah hak akses CRUD (${op}) pada menu ${field} untuk peran ${rolePermission.role}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg">Konfigurasi & Pengaturan Sistem</h1>
            <p className="text-xs text-slate-500">Edit identitas resmi faskes, visual skema palet warna, serta kebijakan otorisasi hak akses user</p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTabSetting('profile')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeTabSetting === 'profile'
              ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Profil Klinik & Logo</span>
        </button>

        <button
          id="setting-theme-color-button"
          onClick={() => setActiveTabSetting('theme')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeTabSetting === 'theme'
              ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>Skema Pilihan Tema Warna Soft</span>
        </button>

        <button
          onClick={() => setActiveTabSetting('roles')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeTabSetting === 'roles'
              ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Matriks Otorisasi Hak Akses</span>
        </button>

        <button
          onClick={() => setActiveTabSetting('antrean')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeTabSetting === 'antrean'
              ? 'border-b-2 border-indigo-600 text-indigo-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Pengaturan Antrean (Ruangan & Dokter)</span>
        </button>
      </div>

      {activeTabSetting === 'profile' ? (
        /* Edit Clinic Profile */
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Logo Upload block on Left Side */}
              <div className="p-5 border border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center border-2 border-white shadow-xs overflow-hidden mb-4">
                  {logoBase64.startsWith('data:image/') ? (
                    <img src={logoBase64} alt="Klinik Logo" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl">{logoBase64}</span>
                  )}
                </div>
                
                <h4 className="font-semibold text-slate-700 text-[11px] mb-1">Logo Resmi Klinik</h4>
                <p className="text-[9px] text-slate-400 mb-4 max-w-[160px]">Format file PNG/JPG. Disarankan persegi panjang/lingkaran.</p>

                <div className="flex space-x-1.5">
                  <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-250 hover:bg-slate-50 rounded-xl text-[10px] font-bold text-slate-600 flex items-center space-x-1 shadow-xs">
                    <Upload className="h-3 w-3" />
                    <span>Upload Logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const emojis = ['🏥', '🩺', '❤️', '🌿', '⚕️', '🦷'];
                      const cur = emojis.indexOf(logoBase64);
                      const next = emojis[(cur + 1) % emojis.length];
                      setLogoBase64(next);
                      onLogActivity('Ubah Logo Emoji', `Mengganti icon klinik menjadi ${next}`);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-250 hover:bg-slate-50 rounded-xl text-[10px] font-bold text-slate-600"
                    title="Gunakan Icon Emojo Cepat"
                  >
                    Ganti Emoji
                  </button>
                </div>
              </div>

              {/* Form Input Block on Right Side */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1.5">Nama Resmi Klinik Pratama</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      value={clinicName}
                      onChange={e => setClinicName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1.5">Motto / Tagline Kesehatan</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      value={tagline}
                      onChange={e => setTagline(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1.5">Nomor Telepon Hubungan Masyarakat (Humas)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1.5">Alamat Surat Elektronik (Email)</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1.5">Situs Web Resmi (URL)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1.5">Alamat Kedudukan Fisik Faskes</label>
                  <textarea
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl h-16"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Profil Klinik</span>
              </button>
            </div>
          </form>
        </div>
      ) : activeTabSetting === 'theme' ? (
        /* Soft Theme Selections */
        <div id="pilihan-theme" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Palet Skema Visual Aplikasi</h3>
            <p className="text-xs text-slate-500">Sesuaikan mood visual rekam medis Anda menggunakan salah satu aksen warna soft di bawah ini</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Theme 1: Soft-Teal */}
            <div
              id="set-theme-soft-teal"
              onClick={() => {
                onChangeTheme('soft-teal');
                onLogActivity('Ubah Tema', 'Mengaktifkan tema warna Soft Teal');
              }}
              className={`p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all flex flex-col justify-between h-32 ${
                theme === 'soft-teal'
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/25'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <span className="font-bold text-slate-800 text-xs block">Soft Teal</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Klinis & Higienis (Default)</span>
              </div>
              <div className="flex space-x-1.5">
                <span className="h-4 w-4 rounded-full bg-emerald-600 inline-block"></span>
                <span className="h-4 w-4 rounded-full bg-emerald-50 inline-block border"></span>
              </div>
            </div>

            {/* Theme 2: Soft-Blue */}
            <div
              id="set-theme-soft-blue"
              onClick={() => {
                onChangeTheme('soft-blue');
                onLogActivity('Ubah Tema', 'Mengaktifkan tema warna Soft Blue');
              }}
              className={`p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all flex flex-col justify-between h-32 ${
                theme === 'soft-blue'
                  ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/25'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <span className="font-bold text-slate-800 text-xs block">Soft Blue</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Profesional & Berintegritas</span>
              </div>
              <div className="flex space-x-1.5">
                <span className="h-4 w-4 rounded-full bg-blue-600 inline-block"></span>
                <span className="h-4 w-4 rounded-full bg-blue-50 inline-block border"></span>
              </div>
            </div>

            {/* Theme 3: Sage Green */}
            <div
              id="set-theme-sage-green"
              onClick={() => {
                onChangeTheme('sage-green');
                onLogActivity('Ubah Tema', 'Mengaktifkan tema warna Sage Green');
              }}
              className={`p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all flex flex-col justify-between h-32 ${
                theme === 'sage-green'
                  ? 'border-teal-700 ring-2 ring-teal-500/20 bg-teal-50/25'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <span className="font-bold text-slate-800 text-xs block">Sage Green</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Alami & Menenangkan</span>
              </div>
              <div className="flex space-x-1.5">
                <span className="h-4 w-4 rounded-full bg-teal-800 inline-block"></span>
                <span className="h-4 w-4 rounded-full bg-teal-50 inline-block border"></span>
              </div>
            </div>

            {/* Theme 4: Soft-Rose */}
            <div
              id="set-theme-soft-rose"
              onClick={() => {
                onChangeTheme('soft-rose');
                onLogActivity('Ubah Tema', 'Mengaktifkan tema warna Soft Rose');
              }}
              className={`p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all flex flex-col justify-between h-32 ${
                theme === 'soft-rose'
                  ? 'border-rose-600 ring-2 ring-rose-500/20 bg-rose-50/25'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <span className="font-bold text-slate-800 text-xs block">Soft Rose</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Empati & Hangat</span>
              </div>
              <div className="flex space-x-1.5">
                <span className="h-4 w-4 rounded-full bg-rose-500 inline-block"></span>
                <span className="h-4 w-4 rounded-full bg-rose-50 inline-block border"></span>
              </div>
            </div>
          </div>
        </div>
      ) : activeTabSetting === 'roles' ? (
        /* Role Permission Access Matrix (Setting Hak Akses) */
        <div id="roles-matrix-panel" className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4 text-xs">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Konfigurasi Otorisasi & Hak Akses Klinik (RBAC Matrix)</h3>
                <p className="text-xs text-slate-500 font-medium font-semibold">Atur hak cipta data dan perizinan CRUD (Create, Read, Update, Delete) per halaman & sub-menu</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const confirmReset = window.confirm('Kembalikan semua kebijakan hak akses ke standar pabrik?');
                  if (confirmReset) {
                    onChangePermissions(JSON.parse(JSON.stringify(defaultPermissions)));
                    onLogActivity('Reset Otorisasi', 'Mengembalikan seluruh matriks konfigurasi hak akses user ke default');
                    alert('Hak akses berhasil di-reset!');
                  }
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-xl text-[10px] cursor-pointer"
              >
                Reset Default
              </button>
            </div>

            {/* Role dropdown lists selection */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-150 w-full sm:w-fit animate-fade-in">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">Pilih Peran Jabatan (Role):</span>
              <select
                id="select-matrix-role"
                value={selectedMatrixRole}
                onChange={(e) => setSelectedMatrixRole(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-250 rounded-xl text-xs font-black text-indigo-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer"
              >
                {permissions.map((p) => (
                  <option key={p.role} value={p.role}>
                    {p.role} &mdash; ({p.description || p.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Matrix CRUD table tree representation */}
            <div className="overflow-x-auto text-[11px] font-sans">
              <table className="w-full text-left table-auto border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-400 tracking-wider">
                    <th className="px-4 py-3 border border-slate-205">SISTEM MENU, SUB MENU & TREE SIDEBAR</th>
                    <th className="px-3 py-3 border border-slate-205 text-center text-[10px] w-24">C (CREATE)</th>
                    <th className="px-3 py-3 border border-slate-205 text-center text-[10px] w-24">R (READ/VIEW)</th>
                    <th className="px-3 py-3 border border-slate-205 text-center text-[10px] w-24">U (UPDATE)</th>
                    <th className="px-3 py-3 border border-slate-205 text-center text-[10px] w-24">D (DELETE)</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const rIdx = permissions.findIndex(p => p.role === selectedMatrixRole);
                    if (rIdx === -1) return null;
                    const p = permissions[rIdx];

                    return rows.map((row) => {
                      const isCheckedC = p[row.field + '_C'] !== undefined ? !!p[row.field + '_C'] : !!p[row.field];
                      const isCheckedR = !!p[row.field];
                      const isCheckedU = p[row.field + '_U'] !== undefined ? !!p[row.field + '_U'] : !!p[row.field];
                      const isCheckedD = p[row.field + '_D'] !== undefined ? !!p[row.field + '_D'] : !!p[row.field];

                      return (
                        <tr key={row.field} className={`hover:bg-slate-50/50 transition-colors ${row.isSub ? 'bg-slate-50/30' : 'bg-white'}`}>
                          <td className={`px-4 py-2.5 border border-slate-150 text-slate-800 ${row.isSub ? 'pl-8 text-slate-500 italic font-medium' : 'text-xs font-bold'}`}>
                            <span className="flex items-center gap-1.5">
                              {row.isSub ? (
                                <>
                                  <span className="text-slate-300 font-mono text-xs select-none">├──</span>
                                  <span>{row.label.replace('↳ Submenu:', '').trim()}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-indigo-600 font-bold">📁</span>
                                  <span>{row.label}</span>
                                </>
                              )}
                            </span>
                          </td>
                          
                          {/* Create checkbox */}
                          <td className="px-2 py-2 border border-slate-150 text-center">
                            <input
                              type="checkbox"
                              checked={isCheckedC}
                              onChange={() => handleToggleCRUDPermission(rIdx, row.field, 'C')}
                              className="h-3.5 w-3.5 accent-indigo-650 rounded cursor-pointer"
                            />
                          </td>

                          {/* Read checkbox */}
                          <td className="px-2 py-2 border border-slate-150 text-center">
                            <input
                              type="checkbox"
                              checked={isCheckedR}
                              onChange={() => handleToggleCRUDPermission(rIdx, row.field, 'R')}
                              className="h-3.5 w-3.5 accent-indigo-650 rounded cursor-pointer"
                            />
                          </td>

                          {/* Update checkbox */}
                          <td className="px-2 py-2 border border-slate-150 text-center">
                            <input
                              type="checkbox"
                              checked={isCheckedU}
                              onChange={() => handleToggleCRUDPermission(rIdx, row.field, 'U')}
                              className="h-3.5 w-3.5 accent-indigo-650 rounded cursor-pointer"
                            />
                          </td>

                          {/* Delete checkbox */}
                          <td className="px-2 py-2 border border-slate-150 text-center">
                            <input
                              type="checkbox"
                              checked={isCheckedD}
                              onChange={() => handleToggleCRUDPermission(rIdx, row.field, 'D')}
                              className="h-3.5 w-3.5 accent-indigo-650 rounded cursor-pointer"
                            />
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50/60 p-4 border rounded-2xl leading-relaxed text-[11px] text-slate-500 max-w-2xl">
              <span className="font-extrabold text-slate-655 uppercase tracking-widest text-[9.5px] block mb-1">💡 Informasi Singkat Level Hak Otorisasi (CRUD):</span>
              <p>Mendefinisikan hak akses operasional rekam medis: <strong>C</strong> (Create / Menambahkan data baru), <strong>R</strong> (Read / Menampilkan list data atau mengakses sub-menu), <strong>U</strong> (Update / Mengoreksi & mengubah rekam data), dan <strong>D</strong> (Delete / Menghapus berkas/transaksi terkait).</p>
            </div>
          </div>
        </div>
      ) : (
        /* TAB SETUP ANTREAN, DOKTER & RUANGAN */
        <div id="settings-setup-antrean-ruangan" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form Tambah Dokter & Ruangan Baru */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-fit">
              <h3 className="font-bold text-slate-800 text-sm mb-1">Registrasi Dokter & Ruangan</h3>
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">Menambahkan kuota Ruang Praktek dan Dokter baru ke silsilah pelayanan faskes klinik</p>
              
              <form onSubmit={handleAddNewDoctor} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nama Lengkap Dokter</label>
                  <input
                    type="text"
                    placeholder="e.g. dr. Sarah Amanda, Sp.G"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Spesialisasi / Poli</label>
                  <input
                    type="text"
                    placeholder="e.g. Spesialis Gigi, Dokter Umum"
                    value={newDocSpec}
                    onChange={(e) => setNewDocSpec(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nomor SIP</label>
                  <input
                    type="text"
                    placeholder="e.g. SIP/2026/012-GIGI"
                    value={newDocSip}
                    onChange={(e) => setNewDocSip(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Nama Ruangan (Room)</label>
                  <input
                    type="text"
                    placeholder="e.g. Poli Gigi - Ruang 105"
                    value={newDocRoom}
                    onChange={(e) => setNewDocRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Memakai nama ruangan baru otomatis mendaftarkan penambahan ruangan resmi klinik</p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambahkan Dokter & Ruangan</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List Dokter & Ruangan Aktif */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Daftar Jajaran Dokter & Ruang Praktek Terintegrasi</h3>
                <p className="text-xs text-slate-500">Berikut tabel relasi fungsional Dokter dengan masing-masing Ruangan yang terdaftar aktif dalam silsilah antrean</p>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Dokter</p>
                  <p className="text-lg font-black text-slate-800 mt-1">{doctors.length} Orang</p>
                </div>
                <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
                  <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-wider">Total Ruangan</p>
                  <p className="text-lg font-black text-indigo-800 mt-1">{Array.from(new Set(doctors.map(d => d.room))).length} Unit</p>
                </div>
                <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 col-span-2 md:col-span-1">
                  <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">Sedang Praktik</p>
                  <p className="text-lg font-black text-emerald-850 mt-1">{doctors.filter(d => d.onDuty).length} Dokter</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto pr-1">
                {doctors.map((d) => (
                  <div key={d.id} className="py-3.5 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                    <div>
                      <h4 className="font-bold text-slate-800">{d.name}</h4>
                      <p className="text-slate-500 text-[10px] mt-1">{d.specialist} | {d.sip}</p>
                      <span className="inline-block mt-2 font-mono text-[9px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-750 rounded-lg border border-indigo-100/60 uppercase">
                        📍 {d.room}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = doctors.map(x => x.id === d.id ? { ...x, onDuty: !x.onDuty } : x);
                          onUpdateDoctors(updated);
                          onLogActivity('Modifikasi Otorisai Dokter', `Mengganti status kehadiran ${d.name} ke ${!d.onDuty ? 'PRAKTIK' : 'ABSEN'}`);
                        }}
                        className={`px-2.5 py-1.5 text-[10px] font-bold rounded-xl transition-colors cursor-pointer border ${
                          d.onDuty ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {d.onDuty ? 'Aktif Praktek' : 'Absen'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus dokter ${d.name} beserta alokasi ruangan ${d.room}?`)) {
                            const updated = doctors.filter(x => x.id !== d.id);
                            onUpdateDoctors(updated);
                            onLogActivity('Hapus Dokter', `Menghapus data dokter ${d.name} dari sistem`);
                          }
                        }}
                        className="p-1.5 px-2.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-605 hover:text-rose-700 rounded-xl font-bold text-[10px] cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

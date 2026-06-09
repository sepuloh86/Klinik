import React, { useState } from 'react';
import { Employee, RoleType } from '../types';
import { Plus, Search, Trash2, Edit2, ShieldAlert, BadgeCheck, Contact } from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
  currentRole: string;
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onLogActivity: (action: string, details: string) => void;
}

export default function EmployeeList({
  employees,
  currentRole,
  onAddEmployee,
  onUpdateEmployee,
  onLogActivity,
}: EmployeeListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('Semua');

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [role, setRole] = useState<RoleType>('Perawat');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Cuti' | 'Nonaktif'>('Aktif');
  const [password, setPassword] = useState('');

  const filteredEmployees = employees.filter((emp) => {
    const matchesRole = selectedRole === 'Semua' || emp.role === selectedRole;
    const matchesQuery =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesQuery;
  });

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setName('');
    setNip('NIP.19' + Math.floor(80 + Math.random() * 15) + Math.floor(10 + Math.random() * 80) + '.202612.2.' + Math.floor(100 + Math.random() * 900));
    setRole('Perawat');
    setEmail('');
    setPhone('');
    setStatus('Aktif');
    setPassword('pegawai123'); // Default password
    setShowModal(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setNip(emp.nip);
    setRole(emp.role);
    setEmail(emp.email);
    setPhone(emp.phone);
    setStatus(emp.status);
    setPassword(emp.password || '');
    setShowModal(true);
  };

  const handleSubmitEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !nip || !email || !phone) {
      alert('Mohon isi seluruh data kepegawaian secara lengkap.');
      return;
    }

    if (editingEmployee) {
      const updated: Employee = {
        ...editingEmployee,
        name,
        nip,
        role,
        email,
        phone,
        status,
        password: password.trim() || undefined,
      };
      onUpdateEmployee(updated);
      onLogActivity('Modifikasi Pegawai', `Yg bersangkutan merevisi profil pegawai ${name} (NIP: ${nip})`);
    } else {
      const payload: Omit<Employee, 'id'> = {
        name,
        nip,
        role,
        email,
        phone,
        status,
        password: password.trim() || undefined,
      };
      onAddEmployee(payload);
      onLogActivity('Kepegawaian Baru', `Menambahkan karyawan baru: ${name} berkategori ${role}`);
    }

    setShowModal(false);
  };

  const rolesFilter = ['Semua', 'Admin', 'Dokter', 'Perawat', 'Apoteker', 'Kasir', 'Pasien'];

  const isAllowedToManage = currentRole === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Contact className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg">Daftar Karyawan & Pegawai Medis</h1>
            <p className="text-xs text-slate-500">Mencatat personil resmi, NIP kepegawaian, verifikasi email faskes, serta status operasional staff</p>
          </div>
        </div>

        {isAllowedToManage && (
          <button
            id="btn-tambah-pegawai"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Karyawan Baru</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-4">
          <div className="flex space-x-1.5 overflow-x-auto max-w-full pb-1">
            {rolesFilter.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedRole === r
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Cari karyawan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none w-52 pl-9"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Employees Grid list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div key={emp.id} className="p-4 border rounded-2xl hover:shadow-xs transition-shadow flex flex-col justify-between min-h-[176px] bg-slate-50/15">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm truncate max-w-[170px]">{emp.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono tracking-wider block">{emp.nip}</span>
                  </div>
                  
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                    emp.role === 'Admin'
                      ? 'bg-purple-100 text-purple-800'
                      : emp.role === 'Dokter'
                      ? 'bg-red-100 text-red-800'
                      : emp.role === 'Perawat'
                      ? 'bg-blue-100 text-blue-800'
                      : emp.role === 'Apoteker'
                      ? 'bg-emerald-100 text-emerald-800'
                      : emp.role === 'Kasir'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-850'
                  }`}>
                    {emp.role}
                  </span>
                </div>

                <div className="space-y-0.5 text-[10px] text-slate-500 font-sans mt-3">
                  <p className="truncate block">✉ {emp.email}</p>
                  <p className="font-mono">📞 {emp.phone}</p>
                  {emp.password && emp.role !== 'Pasien' && (
                    <p className="text-slate-600 font-mono flex items-center gap-1 mt-1 text-[9px]">
                      <span className="text-[11px]">🔑</span>
                      <span>Password: <strong className="text-slate-800 font-bold">{emp.password}</strong></span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2 text-xs">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  emp.status === 'Aktif'
                    ? 'bg-emerald-100 text-emerald-800'
                    : emp.status === 'Cuti'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {emp.status}
                </span>

                {isAllowedToManage && (
                  <button
                    id={`btn-edit-karyawan-${emp.id}`}
                    onClick={() => handleOpenEditModal(emp)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Ubah Info</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredEmployees.length === 0 && (
            <p className="col-span-full py-16 text-center text-slate-400 italic text-xs">
              Karyawan dalam pencarian tidak ditemukan.
            </p>
          )}
        </div>
      </div>

      {/* Add / Edit Employee popup modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <h2 className="font-bold text-slate-800 text-lg mb-4">
              {editingEmployee ? 'Edit Detail Pegawai Medis' : 'Tambah Karyawan Baru'}
            </h2>

            <form onSubmit={handleSubmitEmployee} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  placeholder="Contoh: dr. Setiawan, Sp.A atau Suster Sarah Kartika"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Nomor Induk Pegawai (NIP)</label>
                <input
                  type="text"
                  placeholder="Format NIP resmi pemerintah"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Peran Jabatan (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Admin">Admin (Loket)</option>
                    <option value="Dokter">Dokter</option>
                    <option value="Perawat">Perawat Pemeriksa</option>
                    <option value="Apoteker">Apoteker Depo</option>
                    <option value="Kasir">Kasir Pembayaran</option>
                    <option value="Pasien">Pasien</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Status Keaktifan Kerja</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Aktif">Aktif Bekerja</option>
                    <option value="Cuti">Izin / Cuti</option>
                    <option value="Nonaktif">Mengundurkan Diri</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Email Karyawan</label>
                <input
                  type="email"
                  placeholder="karyawan@kliniksehat.co.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">No. Ponsel Pegawai</label>
                <input
                  type="text"
                  placeholder="08..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>

              {role !== 'Pasien' && (
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Kata Sandi Login Staf</label>
                  <input
                    type="text"
                    placeholder="Masukkan kata sandi untuk login portal..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-sky-50/50 border border-slate-200 rounded-xl font-bold font-mono text-indigo-900 focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Digunakan staf untuk login ke portal klinik ini.</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-150 rounded-xl font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Urungkan
                </button>
                <button
                  id="btn-simpan-pegawai"
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                >
                  Simpan Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

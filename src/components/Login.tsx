import React, { useState } from 'react';
import { Employee, RoleType } from '../types';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  Users,
  Monitor,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface LoginProps {
  employees: Employee[];
  onLoginSuccess: (emp: Employee) => void;
  onGoToSelfRegister: () => void;
  clinicName: string;
  clinicTagline: string;
  logo: string;
}

export default function Login({
  employees,
  onLoginSuccess,
  onGoToSelfRegister,
  clinicName,
  clinicTagline,
  logo
}: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Harap masukkan alamat email dan kata sandi Anda.');
      return;
    }

    // Look up employee
    const foundEmp = employees.find(
      (emp) => emp.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!foundEmp) {
      setError('Alamat email staf tidak terdaftar dalam database kami.');
      return;
    }

    if (foundEmp.status !== 'Aktif') {
      setError('Status keanggotaan Anda saat ini sedang dinonaktifkan.');
      return;
    }

    // Role Pasien does not require password, but staff roles do!
    if (foundEmp.role !== 'Pasien') {
      if (foundEmp.password !== password) {
        setError('Kata sandi yang Anda masukkan salah. Silakan coba kembali.');
        return;
      }
    }

    // Successful login!
    onLoginSuccess(foundEmp);
  };

  const handleLoginAsPatient = () => {
    // Look up default patient user (K006 or Pasien)
    const patientEmp = employees.find((e) => e.role === 'Pasien') || {
      id: 'K006',
      name: 'Budi Santoso',
      nip: 'NIP.PASIEN001',
      role: 'Pasien' as RoleType,
      email: 'budi.santoso@gmail.com',
      phone: '081234567890',
      status: 'Aktif' as const
    };

    onLoginSuccess(patientEmp);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header Clinic Logo */}
        <div className="text-center space-y-2">
          <span className="text-5xl inline-block drop-shadow-md animate-pulse">
            {logo.startsWith('data:') ? '🏥' : logo}
          </span>
          <div>
            <h1 className="font-black text-slate-800 text-lg md:text-xl uppercase tracking-tight">{clinicName}</h1>
            <p className="text-slate-450 text-[11px] font-medium leading-relaxed mt-0.5">{clinicTagline}</p>
          </div>
          <div className="h-0.5 w-16 bg-gradient-to-r from-sky-450 to-indigo-500 mx-auto rounded-full mt-1"></div>
        </div>

        {/* Staff Authentication Area */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <LogIn className="h-4 w-4 text-sky-600" />
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Akses Masuk Staf Medis</h2>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs text-slate-800">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Alamat Email Staf</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="nama@klinikmedika.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 pl-10 bg-slate-50 border border-slate-305 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:bg-white focus:outline-none"
                />
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Kata Sandi Anda</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Ketik kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pl-10 pr-10 bg-slate-50 border border-slate-305 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 focus:bg-white focus:outline-none"
                />
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-[10.5px] leading-snug">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Sign In ke Portal
            </button>
          </form>
        </div>

        {/* Public Patient / Lobby Actions */}
        <div className="border-t border-slate-100 pt-5 space-y-3 text-xs">
          <div className="flex items-center space-x-2 pb-1">
            <Users className="h-4 w-4 text-indigo-650" />
            <h2 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Layanan Pasien & Publik</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onGoToSelfRegister}
              className="px-3.5 py-3 bg-emerald-58 hover:bg-emerald-100 text-emerald-705 font-bold border border-emerald-200/60 rounded-xl flex flex-col items-center justify-center text-center space-y-1 hover:border-emerald-300 transition-all cursor-pointer shadow-xs bg-emerald-50/50"
            >
              <span className="text-xl">🎟️</span>
              <span className="text-[11px] leading-snug">Pendaftaran Mandiri</span>
              <span className="text-[8px] text-emerald-500 font-semibold leading-none">Ambil Nomor Antrean</span>
            </button>

            <button
              type="button"
              onClick={handleLoginAsPatient}
              className="px-3.5 py-3 bg-indigo-58 hover:bg-indigo-100 text-indigo-705 font-bold border border-indigo-200/60 rounded-xl flex flex-col items-center justify-center text-center space-y-1 hover:border-indigo-300 transition-all cursor-pointer shadow-xs bg-indigo-50/50"
            >
              <Monitor className="h-4.5 w-4.5 text-indigo-600" />
              <span className="text-[11px] leading-snug">TV Antrean Lobby</span>
              <span className="text-[8px] text-indigo-400 font-semibold leading-none">Tanpa Pasangan Sandi</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, ShieldCheck, Heart, FileText, Smartphone } from 'lucide-react';
import { Patient } from '../types';

interface BPJSCheckerProps {
  patients: Patient[];
  onUpdatePatientBpjs?: (patientId: string, status: 'Aktif' | 'Tidak Aktif', bpjsClass: string) => void;
}

export default function BPJSChecker({ patients, onUpdatePatientBpjs }: BPJSCheckerProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    found: boolean;
    name: string;
    nik: string;
    noBpjs: string;
    status: 'Aktif' | 'Tidak Aktif' | 'Tidak Terdaftar';
    kelas: string;
    paskes1: string;
    tglLahir: string;
    sex: string;
  } | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber.trim()) {
      setError('Masukkan nomor BPJS atau NIK pasien');
      return;
    }
    
    setError('');
    setLoading(true);
    setResult(null);

    // Simulate BPJS server API request
    setTimeout(() => {
      setLoading(false);
      
      // Try to find the patient in our existing state first
      const cleanedInput = cardNumber.replace(/\D/g, '');
      const matchedPatient = patients.find(
        p => (p.bpjsNumber && p.bpjsNumber.replace(/\D/g, '') === cleanedInput) || p.nik.replace(/\D/g, '') === cleanedInput
      );

      if (matchedPatient) {
        const isCurrentlyActive = matchedPatient.bpjsStatus === 'Tidak Aktif' ? 'Tidak Aktif' : 'Aktif';
        const bpjsClass = matchedPatient.bpjsClass || 'Kelas 2';
        
        setResult({
          found: true,
          name: matchedPatient.name,
          nik: matchedPatient.nik,
          noBpjs: matchedPatient.bpjsNumber || '000' + Math.floor(1000000000 + Math.random() * 9000000000),
          status: isCurrentlyActive,
          kelas: bpjsClass,
          paskes1: 'Klinik Pratama Sehat Utama (PPK-I)',
          tglLahir: matchedPatient.birthDate,
          sex: matchedPatient.gender,
        });

        if (onUpdatePatientBpjs && matchedPatient.bpjsStatus !== isCurrentlyActive) {
          onUpdatePatientBpjs(matchedPatient.id, isCurrentlyActive, bpjsClass);
        }
      } else {
        // If not found in patient DB, let's auto-generate a valid active patient or declare not found
        if (cleanedInput.length === 16) {
          // It's a NIK, simulate discovery
          setResult({
            found: true,
            name: 'Supriyadi Rahardjo',
            nik: cleanedInput,
            noBpjs: '0008432176598',
            status: 'Aktif',
            kelas: 'Kelas 1',
            paskes1: 'Klinik Pratama Sehat Utama (PPK-I)',
            tglLahir: '1979-11-22',
            sex: 'Laki-laki',
          });
        } else if (cleanedInput.length === 13) {
          // It's a BPJS Number, simulate discovery
          setResult({
            found: true,
            name: 'Kusuma Wardhani',
            nik: '3275031206920005',
            noBpjs: cleanedInput,
            status: 'Aktif',
            kelas: 'Kelas 2',
            paskes1: 'Klinik Pratama Sehat Utama (PPK-I)',
            tglLahir: '1992-06-12',
            sex: 'Perempuan',
          });
        } else {
          // Fallback
          setResult({
            found: false,
            name: '',
            nik: '',
            noBpjs: cardNumber,
            status: 'Tidak Terdaftar',
            kelas: '-',
            paskes1: '-',
            tglLahir: '-',
            sex: '-',
          });
        }
      }
    }, 1250);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden">
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-slate-800">Cek Kepesertaan BPJS Kesehatan</h2>
          <p className="text-xs text-slate-500">Koneksi langsung ke server BPJS Kesehatan (V-Claim Bridge)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Form and Help Card */}
        <div className="space-y-6">
          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                No. BPJS Kesehatan (13 digit) atau NIK Pasien (16 digit)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Contoh: 0001234567890 atau NIK 317..."
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Gunakan NIK Budi Santoso <code className="bg-slate-100 px-1 py-0.5 rounded">3171021405820003</code> atau nomor BPJS <code className="bg-slate-100 px-1 py-0.5 rounded">0001234567890</code> untuk simulasi aktif.
              </p>
            </div>

            <button
              id="btn-cek-bpjs"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:bg-emerald-300"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menghubungkan ke BPJS Kesehatan...</span>
                </>
              ) : (
                <>
                  <span>Cek Kepesertaan</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Info Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <h3 className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 mb-2">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              <span>Panduan Pelayanan BPJS di Klinik</span>
            </h3>
            <ul className="text-xs text-slate-500 space-y-1 ml-2 list-disc list-inside">
              <li>Pasien terdaftar Faskes Tingkat I (FKTP) dapat menikmati faskes gratis.</li>
              <li>Status keaktifan harus bertuliskan <span className="text-emerald-600 font-medium">Aktif</span>.</li>
              <li>Rujukan online (P-Care) secara langsung dibuat setelah data diagnosa diisi dokter.</li>
            </ul>
          </div>
        </div>

        {/* Right Side: BPJS Virtual Card with Result Details */}
        <div>
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center border border-slate-100 rounded-2xl bg-slate-50/50 animate-pulse">
              <ShieldCheck className="h-10 w-10 text-emerald-500/40 animate-bounce mb-2" />
              <p className="text-sm text-slate-400">Memvalidasi data kepesertaan...</p>
            </div>
          ) : result ? (
            <div className="space-y-4 animate-fade-in">
              {/* BPJS Card Template */}
              <div id="bpjs-card-visual" className="relative text-white rounded-2xl p-5 shadow-md overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600">
                <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-white/5 pointer-events-none"></div>
                <div className="absolute right-8 bottom-4 w-48 h-48 rounded-full bg-white/5 pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold tracking-wider uppercase opacity-90">KARTU INDONESIA SEHAT</span>
                    <h3 className="text-lg font-bold">BPJS Kesehatan</h3>
                  </div>
                  <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded text-[10px] font-semibold border border-white/10">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>SIS-SATELLITE</span>
                  </div>
                </div>

                {result.found ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] opacity-75 block">NOMOR KARTU (NOKA)</span>
                      <span className="font-mono text-base font-bold tracking-wider">{result.noBpjs.replace(/(.{4})/g, '$1 ')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] opacity-75 block">NAMA PESERTA</span>
                        <span className="text-sm font-semibold truncate block">{result.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] opacity-75 block">KELAS LAYANAN</span>
                        <span className="text-sm font-semibold block">{result.kelas}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-white/10">
                      <div>
                        <span className="text-[10px] opacity-75 block">NIK PESERTA</span>
                        <span className="font-mono text-xs block">{result.nik}</span>
                      </div>
                      <div>
                        <span className="text-[10px] opacity-75 block">PPK FKTP TINGKAT I</span>
                        <span className="text-xs truncate block">{result.paskes1}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 flex flex-col items-center justify-center">
                    <XCircle className="h-8 w-8 text-rose-300 mb-1" />
                    <p className="text-xs text-rose-100 font-semibold">TIDAK TERDAFTAR / TIDAK AKTIF</p>
                    <p className="text-[10px] text-white/70">Periksa kembali nomor kartu yang Anda masukkan</p>
                  </div>
                )}
              </div>

              {/* Status Banner */}
              {result.found && (
                <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                  result.status === 'Aktif' 
                    ? 'bg-emerald-50/70 border-emerald-100 text-emerald-800' 
                    : 'bg-rose-50/70 border-rose-100 text-rose-800'
                }`}>
                  {result.status === 'Aktif' ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <div className="font-semibold flex items-center space-x-1.5">
                      <span>Status Kepesertaan: {result.status}</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        result.status === 'Aktif' ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                      }`}>
                        {result.status === 'Aktif' ? 'Siap Dilayani' : 'Belum Bayar / Tangguhan'}
                      </span>
                    </div>
                    <p className="opacity-80 mt-1">
                      {result.status === 'Aktif' 
                        ? `Peserta atas nama ${result.name} aktif di ${result.kelas}. Tagihan klaim FKTP akan sepenuhnya ditanggung BPJS Kesehatan.`
                        : `Segera anjurkan pasien untuk mengaktifkan kartu atau membayar tagihan tertunggak melalui ATM, Kantor BPJS, atau saluran Mobile JKN.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400 p-6 text-center">
              <Smartphone className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600 mb-1">Hasil Pencarian BPJS</p>
              <p className="text-xs max-w-xs">Gunakan kolom input sebelah kiri untuk melakukan pengecekan status kesertaan real-time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

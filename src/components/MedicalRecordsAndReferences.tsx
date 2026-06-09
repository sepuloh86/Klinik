import React, { useState } from 'react';
import { MedicalRecord, ReferralLetter, Patient, Doctor, Medicine } from '../types';
import { FileText, ClipboardList, Plus, Search, MapPin, Printer, ArrowUpRight, ArrowLeft, Heart, Check, Building } from 'lucide-react';

interface MedicalRecordsAndReferencesProps {
  medicalRecords: MedicalRecord[];
  referrals: ReferralLetter[];
  patients: Patient[];
  doctors: Doctor[];
  medicines: Medicine[];
  currentRole: string;
  onAddMedicalRecord: (record: Omit<MedicalRecord, 'id'>, generateReferral?: Omit<ReferralLetter, 'id' | 'medicalRecordId' | 'patientId' | 'patientName' | 'patientNik' | 'patientBpjsNumber' | 'gender' | 'birthDate' | 'dateIssued' | 'doctorSignName' | 'doctorSip'>) => void;
  onLogActivity: (action: string, details: string) => void;
}

export default function MedicalRecordsAndReferences({
  medicalRecords,
  referrals,
  patients,
  doctors,
  medicines,
  currentRole,
  onAddMedicalRecord,
  onLogActivity,
}: MedicalRecordsAndReferencesProps) {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReferral, setSelectedReferral] = useState<ReferralLetter | null>(null);

  // Form states for new record
  const [doctorId, setDoctorId] = useState('');
  const [complaints, setComplaints] = useState('');
  const [bp, setBp] = useState('120/80');
  const [temp, setTemp] = useState(36.5);
  const [pulse, setPulse] = useState(80);
  const [weight, setWeight] = useState(60);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [prescribedMeds, setPrescribedMeds] = useState<Array<{ id: string; qty: number; usage: string }>>([]);
  
  // State for drug addition during prescription form
  const [currMedId, setCurrMedId] = useState('');
  const [currMedQty, setCurrMedQty] = useState(10);
  const [currMedUsage, setCurrMedUsage] = useState('3x Sehari 1 tablet setelah makan');

  // Referral states inside doctor form
  const [needReferral, setNeedReferral] = useState(false);
  const [destHospital, setDestHospital] = useState('');
  const [targetSpecialist, setTargetSpecialist] = useState('');
  const [referralNotes, setReferralNotes] = useState('');

  // Selected patient data
  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const selectedPatientRecords = medicalRecords.filter((mr) => mr.patientId === selectedPatientId);

  const handleAddMedToPrescription = () => {
    if (!currMedId) return;
    const medication = medicines.find(m => m.id === currMedId);
    if (!medication) return;

    if (medication.stock < currMedQty) {
      alert(`Stok obat ${medication.name} tidak mencukupi (Tersedia: ${medication.stock} ${medication.unit})`);
      return;
    }

    // Add or merge medicine prescription
    const exists = prescribedMeds.findIndex(m => m.id === currMedId);
    if (exists > -1) {
      const updated = [...prescribedMeds];
      updated[exists].qty += currMedQty;
      setPrescribedMeds(updated);
    } else {
      setPrescribedMeds([...prescribedMeds, { id: currMedId, qty: currMedQty, usage: currMedUsage }]);
    }

    setCurrMedId('');
    setCurrMedQty(10);
  };

  const handleRemovePrescribedMed = (index: number) => {
    const updated = [...prescribedMeds];
    updated.splice(index, 1);
    setPrescribedMeds(updated);
  };

  const handleSubmitRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !doctorId || !complaints || !diagnosis || !treatment) {
      alert('Mohon lengkapi data pemeriksaan utama dokter.');
      return;
    }

    // Map prescribed meds structure
    const structuredMeds = prescribedMeds.map((pm) => {
      const med = medicines.find(m => m.id === pm.id)!;
      return {
        id: pm.id,
        name: med.name,
        qty: pm.qty,
        usage: pm.usage
      };
    });

    const docSelected = doctors.find(d => d.id === doctorId)!;

    const newRecord: Omit<MedicalRecord, 'id'> = {
      patientId: selectedPatientId,
      patientName: selectedPatient?.name || '',
      doctorId: doctorId,
      doctorName: docSelected.name,
      date: new Date().toISOString().split('T')[0],
      complaints,
      physicalExam: {
        bloodPressure: bp,
        temperature: Number(temp),
        pulseRate: Number(pulse),
        weight: Number(weight),
      },
      diagnosis,
      treatment,
      prescribedMeds: structuredMeds,
    };

    let referralPayload = undefined;
    if (needReferral) {
      referralPayload = {
        destinationHospital: destHospital,
        targetSpecialist: targetSpecialist,
        notes: referralNotes,
      };
    }

    onAddMedicalRecord(newRecord, referralPayload);
    onLogActivity('Pencatatan Rekam Medis', `Menginput rekam medis baru & tindakan untuk pasien ${selectedPatient?.name}`);

    // Reset Form
    setIsCreating(false);
    setComplaints('');
    setDiagnosis('');
    setTreatment('');
    setPrescribedMeds([]);
    setNeedReferral(false);
    setDestHospital('');
    setTargetSpecialist('');
    setReferralNotes('');
  };

  const isDoctorOrAdmin = ['Admin', 'Dokter'].includes(currentRole);

  const filteredReferrals = referrals.filter(ref => 
    ref.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ref.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ref.destinationHospital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="font-bold text-slate-800 text-lg">Rekam Medis & Rujukan Pasien</h1>
          <p className="text-xs text-slate-500">Pencatatan anamnesa, resep obat apotek, dan rujukan ke RSUD/RS Pusat</p>
        </div>
        <div className="flex space-x-2">
          {isDoctorOrAdmin && (
            <button
              onClick={() => {
                if (!selectedPatientId) {
                  alert('Pilih pasien terlebih dahulu di bilik rekam medis sebelum menulis rekam medis baru.');
                  return;
                }
                setIsCreating(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Input Rekam Medis Baru</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Patient selector and historic files */}
        <div className="xl:col-span-2 space-y-6">
          {/* Patient Selector */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-4">Pencarian Rekam Medis Pasien</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Pilih Pasien Klinik</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    setIsCreating(false);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Pilih salah satu pasien --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type} - NIK: {p.nik})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPatient && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">TANGGAL LAHIR</span>
                    <span className="font-semibold text-slate-700">{selectedPatient.birthDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TIPE PASIEN</span>
                    <span className="font-bold text-emerald-700">{selectedPatient.type}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">ALAMAT</span>
                    <span className="text-slate-600 truncate block">{selectedPatient.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Create New Record */}
          {isCreating && selectedPatient ? (
            <div id="new-record-form-card" className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Buat Catatan Rekam Medis</h3>
                  <p className="text-xs text-slate-500">Pasien: <strong className="text-slate-700">{selectedPatient.name}</strong></p>
                </div>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-1 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
              </div>

              <form onSubmit={handleSubmitRecord} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dokter Pemeriksa</label>
                    <select
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    >
                      <option value="">-- Pilih Dokter --</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.specialist})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">BP (mmHg)</label>
                      <input type="text" value={bp} onChange={e => setBp(e.target.value)} className="w-full p-2 text-xs bg-slate-50 border rounded-lg text-center" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Temp (°C)</label>
                      <input type="number" step="0.1" value={temp} onChange={e => setTemp(Number(e.target.value))} className="w-full p-2 text-xs bg-slate-50 border rounded-lg text-center" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Pulse (x/m)</label>
                      <input type="number" value={pulse} onChange={e => setPulse(Number(e.target.value))} className="w-full p-2 text-xs bg-slate-50 border rounded-lg text-center" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Weight (kg)</label>
                      <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full p-2 text-xs bg-slate-50 border rounded-lg text-center" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keluhan Utama (Anamnesa)</label>
                  <textarea
                    placeholder="Contoh: Panas dingin naik turun sejak 4 hari, batuk berdahak..."
                    value={complaints}
                    onChange={e => setComplaints(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl h-24"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Diagnosa Klinis</label>
                    <input
                      type="text"
                      placeholder="Contoh: Pharyngitis Acute, Dyspepsia..."
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tindakan / Pelayanan Medis</label>
                    <input
                      type="text"
                      placeholder="Contoh: Injeksi antipiretik, fisioterapi, konseling diet..."
                      value={treatment}
                      onChange={e => setTreatment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Medications Prescription Block */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                  <h4 className="font-bold text-slate-700 text-xs">Pemberian Resep Obat Apotek</h4>
                  
                  {/* Select Drugs Adder inline */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-end">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Pilih Obat</label>
                      <select
                        value={currMedId}
                        onChange={e => setCurrMedId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="">-- Pilih Obat --</option>
                        {medicines.map(m => (
                          <option key={m.id} value={m.id} disabled={m.stock <= 0}>
                            {m.name} ({m.stock} {m.unit} tersisa)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-1">Jumlah (Qty)</label>
                      <input
                        type="number"
                        value={currMedQty}
                        onChange={e => setCurrMedQty(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <div className="grow">
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Dosis & Aturan Pakai</label>
                        <input
                          type="text"
                          value={currMedUsage}
                          onChange={e => setCurrMedUsage(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddMedToPrescription}
                        className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* List of drugs included in prescription */}
                  {prescribedMeds.length > 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-3 text-xs divide-y">
                      {prescribedMeds.map((pm, idx) => {
                        const originalObat = medicines.find(m => m.id === pm.id);
                        return (
                          <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center">
                            <div>
                              <span className="font-bold text-slate-700">{originalObat?.name}</span>
                              <span className="text-slate-400 block text-[10px]">Dosis: {pm.usage}</span>
                            </div>
                            <div className="flex items-center space-x-4 font-mono font-bold text-slate-600">
                              <span>{pm.qty} {originalObat?.unit}</span>
                              <button
                                type="button"
                                onClick={() => handleRemovePrescribedMed(idx)}
                                className="text-rose-500 hover:text-rose-700 font-sans text-xs font-semibold"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-[11px] italic text-center py-2 bg-white rounded-xl border border-dashed border-slate-200">
                      Belum ada obat dalam resep ini.
                    </p>
                  )}
                </div>

                {/* Referral Switch Block */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-emerald-50/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-emerald-800 text-xs">Minta Surat Rujukan Dokter BPJS</h4>
                      <p className="text-[10px] text-slate-500">Buat rujukan elektronik ke RSUD tipe B/A lanjutan</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needReferral}
                        onChange={(e) => setNeedReferral(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {needReferral && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2.5 border-t border-emerald-100 animate-fade-in">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rumah Sakit Tujuan Rujukan</label>
                        <input
                          type="text"
                          placeholder="Contoh: RSUD Pasar Minggu, RS Jantung Harapan Kita..."
                          value={destHospital}
                          onChange={e => setDestHospital(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                          required={needReferral}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Spesialis Penerima Rujukan</label>
                        <input
                          type="text"
                          placeholder="Contoh: Spesialis Kardiologi, Spesialis Anak..."
                          value={targetSpecialist}
                          onChange={e => setTargetSpecialist(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                          required={needReferral}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catatan Dokter & Rekomendasi Terapi</label>
                        <textarea
                          placeholder="Mohon evaluasi CT Scan lanjutan, terapi spesifik..."
                          value={referralNotes}
                          onChange={e => setReferralNotes(e.target.value)}
                          className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl h-16"
                          required={needReferral}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Batalkan
                  </button>
                  <button
                    id="submit-rekam-medis"
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                  >
                    Simpan Rekam Medis & Cetak
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Medical Records Files Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-1">Riwayat Rekam Medis Pasien</h3>
            <p className="text-xs text-slate-500 mb-6">Berkas historis anamnesa medis yang disaring berdasarkan pilihan pasien</p>

            {!selectedPatientId ? (
              <div className="text-center py-16 text-slate-400">
                <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-2 animate-bounce" />
                <p className="text-sm font-semibold text-slate-500">Pilih Pasien Terlebih Dahulu</p>
                <p className="text-xs max-w-xs mx-auto mt-1">Gunakan drop-down pencarian di bagian atas untuk menyaring berkas rekam medis yang bersangkutan.</p>
              </div>
            ) : selectedPatientRecords.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-12">Belum ada riwayat rekam medis terdaftar untuk pasien ini.</p>
            ) : (
              <div className="relative border-l-2 border-emerald-100 ml-4 pl-6 space-y-6">
                {selectedPatientRecords.map((mr) => {
                  const correlatedReferral = referrals.find(ref => ref.medicalRecordId === mr.id);
                  return (
                    <div key={mr.id} className="relative group">
                      {/* Anchor Timeline bullet */}
                      <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-4 border-white bg-emerald-500 group-hover:bg-emerald-600 transition-colors shadow-xs"></span>
                      
                      <div className="bg-slate-50/55 hover:bg-slate-50 border border-slate-200/60 rounded-2xl p-5 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                              {mr.id}
                            </span>
                            <span className="text-xs text-slate-400 ml-2 font-mono">{mr.date}</span>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-700 block">{mr.doctorName}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-100 text-xs mb-4">
                          <div>
                            <span className="text-slate-400 text-[10px] block">TENSI DARAH</span>
                            <span className="font-mono text-slate-700">{mr.physicalExam.bloodPressure} mmHg</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">SUHU BADAN</span>
                            <span className="font-mono text-slate-700">{mr.physicalExam.temperature} °C</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">DENYUT NADI</span>
                            <span className="font-mono text-slate-700">{mr.physicalExam.pulseRate} x/mnt</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">BERAT BADAN</span>
                            <span className="font-mono text-slate-700">{mr.physicalExam.weight} Kg</span>
                          </div>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          <div>
                            <strong className="text-slate-700 block font-semibold mb-0.5">Keluhan Utama:</strong>
                            <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">{mr.complaints}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <strong className="text-slate-700 block font-semibold mb-0.5">Diagnosa Masuk:</strong>
                              <p className="text-slate-800 font-medium">{mr.diagnosis}</p>
                            </div>
                            <div>
                              <strong className="text-slate-700 block font-semibold mb-0.5">Tindakan Klinis:</strong>
                              <p className="text-slate-800 font-medium">{mr.treatment}</p>
                            </div>
                          </div>

                          {mr.prescribedMeds.length > 0 && (
                            <div className="pt-2 border-t border-slate-100">
                              <strong className="text-slate-700 block font-semibold mb-1">Preskripsi Resep:</strong>
                              <div className="flex flex-wrap gap-1.5">
                                {mr.prescribedMeds.map((med, idx) => (
                                  <span key={idx} className="bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold px-2 py-1 rounded" title={med.usage}>
                                    💊 {med.name} (x{med.qty})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {correlatedReferral && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl flex justify-between items-center text-xs">
                              <div>
                                <span className="font-semibold text-amber-900 block">Surat Rujukan Aktif</span>
                                <span className="text-amber-700 text-[11px]">Tujuan RS: {correlatedReferral.destinationHospital} ({correlatedReferral.targetSpecialist})</span>
                              </div>
                              <button
                                onClick={() => setSelectedReferral(correlatedReferral)}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all"
                              >
                                <Printer className="h-3 w-3" />
                                <span>Cetak Rujukan</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Referrals letter index query */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-1">Indeks Rujukan Pasien</h3>
            <p className="text-xs text-slate-500 mb-4">Berkas rujukan resmi yang dikeluarkan dokter untuk rumah sakit rujukan</p>
            
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Cari rujukan atau nama pasien..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pl-9 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="space-y-3">
              {filteredReferrals.map((r) => (
                <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      {r.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{r.dateIssued}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs truncate">{r.patientName}</h4>
                  <p className="text-[10px] text-slate-600 mb-3 truncate">Tujuan: {r.destinationHospital}</p>
                  
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-medium">Diagnose: {r.diagnosis.slice(0, 20)}...</span>
                    <button
                      onClick={() => setSelectedReferral(r)}
                      className="text-emerald-600 hover:text-emerald-800 font-bold flex items-center space-x-1"
                    >
                      <span>Lihat Surat</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredReferrals.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-6">Katalog rujukan kosong</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official Legal Referral Letter Print Modal popup */}
      {selectedReferral && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Exit */}
            <button
              onClick={() => setSelectedReferral(null)}
              className="absolute right-4 top-4 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
            >
              ✕
            </button>

            {/* Document Letter head */}
            <div id="referral-paper-print" className="border-4 double border-double border-slate-800 p-6 space-y-6 text-slate-800 select-all font-serif">
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl bg-emerald-700 p-1.5 text-white rounded">🏥</span>
                  <div className="font-sans">
                    <h2 className="font-bold text-sm tracking-tight">KLINIK PRATAMA SEHAT UTAMA</h2>
                    <p className="text-[9px] text-slate-600">Jl. Boulevard Raya Barat No. 128, Kelapa Gading, Jakarta Utara</p>
                    <p className="text-[9px] text-slate-600">Telp: 021-45871234 | Email: rujukan@sehatutama.id</p>
                  </div>
                </div>
                <div className="text-right font-sans">
                  <span className="inline-block px-2 py-1 border border-emerald-600 text-emerald-800 text-[10px] rounded font-bold uppercase tracking-wider">
                    BPJS KESEHATAN INTEGRASI
                  </span>
                  <p className="text-[10px] font-mono mt-1">Rujukan No: {selectedReferral.id}</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center font-sans">
                <h3 className="text-base font-extrabold underline tracking-wide uppercase">SURAT RUJUKAN FKTP</h3>
                <p className="text-xs">Fasilitas Kesehatan Tingkat Pertama Ke Faskes Rujukan Tingkat Lanjut (FKTRL)</p>
              </div>

              {/* Letter content */}
              <div className="space-y-3.5 text-xs">
                <p>Kepada Yth. Sejawat Dokter,</p>
                <p className="font-bold">Spesialis {selectedReferral.targetSpecialist}</p>
                <p>Di <strong className="underline">{selectedReferral.destinationHospital}</strong></p>

                <p className="leading-relaxed">
                  Mohon pemeriksaan dan penanganan spesifik lanjutan terhadap pasien kami dengan data kepesertaan sebagai berikut:
                </p>

                {/* Patient data block */}
                <table className="w-full text-slate-800 table-fixed leading-relaxed font-sans border-t border-b border-dashed border-slate-300 py-2">
                  <tbody>
                    <tr>
                      <td className="w-1/3 py-1 font-semibold text-[11px]">Nama Pasien</td>
                      <td className="py-1 text-[11px]">: {selectedReferral.patientName}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-[11px]">No. Kartu BPJS (KIS)</td>
                      <td className="py-1 text-[11px] font-mono">: {selectedReferral.patientBpjsNumber || 'Kwitansi Umum (Mandiri)'}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-[11px]">NIK (No. KTP)</td>
                      <td className="py-1 text-[11px] font-mono">: {selectedReferral.patientNik}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-[11px]">Jenis Kelamin / Tanggal Lahir</td>
                      <td className="py-1 text-[11px]">: {selectedReferral.gender} / {selectedReferral.birthDate}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-[11px]">Diagnosa Awal</td>
                      <td className="py-1 text-[11px] font-semibold text-emerald-950">: {selectedReferral.diagnosis}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Notes and physical exam details */}
                <div className="space-y-1.5 font-sans text-[11px]">
                  <strong>Catatan Klinis Terapi Sementara:</strong>
                  <p className="bg-slate-50 border rounded p-2.5 border-slate-200 block italic leading-relaxed">
                    {selectedReferral.notes}
                  </p>
                </div>

                <p className="leading-relaxed">
                  Demikian surat rujukan ini dibuat untuk dipergunakan sebagaimana mestinya. Atas kerja samanya diucapkan terima kasih.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex justify-between items-end font-sans text-xs">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block mb-12">Disetujui Petugas BPJS Medika</span>
                  <div className="h-0.5 w-[140px] bg-slate-300 mx-auto"></div>
                  <span className="text-[9px] text-slate-500 mt-1 block">Rujukan Elektronik Sistem</span>
                </div>
                
                <div className="text-center">
                  <span className="text-[11px] block text-slate-600">Jakarta, {selectedReferral.dateIssued}</span>
                  <span className="text-[10px] text-slate-400 block mb-12">Dokter Penanggung Jawab Pelayanan</span>
                  <strong className="underline text-slate-900 block">{selectedReferral.doctorSignName}</strong>
                  <span className="text-[9px] text-slate-500 text-center font-mono">{selectedReferral.doctorSip}</span>
                </div>
              </div>
            </div>

            {/* Print trigger button controls */}
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak / Download PDF</span>
              </button>
              <button
                onClick={() => setSelectedReferral(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
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

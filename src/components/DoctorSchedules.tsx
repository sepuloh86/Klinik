import React, { useState } from 'react';
import { Doctor, Queue, Patient, Medicine, MedicalRecord, ReferralLetter } from '../types';
import { Clock, Calendar, Check, X, Edit2, Play, Power, Star, Users, User, ArrowRight, Search, Activity, ShieldAlert, BadgeCheck, Printer, Plus } from 'lucide-react';

interface DoctorSchedulesProps {
  doctors: Doctor[];
  queues: Queue[];
  currentRole: string;
  onUpdateDoctorSchedule: (doctorId: string, schedule: Doctor['schedule'], onDuty: boolean) => void;
  onLogActivity: (action: string, details: string) => void;
  patients?: Patient[];
  medicines?: Medicine[];
  medicalRecords?: MedicalRecord[];
  onAddMedicalRecord?: (record: Omit<MedicalRecord, 'id'>, generateReferral?: Omit<ReferralLetter, 'id' | 'medicalRecordId' | 'patientId' | 'patientName' | 'patientNik' | 'patientBpjsNumber' | 'gender' | 'birthDate' | 'dateIssued' | 'doctorSignName' | 'doctorSip'>) => void;
  onUpdateQueueStatus?: (id: string, status: Queue['status']) => void;
}

export default function DoctorSchedules({
  doctors,
  queues = [],
  currentRole,
  onUpdateDoctorSchedule,
  onLogActivity,
  patients = [],
  medicines = [],
  medicalRecords = [],
  onAddMedicalRecord,
  onUpdateQueueStatus,
}: DoctorSchedulesProps) {
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);

  // NEW Clinical Examination & Prescription form states
  const [examiningQueueId, setExaminingQueueId] = useState<string | null>(null);
  const [complaints, setComplaints] = useState('');
  const [bp, setBp] = useState('120/80');
  const [temp, setTemp] = useState(36.5);
  const [pulse, setPulse] = useState(80);
  const [weight, setWeight] = useState(60);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [prescribedMeds, setPrescribedMeds] = useState<Array<{ id: string; name: string; qty: number; usage: string; isNotAvailable?: boolean }>>([]);
  
  const [isCustomMed, setIsCustomMed] = useState(false);
  const [customMedName, setCustomMedName] = useState('');
  const [currMedId, setCurrMedId] = useState('');
  const [currMedQty, setCurrMedQty] = useState(1);
  const [currMedUsage, setCurrMedUsage] = useState('3x Sehari 1 tablet setelah makan');

  const [needReferral, setNeedReferral] = useState(false);
  const [destHospital, setDestHospital] = useState('');
  const [targetSpecialist, setTargetSpecialist] = useState('');
  const [referralNotes, setReferralNotes] = useState('');

  // NEW Surat Keterangan Dokter form states
  const [needCert, setNeedCert] = useState(false);
  const [certType, setCertType] = useState<'Sakit' | 'Sehat'>('Sakit');
  const [certDuration, setCertDuration] = useState(3);
  const [certStartDate, setCertStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [certReason, setCertReason] = useState('');
  const [certPurpose, setCertPurpose] = useState('Persyaratan Melamar Pekerjaan');
  const [certBloodType, setCertBloodType] = useState('O');
  const [certColorBlind, setCertColorBlind] = useState<'Tidak' | 'Ya'>('Tidak');
  const [certHeight, setCertHeight] = useState(165);

  // Prescription print preview state
  const [printingRecord, setPrintingRecord] = useState<MedicalRecord | null>(null);
  const [printingCertRecord, setPrintingCertRecord] = useState<MedicalRecord | null>(null);

  const handleAddMedToPrescription = () => {
    if (isCustomMed) {
      if (!customMedName.trim()) {
        alert('Mohon isi nama obat secara manual.');
        return;
      }
      const customName = customMedName.trim();
      setPrescribedMeds([...prescribedMeds, { 
        id: '', 
        name: customName + ' (Obat Tidak Tersedia)', 
        qty: currMedQty, 
        usage: currMedUsage,
        isNotAvailable: true
      }]);
      setCustomMedName('');
      setCurrMedQty(1);
    } else {
      if (!currMedId || !medicines) return;
      const med = medicines.find(m => m.id === currMedId);
      if (!med) return;

      if (med.stock < currMedQty) {
        alert(`Stok obat ${med.name} tidak mencukupi (Tersedia: ${med.stock} ${med.unit})`);
        return;
      }

      const exists = prescribedMeds.findIndex(m => m.id === currMedId);
      if (exists > -1) {
        const updated = [...prescribedMeds];
        updated[exists].qty += currMedQty;
        setPrescribedMeds(updated);
      } else {
        setPrescribedMeds([...prescribedMeds, { id: currMedId, name: med.name, qty: currMedQty, usage: currMedUsage }]);
      }
      setCurrMedId('');
      setCurrMedQty(1);
    }
  };

  const handleRemovePrescribedMed = (index: number) => {
    const updated = [...prescribedMeds];
    updated.splice(index, 1);
    setPrescribedMeds(updated);
  };

  const handleSaveClinicalExam = (targetStatus: Queue['status']) => {
    if (!onAddMedicalRecord || !onUpdateQueueStatus) return;
    if (!complaints || !diagnosis || !treatment) {
      alert('Mohon isi keluhan, diagnosis, dan terapi terlebih dahulu.');
      return;
    }

    const currentQueue = queues.find(q => q.id === examiningQueueId);
    if (!currentQueue) return;

    // Build the medical record payload
    const recordPayload: Omit<MedicalRecord, 'id'> = {
      patientId: currentQueue.patientId,
      patientName: currentQueue.patientName,
      doctorId: currentQueue.doctorId,
      doctorName: currentQueue.doctorName,
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
      prescribedMeds: prescribedMeds.map(m => ({
        id: m.id,
        name: m.name,
        qty: m.qty,
        usage: m.usage
      })),
      ...(needCert ? {
        doctorCertificate: {
          type: certType,
          sickLeave: certType === 'Sakit' ? {
            startDate: certStartDate,
            endDate: (() => {
              const start = new Date(certStartDate);
              start.setDate(start.getDate() + certDuration - 1);
              return start.toISOString().split('T')[0];
            })(),
            durationDays: Number(certDuration),
            reason: certReason || diagnosis || complaints || 'Sakit',
          } : undefined,
          healthCert: certType === 'Sehat' ? {
            purpose: certPurpose,
            colorBlind: certColorBlind,
            bloodType: certBloodType,
            height: Number(certHeight),
          } : undefined,
        }
      } : {})
    };

    let referralPayload = undefined;
    if (needReferral) {
      referralPayload = {
        destinationHospital: destHospital,
        targetSpecialist: targetSpecialist,
        notes: referralNotes,
      };
    }

    // Call API/Handler to save medical record today for this patient
    onAddMedicalRecord(recordPayload, referralPayload);

    // Update queue status in context
    onUpdateQueueStatus(currentQueue.id, targetStatus);

    onLogActivity('Pencatatan Rekam Medis & Resep (Dokter)', `Dokter ${currentQueue.doctorName} menyelesaikan pemeriksaan pasien ${currentQueue.patientName} & membuat resep`);

    // Reset Form
    setExaminingQueueId(null);
    setComplaints('');
    setDiagnosis('');
    setTreatment('');
    setPrescribedMeds([]);
    setIsCustomMed(false);
    setCustomMedName('');
    setBp('120/80');
    setTemp(36.5);
    setPulse(80);
    setWeight(60);
    setNeedReferral(false);
    setDestHospital('');
    setTargetSpecialist('');
    setReferralNotes('');
    
    // Reset certificate states
    setNeedCert(false);
    setCertType('Sakit');
    setCertDuration(3);
    setCertStartDate(new Date().toISOString().split('T')[0]);
    setCertReason('');
    setCertPurpose('Persyaratan Melamar Pekerjaan');
    setCertBloodType('O');
    setCertColorBlind('Tidak');
    setCertHeight(165);

    alert(`Pemeriksaan Selesai! Catatan medis & data resep pasien ${currentQueue.patientName} dikirim ke antrean: ${targetStatus === 'Menunggu Kasir' ? 'Kasir' : 'Apotek (Farmasi)'}.`);
  };
  
  // Edited scheduling slots state
  const [editedSenin, setEditedSenin] = useState('');
  const [editedSelasa, setEditedSelasa] = useState('');
  const [editedRabu, setEditedRabu] = useState('');
  const [editedKamis, setEditedKamis] = useState('');
  const [editedJumat, setEditedJumat] = useState('');
  const [editedSabtu, setEditedSabtu] = useState('');
  const [editedMinggu, setEditedMinggu] = useState('');
  const [editedOnDuty, setEditedOnDuty] = useState(false);

  // Sub menus tabs & details states
  const [activeSubTab, setActiveSubTab] = useState<'jadwal' | 'kegiatan'>('jadwal');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientStatusFilter, setPatientStatusFilter] = useState<'Semua' | 'Menunggu' | 'Diperiksa' | 'Selesai'>('Semua');

  const startEditSchedule = (doc: Doctor) => {
    setEditingDoctorId(doc.id);
    setEditedSenin(doc.schedule.Senin || '');
    setEditedSelasa(doc.schedule.Selasa || '');
    setEditedRabu(doc.schedule.Rabu || '');
    setEditedKamis(doc.schedule.Kamis || '');
    setEditedJumat(doc.schedule.Jumat || '');
    setEditedSabtu(doc.schedule.Sabtu || '');
    setEditedMinggu(doc.schedule.Minggu || '');
    setEditedOnDuty(doc.onDuty);
  };

  const handleSaveSchedule = (doctorId: string) => {
    const updatedSchedule: Doctor['schedule'] = {
      Senin: editedSenin || undefined,
      Selasa: editedSelasa || undefined,
      Rabu: editedRabu || undefined,
      Kamis: editedKamis || undefined,
      Jumat: editedJumat || undefined,
      Sabtu: editedSabtu || undefined,
      Minggu: editedMinggu || undefined,
    };

    onUpdateDoctorSchedule(doctorId, updatedSchedule, editedOnDuty);
    const targetDoc = doctors.find(d => d.id === doctorId);
    onLogActivity('Modifikasi Jadwal Dokter', `Mengubah slots jadwal kerja/status piket dokter ${targetDoc?.name}`);
    setEditingDoctorId(null);
  };

  const isAllowedToEdit = ['Admin', 'Perawat'].includes(currentRole);

  const daysList: Array<keyof Doctor['schedule']> = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="font-bold text-slate-800 text-lg">Jadwal Tugas & Kegiatan Dokter</h1>
          <p className="text-xs text-slate-500">Melihat alokasi hari kerja dokter beserta monitor daftar pasien terperiksa secara langsung</p>
        </div>
        
        {isAllowedToEdit && (
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100 flex items-center space-x-1.5">
            <Check className="h-3.5 w-3.5" />
            <span>Mode Pengeditan Aktif</span>
          </span>
        )}
      </div>

      {/* Sub tabs selectors */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-1">
        <button
          onClick={() => setActiveSubTab('jadwal')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeSubTab === 'jadwal'
              ? 'border-b-2 border-indigo-650 text-indigo-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Jadwal Tugas & Piket</span>
        </button>

        <button
          id="btn-sub-menu-kegiatan"
          onClick={() => {
            setActiveSubTab('kegiatan');
            if (doctors.length > 0 && !selectedDoctorId) {
              setSelectedDoctorId(doctors[0].id);
            }
          }}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
            activeSubTab === 'kegiatan'
              ? 'border-b-2 border-indigo-650 text-indigo-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="h-4 w-4 text-rose-500 animate-pulse" />
          <span className="font-bold">Sub Menu: Kegiatan Dokter</span>
        </button>
      </div>

      {activeSubTab === 'jadwal' ? (
        /* ORIGINAL SCHEDULES GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {doctors.map((doc) => {
            const isEditing = editingDoctorId === doc.id;
            return (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-4">
                {/* Doctor Bio Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">👨‍⚕️</span>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{doc.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{doc.specialist}</p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{doc.sip}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border flex items-center space-x-1 ${
                      doc.onDuty
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full mr-1 ${doc.onDuty ? 'bg-emerald-500' : 'bg-slate-350'}`}></span>
                      <span>{doc.onDuty ? 'Piket Hari Ini' : 'Tidak Piket'}</span>
                    </span>

                    {isAllowedToEdit && !isEditing && (
                      <button
                        id={`btn-edit-jadwal-${doc.id}`}
                        onClick={() => startEditSchedule(doc)}
                        className="px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 text-[10px] font-bold rounded transition-colors border border-sky-100 flex items-center space-x-1"
                      >
                        <Edit2 className="h-2.5 w-2.5" />
                        <span>Edit Jadwal</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Schedules Weekly Slots Display / Input */}
                {isEditing ? (
                  /* Editing Slots mode */
                  <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl text-xs animate-fade-in">
                    <h4 className="font-bold text-slate-700 border-b pb-1.5 mb-2">Edit Pengaturan Jam Jadwal Dokter</h4>
                    
                    {/* Toggle duty */}
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border">
                      <span className="font-semibold text-slate-600 flex items-center space-x-1">
                        <Power className="h-3.5 w-3.5 text-slate-500" />
                        <span>Aktifkan Status Piket Hari Ini?</span>
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editedOnDuty}
                          onChange={(e) => setEditedOnDuty(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:width-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">SENIN</label>
                        <input type="text" placeholder="Jam slot (e.g. 08:00 - 13:00)" value={editedSenin} onChange={e => setEditedSenin(e.target.value)} className="w-full p-2 bg-white rounded border border-slate-200 font-mono text-[11px]" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">SELASA</label>
                        <input type="text" placeholder="Jam slot (e.g. 08:00 - 13:00)" value={editedSelasa} onChange={e => setEditedSelasa(e.target.value)} className="w-full p-2 bg-white rounded border border-slate-200 font-mono text-[11px]" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">RABU</label>
                        <input type="text" placeholder="Jam slot" value={editedRabu} onChange={e => setEditedRabu(e.target.value)} className="w-full p-2 bg-white rounded border border-slate-200 font-mono text-[11px]" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">KAMIS</label>
                        <input type="text" placeholder="Jam slot" value={editedKamis} onChange={e => setEditedKamis(e.target.value)} className="w-full p-2 bg-white rounded border border-slate-200 font-mono text-[11px]" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">JUMAT</label>
                        <input type="text" placeholder="Jam slot" value={editedJumat} onChange={e => setEditedJumat(e.target.value)} className="w-full p-2 bg-white rounded border border-slate-200 font-mono text-[11px]" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">SABTU</label>
                        <input type="text" placeholder="Jam slot" value={editedSabtu} onChange={e => setEditedSabtu(e.target.value)} className="w-full p-2 bg-white rounded border border-slate-200 font-mono text-[11px]" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] text-slate-400 font-bold mb-0.5">MINGGU (JIKA BUKA)</label>
                        <input type="text" placeholder="Jam slot" value={editedMinggu} onChange={e => setEditedMinggu(e.target.value)} className="w-full p-2 bg-white rounded border border-slate-200 font-mono text-[11px]" />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2 border-t mt-3">
                      <button
                        onClick={() => setEditingDoctorId(null)}
                        className="px-3 py-1.5 bg-white border border-slate-250 rounded font-bold text-[10px] text-slate-600 hover:bg-slate-50"
                      >
                        Batal
                      </button>
                      <button
                        id={`btn-save-jadwal-${doc.id}`}
                        onClick={() => handleSaveSchedule(doc.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px]"
                      >
                        Simpan Jadwal
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Static Display mode */
                  <table className="w-full text-left text-xs text-slate-700">
                    <tbody>
                      {daysList.map((day) => {
                        const value = doc.schedule[day];
                        return (
                          <tr key={day} className="border-b last:border-b-0 border-slate-100">
                            <td className="py-2.5 font-semibold text-slate-500 w-24">{day}</td>
                            <td className="py-2.5">
                              {value ? (
                                <span className="font-mono bg-sky-50 text-sky-800 font-bold px-2 py-0.5 rounded text-[11px] border border-sky-100/50">
                                  {value}
                                </span>
                              ) : (
                                <span className="text-slate-350 text-[10px] font-medium block">Libur / Tidak Praktik</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* NEW "Kegiatan Dokter & Pasien Diperiksa" VIEW SECTION */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start text-xs font-sans animate-fade-in">
          
          {/* Left Side: Doctor List Panel */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Pilih Dokter Jaga</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Daftar dokter terdaftar dari pengaturan klinis</p>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {doctors.map((doc) => {
                const isActive = doc.id === (selectedDoctorId || doctors[0]?.id);
                const docQueues = queues.filter(q => q.doctorId === doc.id);
                const activeExam = docQueues.filter(q => q.status === 'Diperiksa').length;
                const waitingExam = docQueues.filter(q => q.status === 'Menunggu').length;
                
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-200 shadow-xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50/70 hover:border-slate-200'
                    }`}
                  >
                    <div className="text-2xl mt-0.5">👨‍⚕️</div>
                    <div className="flex-1 min-w-0 font-semibold text-slate-700">
                      <h4 className={`font-bold text-xs truncate ${isActive ? 'text-indigo-900 font-black' : 'text-slate-850'}`}>
                        {doc.name}
                      </h4>
                      <p className="text-[10px] text-slate-550 font-medium truncate mt-0.5">{doc.specialist}</p>
                      
                      {/* Badge Row */}
                      <div className="flex flex-wrap items-center gap-1 mt-2.5">
                        {activeExam > 0 && (
                          <span className="bg-sky-50 text-sky-800 border border-sky-100 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                            ⚡ {activeExam} Diperiksa
                          </span>
                        )}
                        {waitingExam > 0 ? (
                          <span className="bg-amber-50 text-amber-800 border border-amber-100 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                            ⏳ {waitingExam} Antre
                          </span>
                        ) : (
                          <span className="bg-slate-50 text-slate-450 border border-slate-100 px-1.5 py-0.5 rounded text-[9px] font-medium">
                            Antrean Kosong
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {doctors.length === 0 && (
                <div className="p-6 text-center text-slate-400 border border-dashed rounded-xl">
                  Tidak ada dokter terdaftar.
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Selected Doctor's Examined Patients List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
            {(() => {
              const activeDocId = selectedDoctorId || doctors[0]?.id || '';
              const docObj = doctors.find(d => d.id === activeDocId);
              
              if (!docObj) {
                return (
                  <div className="p-10 text-center text-slate-400">
                    <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600 text-xs text-center">Pilih dokter untuk memantau kegiatan periksa</p>
                  </div>
                );
              }

              const docQueues = queues.filter((q) => q.doctorId === activeDocId);
              
              // Filter queues based on search and status tabs
              const filteredPatients = docQueues.filter((q) => {
                const matchesSearch =
                  q.patientName.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
                  q.queueNumber.toLowerCase().includes(patientSearchQuery.toLowerCase());
                  
                const matchesStatus =
                  patientStatusFilter === 'Semua' ||
                  (patientStatusFilter === 'Menunggu' && q.status === 'Menunggu') ||
                  (patientStatusFilter === 'Diperiksa' && q.status === 'Diperiksa') ||
                  (patientStatusFilter === 'Selesai' && ['Selesai', 'Menunggu Kasir', 'Menunggu Obat'].includes(q.status));
                  
                return matchesSearch && matchesStatus;
              });

              const totalAntrean = docQueues.length;
              const totalDiperiksa = docQueues.filter(q => q.status === 'Diperiksa').length;
              const totalMenunggu = docQueues.filter(q => q.status === 'Menunggu').length;
              const totalSelesai = docQueues.filter(q => ['Selesai', 'Menunggu Kasir', 'Menunggu Obat'].includes(q.status)).length;

              return (
                <div className="space-y-5">
                  {/* Profile Card Header of selected doctor */}
                  <div className="bg-slate-50 p-4 border border-slate-200/60 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                        <span>👨‍⚕️</span>
                        <span>{docObj.name}</span>
                      </h3>
                      <p className="text-xs text-slate-505 font-medium">Spesialis: {docObj.specialist} • Ruang Praktik: <span className="font-bold text-slate-800">{docObj.room || '-'}</span></p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 font-bold rounded-lg border text-[10px] ${
                        docObj.onDuty
                          ? 'bg-emerald-50 border-emerald-150 text-emerald-700'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}>
                        {docObj.onDuty ? '🟢 Jaga Hari Ini' : '🔴 Tidak Jaga'}
                      </span>
                    </div>
                  </div>

                  {/* Statistical Recap for this selected doctor */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-indigo-50/50 border border-indigo-150 rounded-xl">
                      <span className="text-[10px] text-indigo-700 uppercase font-black tracking-wider block">Total Antrean</span>
                      <span className="text-sm font-black text-indigo-900 block mt-1 font-mono">{totalAntrean} Pasien</span>
                    </div>
                    <div className="p-3 bg-sky-50/50 border border-sky-150 rounded-xl">
                      <span className="text-[10px] text-sky-700 uppercase font-black tracking-wider block">Sedang Diperiksa</span>
                      <span className="text-sm font-black text-sky-900 block mt-1 font-mono">{totalDiperiksa} Pasien</span>
                    </div>
                    <div className="p-3 bg-amber-50/50 border border-amber-150 rounded-xl">
                      <span className="text-[10px] text-amber-700 uppercase font-black tracking-wider block">Menunggu Giliran</span>
                      <span className="text-sm font-black text-amber-900 block mt-1 font-mono">{totalMenunggu} Pasien</span>
                    </div>
                    <div className="p-3 bg-emerald-50/50 border border-emerald-150 rounded-xl">
                      <span className="text-[10px] text-emerald-700 uppercase font-black tracking-wider block">Selesai Poli</span>
                      <span className="text-sm font-black text-emerald-950 block mt-1 font-mono">{totalSelesai} Pasien</span>
                    </div>
                  </div>

                  {/* Filter controls */}
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 pt-4 border-t border-slate-100">
                    {/* Search bar inside right panel */}
                    <div className="relative flex-1 max-w-xs">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Search className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="text"
                        placeholder="Nama pasien atau nomor..."
                        value={patientSearchQuery}
                        onChange={(e) => setPatientSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Status pill selectors */}
                    <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
                      <button
                        onClick={() => setPatientStatusFilter('Semua')}
                        className={`px-3 py-1 rounded-xl font-bold border text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                          patientStatusFilter === 'Semua'
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Semua ({totalAntrean})
                      </button>

                      <button
                        onClick={() => setPatientStatusFilter('Menunggu')}
                        className={`px-3 py-1 rounded-xl font-bold border text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                          patientStatusFilter === 'Menunggu'
                            ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Menunggu ({totalMenunggu})
                      </button>

                      <button
                        onClick={() => setPatientStatusFilter('Diperiksa')}
                        className={`px-3 py-1 rounded-xl font-bold border text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                          patientStatusFilter === 'Diperiksa'
                            ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Diperiksa ({totalDiperiksa})
                      </button>

                      <button
                        onClick={() => setPatientStatusFilter('Selesai')}
                        className={`px-3 py-1 rounded-xl font-bold border text-[10px] transition-colors cursor-pointer whitespace-nowrap ${
                          patientStatusFilter === 'Selesai'
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Selesai ({totalSelesai})
                      </button>
                    </div>
                  </div>

                  {/* Patients List Grid cards */}
                  <div className="space-y-3 pt-2">
                    {filteredPatients.map((q) => {
                      const record = medicalRecords?.find(
                        (r) => r.patientId === q.patientId && r.date === new Date().toISOString().split('T')[0]
                      );
                      const isExamined = !!record;
                      const isCheckingActive = q.status === 'Diperiksa';
                      const canDoctorAct = ['Admin', 'Dokter'].includes(currentRole);

                      return (
                        <div
                          key={q.id}
                          className="p-3.5 bg-slate-50/40 hover:bg-slate-55 border border-slate-100 rounded-xl space-y-3 transition-all"
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5">
                            <div className="flex items-center space-x-3.5 flex-1 w-full min-w-0">
                              <div className="p-2.5 bg-white text-indigo-750 font-black tracking-tight rounded-xl font-mono text-xs border shrink-0 min-w-[50px] text-center shadow-xs">
                                {q.queueNumber}
                              </div>
                              <div className="flex-1 min-w-0 font-semibold text-left">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-extrabold text-slate-800 text-xs truncate max-w-[200px]">{q.patientName}</h4>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider uppercase shrink-0 ${
                                    q.patientType === 'BPJS'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50'
                                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                  }`}>
                                    {q.patientType}
                                  </span>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-1 flex items-center space-x-1 font-medium font-mono">
                                  <Clock className="h-2.5 w-2.5 inline text-slate-350" />
                                  <span>Masuk Antrean: {q.datetime ? q.datetime.replace('T', ' ') : '-'}</span>
                                </p>
                              </div>
                            </div>

                            {/* Patient status element and action buttons on the right */}
                            <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-between md:justify-end shrink-0">
                              {isCheckingActive && !isExamined && canDoctorAct && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (examiningQueueId === q.id) {
                                      setExaminingQueueId(null);
                                    } else {
                                      setExaminingQueueId(q.id);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg text-[10px] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                                >
                                  <span>🩺</span>
                                  <span>{examiningQueueId === q.id ? 'Tutup Form' : 'Tulis Resep & Catat Medis'}</span>
                                </button>
                              )}

                              {isExamined && record.prescribedMeds && record.prescribedMeds.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setPrintingRecord(record)}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 font-extrabold rounded-lg text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                                  title="Cetak Resep Dokter"
                                >
                                  <Printer className="h-3 w-3 text-rose-500" />
                                  <span>Cetak Resep Pasien</span>
                                </button>
                              )}

                              {isExamined && record.doctorCertificate && (
                                <button
                                  type="button"
                                  onClick={() => setPrintingCertRecord(record)}
                                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-110 text-indigo-700 border border-indigo-100 font-extrabold rounded-lg text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                                  title="Cetak Surat Keterangan Dokter (Sakit / Sehat)"
                                >
                                  <Printer className="h-3 w-3 text-indigo-500" />
                                  <span>Cetak Surat Ket. Dokter ({record.doctorCertificate.type})</span>
                                </button>
                              )}

                              <div className="flex flex-col items-end gap-1 text-right text-[10px] font-bold">
                                <span className={`px-2.5 py-0.5 rounded-full font-black uppercase tracking-wide border text-[9px] ${
                                  q.status === 'Diperiksa'
                                    ? 'bg-sky-50 text-sky-850 border-sky-200'
                                    : q.status === 'Menunggu'
                                    ? 'bg-amber-50 text-amber-850 border-amber-200'
                                    : ['Selesai', 'Menunggu Kasir', 'Menunggu Obat'].includes(q.status)
                                    ? 'bg-emerald-50 text-emerald-850 border-emerald-200'
                                    : q.status === 'Batal'
                                    ? 'bg-rose-50 text-rose-805 border-rose-200'
                                    : 'bg-slate-50 text-slate-855 border-slate-200'
                                }`}>
                                  {q.status === 'Diperiksa'
                                    ? '🟢 Sedang Diperiksa'
                                    : q.status === 'Menunggu'
                                    ? '🟡 Menunggu Giliran'
                                    : ['Selesai', 'Menunggu Kasir', 'Menunggu Obat'].includes(q.status)
                                    ? '🟢 Selesai Pemeriksaan'
                                    : `🔵 ${q.status}`}
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium italic">
                                  {q.status === 'Diperiksa'
                                    ? 'Sedang berada di dalam ruang periksa bersama dokter'
                                    : q.status === 'Menunggu'
                                    ? 'Menunggu panggilan di ruang tunggu umum'
                                    : 'Telah selesai diperiksa & resep dikirim'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* INLINE CLINICAL PRESCRIPTION FORM */}
                          {examiningQueueId === q.id && (
                            <div className="bg-slate-50 border border-indigo-200/55 p-4 rounded-xl space-y-3 animate-fade-in text-xs text-left">
                              <div className="flex justify-between items-center border-b pb-2 border-slate-200">
                                <span className="font-extrabold text-indigo-900 uppercase tracking-wide flex items-center space-x-1">
                                  <span>🩺</span>
                                  <span>Form Catatan Medis & Draft Resep</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setExaminingQueueId(null)}
                                  className="text-slate-405 hover:text-slate-605 font-extrabold"
                                >
                                  Tutup ✕
                                </button>
                              </div>

                              {/* Physical examination input parameters row */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
                                <div>
                                  <label className="block text-[9px] font-black text-slate-450 mb-1">TENSI DARAH</label>
                                  <input type="text" value={bp} onChange={e => setBp(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded font-mono text-[11px]" placeholder="120/80" />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black text-slate-450 mb-1">SUHU (°C)</label>
                                  <input type="number" step="0.1" value={temp} onChange={e => setTemp(Number(e.target.value))} className="w-full p-2 bg-white border border-slate-200 rounded font-mono text-[11px]" />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black text-slate-450 mb-1">NADI (X/MNT)</label>
                                  <input type="number" value={pulse} onChange={e => setPulse(Number(e.target.value))} className="w-full p-2 bg-white border border-slate-200 rounded font-mono text-[11px]" />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black text-slate-450 mb-1">BERAT (KG)</label>
                                  <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full p-2 bg-white border border-slate-200 rounded font-mono text-[11px]" />
                                </div>
                              </div>

                              {/* Text fields descriptions */}
                              <div className="space-y-2 mt-2">
                                <div>
                                  <label className="block text-[9px] font-black text-slate-450 mb-1 uppercase text-left">Keluhan Utama Pasien</label>
                                  <textarea value={complaints} onChange={e => setComplaints(e.target.value)} rows={2} className="w-full p-2 bg-white border border-slate-300 rounded text-[11.5px] placeholder-slate-400" placeholder="e.g. Pegal linu pada persendian, meriang naik turun sejak 2 hari..."></textarea>
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black text-slate-450 mb-1 uppercase text-left">Diagnosis Penyakit</label>
                                  <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={2} className="w-full p-2 bg-white border border-slate-300 rounded text-[11.5px] placeholder-slate-400" placeholder="e.g. Influenza (J11) / Hipertensi Primer (I10)..."></textarea>
                                </div>
                                <div>
                                  <label className="block text-[9px] font-black text-slate-450 mb-1 uppercase text-left">Terapi Non-Obat & Tindakan Medis</label>
                                  <textarea value={treatment} onChange={e => setTreatment(e.target.value)} rows={2} className="w-full p-2 bg-white border border-slate-300 rounded text-[11.5px] placeholder-slate-400" placeholder="e.g. Istirahat cukup tirah baring 8-10 jam s/d demam membaik, minum air putih hangat minimal 2 liter per hari..."></textarea>
                                </div>
                              </div>

                              {/* Grid Container for Prescription and Doctor Certificate side-by-side */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Prescription form section */}
                                <div className="bg-white p-3.5 border border-slate-200 rounded-xl space-y-2.5 text-left flex flex-col justify-between">
                                  <div>
                                    <span className="font-extrabold text-slate-705 text-[10px] uppercase block border-b pb-1 font-sans">Ramuan & Resep Obat Farmasi</span>
                                    
                                    <div className="flex items-center justify-between mt-1 mb-1.5 bg-indigo-50/40 p-1.5 rounded-lg border border-indigo-100/30">
                                      <span className="text-[10px] text-indigo-900 font-semibold italic">Obat tidak tersedia di Klinik?</span>
                                      <label className="inline-flex items-center space-x-1.5 cursor-pointer select-none">
                                        <input
                                          type="checkbox"
                                          checked={isCustomMed}
                                          onChange={(e) => {
                                            setIsCustomMed(e.target.checked);
                                            setCurrMedId('');
                                            setCustomMedName('');
                                          }}
                                          className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 h-3.5 w-3.5"
                                        />
                                        <span className="text-[10px] font-black text-indigo-850">Tulis Manual (Resep Luar)</span>
                                      </label>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-405">
                                          {isCustomMed ? 'Ketik Nama Obat Manual (Luar)' : 'Pilih Obat Kamar Obat'}
                                        </label>
                                        {isCustomMed ? (
                                          <input
                                            type="text"
                                            value={customMedName}
                                            onChange={(e) => setCustomMedName(e.target.value)}
                                            placeholder="Nama obat luar & Keterangan..."
                                            className="w-full p-2 bg-amber-50/50 border border-amber-300 rounded text-[11px] font-bold text-amber-900 placeholder-slate-400 focus:outline-hidden"
                                          />
                                        ) : (
                                          <select
                                            value={currMedId}
                                            onChange={(e) => setCurrMedId(e.target.value)}
                                            className="w-full p-2 bg-slate-50 border border-slate-205 rounded text-[11px]"
                                          >
                                            <option value="">-- Hubungkan Resep --</option>
                                            {medicines.map((med) => (
                                              <option key={med.id} value={med.id} disabled={med.stock <= 0}>
                                                {med.name} (Stok: {med.stock} {med.unit})
                                              </option>
                                            ))}
                                          </select>
                                        )}
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-405">Kuantitas Obat (Pcs)</label>
                                        <input type="number" min={1} value={currMedQty} onChange={e => setCurrMedQty(Number(e.target.value))} className="w-full p-2 bg-slate-50 border border-slate-205 rounded font-mono text-[11px]" />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] font-bold text-slate-405">Aturan Pakai / Signa</label>
                                        <input type="text" value={currMedUsage} onChange={e => setCurrMedUsage(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-205 rounded text-[11px]" />
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={handleAddMedToPrescription}
                                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-150 flex items-center space-x-1 cursor-pointer transition-colors mt-2.5"
                                    >
                                      <span>+ Tambahkan ke Resep Pasien</span>
                                    </button>
                                  </div>

                                  {/* Prescription list drafting overview */}
                                  {prescribedMeds.length > 0 && (
                                    <div className="border border-slate-100 rounded-lg overflow-hidden mt-3 text-[11px]">
                                      <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-[9.5px] uppercase font-bold text-slate-500">
                                          <tr>
                                            <th className="p-2">Obat</th>
                                            <th className="p-2">Kuantitas</th>
                                            <th className="p-2">Aturan Instruksi</th>
                                            <th className="p-2 text-right">Aksi</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {prescribedMeds.map((med, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/60 font-semibold text-slate-700">
                                              <td className="p-2">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-1.5">
                                                  <span>{med.name}</span>
                                                  {med.isNotAvailable && (
                                                    <span className="inline-block mt-0.5 sm:mt-0 px-1.5 py-0.5 bg-amber-100 border border-amber-250 text-amber-800 text-[8px] font-black rounded uppercase tracking-wide">
                                                      Obat Tidak Tersedia
                                                    </span>
                                                  )}
                                                </div>
                                              </td>
                                              <td className="p-2 font-mono text-indigo-600 font-extrabold">x{med.qty}</td>
                                              <td className="p-2 italic text-slate-550">{med.usage}</td>
                                              <td className="p-2 text-right">
                                                <button
                                                  type="button"
                                                  onClick={() => handleRemovePrescribedMed(idx)}
                                                  className="text-rose-500 hover:text-rose-750 font-bold px-1"
                                                >
                                                  Hapus
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>

                                {/* Doctor Certificate Form (Surat Keterangan Dokter) */}
                                <div className={`p-3.5 border rounded-xl space-y-2.5 text-left transition-all relative overflow-hidden ${
                                  needCert 
                                    ? certType === 'Sakit'
                                      ? 'border-indigo-305 bg-indigo-50/20'
                                      : 'border-sky-305 bg-sky-50/20'
                                    : 'border-slate-201 bg-white hover:border-slate-300'
                                }`}>
                                  <div className="flex justify-between items-center border-b pb-1.5 border-slate-100">
                                    <span className="font-extrabold text-slate-705 text-[10px] uppercase flex items-center space-x-1">
                                      <span>📄</span>
                                      <span>Surat Keterangan Dokter</span>
                                    </span>
                                    {/* Toggle Switch */}
                                    <div className="flex items-center space-x-2">
                                      <span className="text-[10px] text-slate-450 font-medium">Buat Surat?</span>
                                      <button
                                        type="button"
                                        onClick={() => setNeedCert(!needCert)}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${needCert ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                      >
                                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${needCert ? 'translate-x-4' : 'translate-x-0'}`} />
                                      </button>
                                    </div>
                                  </div>

                                  {!needCert ? (
                                    <div className="py-8 text-center text-slate-400 space-y-2 h-full flex flex-col justify-center items-center">
                                      <p className="text-[11px] font-medium leading-relaxed max-w-[280px]">Pasien tidak memerlukan Surat Keterangan Sakit / Sehat Penanggung Jawab.</p>
                                      <button
                                        type="button"
                                        onClick={() => { setNeedCert(true); setCertType('Sakit'); }}
                                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 font-extrabold text-[10px] rounded-lg border border-indigo-150 transition-colors cursor-pointer"
                                      >
                                        + Aktifkan & Buat Surat Keterangan
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      {/* Type Selector Tabs */}
                                      <div className="grid grid-cols-2 gap-1.5 bg-slate-100/70 p-1 rounded-lg">
                                        <button
                                          type="button"
                                          onClick={() => setCertType('Sakit')}
                                          className={`py-1 text-center font-bold text-[10px] rounded transition-all cursor-pointer ${
                                            certType === 'Sakit'
                                              ? 'bg-white text-indigo-705 shadow-2xs'
                                              : 'text-slate-500 hover:text-slate-700'
                                          }`}
                                        >
                                          🤒 Surat Ket. Sakit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setCertType('Sehat')}
                                          className={`py-1 text-center font-bold text-[10px] rounded transition-all cursor-pointer ${
                                            certType === 'Sehat'
                                              ? 'bg-white text-indigo-705 shadow-2xs'
                                              : 'text-slate-500 hover:text-slate-700'
                                          }`}
                                        >
                                          💪 Surat Ket. Sehat
                                        </button>
                                      </div>

                                      {certType === 'Sakit' ? (
                                        <div className="space-y-2.5 animate-fade-in">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <label className="block text-[9px] font-bold text-slate-405 mb-0.5 uppercase">Lama Istirahat (Hari)</label>
                                              <input
                                                type="number"
                                                min={1}
                                                max={30}
                                                value={certDuration}
                                                onChange={e => setCertDuration(Number(e.target.value))}
                                                className="w-full p-2 bg-slate-50 border border-slate-205 rounded font-mono text-[11px]"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-[9px] font-bold text-slate-405 mb-0.5 uppercase">Mulai Tanggal</label>
                                              <input
                                                type="date"
                                                value={certStartDate}
                                                onChange={e => setCertStartDate(e.target.value)}
                                                className="w-full p-2 bg-slate-50 border border-slate-205 rounded font-mono text-[11px]"
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <label className="block text-[9px] font-bold text-slate-405 mb-0.5 uppercase">Alasan Keperluan Istirahat</label>
                                            <textarea
                                              rows={2}
                                              value={certReason}
                                              onChange={e => setCertReason(e.target.value)}
                                              className="w-full p-2 bg-slate-50 border border-slate-205 rounded text-[11px] placeholder-slate-400"
                                              placeholder={`Isi alasan istirahat... (Default: ${diagnosis || complaints || 'Mengalami Sakit'})`}
                                            />
                                          </div>
                                          <div className="p-2 bg-indigo-50/40 border border-indigo-100/50 rounded-lg text-[9.5px] text-indigo-800 italic leading-snug">
                                            Pasien akan diberikan istirahat selama <strong>{certDuration} hari</strong>, terhitung tanggal <strong>{certStartDate}</strong> s.d. <strong>{(() => {
                                              const start = new Date(certStartDate);
                                              start.setDate(start.getDate() + certDuration - 1);
                                              return start.toISOString().split('T')[0];
                                            })()}</strong>.
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-2.5 animate-fade-in">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <label className="block text-[9px] font-bold text-slate-405 mb-0.5 uppercase">Golongan Darah</label>
                                              <select
                                                value={certBloodType}
                                                onChange={e => setCertBloodType(e.target.value)}
                                                className="w-full p-2 bg-slate-50 border border-slate-205 rounded text-[11px]"
                                              >
                                                <option value="A">Golongan A</option>
                                                <option value="B">Golongan B</option>
                                                <option value="AB">Golongan AB</option>
                                                <option value="O">Golongan O</option>
                                                <option value="Belum Tahu">Belum Tahu</option>
                                              </select>
                                            </div>
                                            <div>
                                              <label className="block text-[9px] font-bold text-slate-405 mb-0.5 uppercase">Buta Warna</label>
                                              <select
                                                value={certColorBlind}
                                                onChange={e => setCertColorBlind(e.target.value as any)}
                                                className="w-full p-2 bg-slate-50 border border-slate-205 rounded text-[11px]"
                                              >
                                                <option value="Tidak">Tidak Buta Warna</option>
                                                <option value="Ya">Ya (Buta Warna)</option>
                                              </select>
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <label className="block text-[9px] font-bold text-slate-405 mb-0.5 uppercase">Tinggi Badan (cm)</label>
                                              <input
                                                type="number"
                                                value={certHeight}
                                                onChange={e => setCertHeight(Number(e.target.value))}
                                                className="w-full p-2 bg-slate-50 border border-slate-205 rounded font-mono text-[11px]"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-[9px] font-bold text-slate-405 mb-0.5 uppercase">Berat Badan (kg)</label>
                                              <input
                                                type="number"
                                                disabled
                                                value={weight}
                                                className="w-full p-2 bg-slate-100 border border-slate-205 rounded font-mono text-[11px] text-slate-500 cursor-not-allowed font-semibold"
                                                title="Berat badan otomatis sinkron dari pemeriksaan fisik di atas"
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <label className="block text-[9px] font-bold text-slate-405 mb-0.5 uppercase">Keperluan Surat Keterangan</label>
                                            <input
                                              type="text"
                                              value={certPurpose}
                                              onChange={e => setCertPurpose(e.target.value)}
                                              className="w-full p-2 bg-slate-50 border border-slate-205 rounded text-[11px]"
                                              placeholder="Persyaratan Melamar Pekerjaan / SIM / dll"
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* BPJS / Specialist Referral Integrations */}
                              <div className="flex items-center space-x-1.5 bg-white p-2.5 border rounded-xl border-slate-200">
                                <input
                                  type="checkbox"
                                  id={`ref-check-${q.id}`}
                                  checked={needReferral}
                                  onChange={e => setNeedReferral(e.target.checked)}
                                  className="rounded text-indigo-600"
                                />
                                <label htmlFor={`ref-check-${q.id}`} className="font-bold text-slate-650 cursor-pointer text-left">Buatkan Surat Rujukan Terintegrasi BPJS Kesehatan (FKTP)?</label>
                              </div>

                              {needReferral && (
                                <div className="bg-white p-3 border rounded-xl space-y-2 animate-fade-in border-indigo-150 text-left">
                                  <div className="grid grid-cols-2 gap-2 text-left">
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Rumah Sakit Rujukan</label>
                                      <input type="text" value={destHospital} onChange={e => setDestHospital(e.target.value)} className="w-full p-2 border border-slate-255 rounded text-[11px]" placeholder="RSUD Pasar Minggu" />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Spesialis Dokter Rujukan</label>
                                      <input type="text" value={targetSpecialist} onChange={e => setTargetSpecialist(e.target.value)} className="w-full p-2 border border-slate-255 rounded text-[11px]" placeholder="Kardiovaskular" />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Indikasi/Catatan Rujukan</label>
                                    <textarea value={referralNotes} onChange={e => setReferralNotes(e.target.value)} rows={1} className="w-full p-2 border border-slate-255 rounded text-[11px]" placeholder="Keluhan chest pain persisten..."></textarea>
                                  </div>
                                </div>
                              )}

                              {/* Action saves routing dispatchers */}
                              <div className="flex flex-wrap gap-2 justify-end pt-2 border-t mt-3 border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => setExaminingQueueId(null)}
                                  className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-600 cursor-pointer"
                                >
                                  Batal
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleSaveClinicalExam('Menunggu Kasir')}
                                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-xs cursor-pointer"
                                >
                                  Simpan & Rujuk ke Kasir
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSaveClinicalExam('Menunggu Obat')}
                                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs cursor-pointer"
                                >
                                  Lompati Kasir (Langsung Apotek)
                                </button>
                              </div>
                            </div>
                          )}

                          {isExamined && (
                            <div className="bg-emerald-50 border border-emerald-150 p-2.5 rounded-lg flex items-center justify-between text-[11.5px] font-medium text-emerald-800 animate-fade-in">
                              <span className="truncate max-w-[500px]">
                                <strong>✓ Diagnosa Hari Ini:</strong> {record.diagnosis} • <strong>Resep:</strong> {record.prescribedMeds.map(m => `${m.name} x${m.qty}`).join(', ') || 'Tanpa obat resep'}
                              </span>
                              <span className="text-[9px] bg-white text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded font-bold shrink-0">TERPERIKSA</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {filteredPatients.length === 0 && (
                    <div className="p-10 border border-dashed text-center text-slate-400 rounded-xl space-y-2">
                      <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-650 text-xs">Saringan Pasien Kosong</p>
                      <p className="text-[10px] text-slate-400 font-medium">Tidak ada pasien yang terikat status ini dalam antrean hari ini.</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Cetak Resep Dokter Modal */}
      {printingRecord && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto font-serif">
            {/* Modal Exit */}
            <button
              onClick={() => setPrintingRecord(null)}
              className="absolute right-4 top-4 p-1.5 bg-slate-100 hover:bg-slate-250 rounded-full transition-colors text-slate-500 font-sans text-xs cursor-pointer"
            >
              ✕
            </button>

            {/* Document Resep wrapper */}
            <div id="recipe-paper-print" className="border-2 border-slate-800 p-6 space-y-4 text-slate-800 select-all text-left">
              <div className="flex items-center justify-between border-b pb-3 border-slate-800 font-sans">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏥</span>
                  <div>
                    <h2 className="font-extrabold text-xs tracking-tight uppercase text-indigo-900 leading-tight">Klinik Pratama Sehat Utama</h2>
                    <p className="text-[8px] text-slate-500">Jl. Boulevard Raya Barat No. 128, Kelapa Gading Selatan</p>
                  </div>
                </div>
                <div className="text-right text-[8px] text-slate-450 font-mono">
                  No. Resep: RX-{printingRecord.id.replace('MR', '')}
                </div>
              </div>

              {/* Doctor Details */}
              <div className="text-xs font-sans space-y-0.5">
                <p className="font-bold text-slate-900">Dr. Penanggung Jawab: {printingRecord.doctorName}</p>
                <p className="text-[9px] text-slate-450 font-mono">SIP: {doctors.find(d => d.name === printingRecord.doctorName)?.sip || 'SIP.982/108/DISMA/2026'}</p>
                <p className="text-[9px] text-slate-500 block">Tanggal Peresepan: {printingRecord.date}</p>
              </div>

              <hr className="border-slate-800" />

              {/* Prescription symbol list */}
              <div className="space-y-3">
                <div className="text-lg font-black font-serif italic tracking-wide">R/</div>
                
                <div className="pl-6 space-y-3.5">
                  {printingRecord.prescribedMeds && printingRecord.prescribedMeds.map((med, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex justify-between font-bold text-slate-850">
                        <span className="font-sans font-bold">{med.name}</span>
                        <span className="font-mono text-indigo-850">No. {med.qty}</span>
                      </div>
                      <p className="text-[10px] text-slate-550 italic mt-0.5 pl-1">S. {med.usage}</p>
                    </div>
                  ))}
                  
                  {(!printingRecord.prescribedMeds || printingRecord.prescribedMeds.length === 0) && (
                    <p className="text-xs italic text-slate-450 pl-2">Tidak ada rekomendasi resep obat formal.</p>
                  )}
                </div>
              </div>

              <hr className="border-dashed border-slate-400" />

              {/* Patient block footer */}
              <div className="text-[11px] font-sans space-y-1 bg-slate-50 p-2.5 border border-slate-200 rounded-lg">
                <p className="text-slate-700"><strong>Pro (Pasien):</strong> {printingRecord.patientName}</p>
                <p className="text-[10px] text-slate-450 font-mono">Nomor Rekam Medis: {printingRecord.id}</p>
                <p className="text-[10px] text-slate-450">Status Jaminan Layanan: {patients.find(p => p.id === printingRecord.patientId)?.type || 'Umum'}</p>
              </div>

              {/* Doctor sign line */}
              <div className="pt-4 text-right font-sans text-xs">
                <span className="text-[9px] text-slate-400 block mb-12">Tanda Tangan & Cap Dokter</span>
                <strong className="underline text-slate-900 block">{printingRecord.doctorName}</strong>
                <span className="text-[9px] font-mono text-slate-500">{doctors.find(d => d.name === printingRecord.doctorName)?.sip || 'SIP.982'}</span>
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
                onClick={() => setPrintingRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cetak Surat Keterangan Dokter Modal */}
      {printingCertRecord && printingCertRecord.doctorCertificate && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto font-serif">
            {/* Modal Exit */}
            <button
              onClick={() => setPrintingCertRecord(null)}
              className="absolute right-4 top-4 p-1.5 bg-slate-100 hover:bg-slate-250 rounded-full transition-colors text-slate-500 font-sans text-xs cursor-pointer"
            >
              ✕
            </button>

            {/* Document Surat wrapper */}
            <div id="cert-paper-print" className="border-2 border-slate-800 p-8 space-y-6 text-slate-800 select-all text-left">
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
                  {printingCertRecord.doctorCertificate.type === 'Sakit' 
                    ? 'SURAT KETERANGAN ISTIRAHAT SAKIT' 
                    : 'SURAT KETERANGAN SEHAT'}
                </h3>
                <p className="text-[9px] text-slate-500 font-mono">No: {printingCertRecord.id.replace('MR', 'SKD-')}/V/2026</p>
              </div>

              <div className="text-xs space-y-4 font-sans leading-relaxed text-slate-700">
                <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>

                {/* Patient Specifications */}
                <div className="grid grid-cols-12 gap-x-2 gap-y-1 pl-4">
                  <div className="col-span-4 text-slate-500 font-medium">Nama Lengkap</div>
                  <div className="col-span-8 font-bold text-slate-900">: {printingCertRecord.patientName}</div>

                  <div className="col-span-4 text-slate-500 font-medium">Tgl Lahir / Umur</div>
                  <div className="col-span-8">: {(() => {
                    const patient = patients.find(p => p.id === printingCertRecord.patientId);
                    if (!patient) return '-';
                    const birthYear = new Date(patient.birthDate).getFullYear();
                    const age = 2026 - birthYear;
                    return `${patient.birthDate} (${age} Tahun)`;
                  })()}</div>

                  <div className="col-span-4 text-slate-500 font-medium">Jenis Kelamin</div>
                  <div className="col-span-8">: {patients.find(p => p.id === printingCertRecord.patientId)?.gender || '-'}</div>

                  <div className="col-span-4 text-slate-500 font-medium">Alamat Tinggal</div>
                  <div className="col-span-8 text-[11px] leading-tight">: {patients.find(p => p.id === printingCertRecord.patientId)?.address || '-'}</div>
                </div>

                {/* Content body based on cert type */}
                {printingCertRecord.doctorCertificate.type === 'Sakit' && printingCertRecord.doctorCertificate.sickLeave ? (
                  <div className="space-y-3 pt-2">
                    <p className="text-justify leading-relaxed">
                      Berdasarkan hasil pemeriksaan klinis yang telah kami lakukan terhadap pasien tersebut di atas, dengan ini menerangkan bahwa pasien dalam keadaan <strong>SAKIT</strong> sehingga membutuhkan istirahat untuk memulihkan kesehatannya.
                    </p>
                    <p className="text-justify leading-relaxed">
                      Kepadanya diberikan izin beristirahat tidak masuk kerja/sekolah selama <strong>{printingCertRecord.doctorCertificate.sickLeave.durationDays} hari</strong>, terhitung sejak tanggal <strong>{printingCertRecord.doctorCertificate.sickLeave.startDate}</strong> s/d <strong>{printingCertRecord.doctorCertificate.sickLeave.endDate}</strong>.
                    </p>
                    <p>
                      <strong>Keperluan / Alasan:</strong> {printingCertRecord.doctorCertificate.sickLeave.reason || 'Pemulihan Kesehatan / Istirahat Sakit'}
                    </p>
                  </div>
                ) : printingCertRecord.doctorCertificate.healthCert ? (
                  <div className="space-y-4 pt-2">
                    <p className="text-justify leading-relaxed">
                      Berdasarkan hasil riwayat pemeriksaan fisik klinis jasmani yang telah kami lakukan pada hari ini, pasien tersebut di atas dinyatakan dalam kondisi <strong>SEHAT JASMANI</strong> dengan rincian data vital sebagai berikut:
                    </p>
                    
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px] bg-slate-50/55 max-w-sm mx-auto">
                      <table className="w-full text-left font-serif">
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="p-2.5 text-slate-500 font-sans">Tinggi Badan / Berat Badan</td>
                            <td className="p-2.5 font-bold text-slate-900 font-mono">{printingCertRecord.doctorCertificate.healthCert.height} cm / {printingCertRecord.physicalExam.weight} kg</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-500 font-sans">Tekanan Darah (Tensi)</td>
                            <td className="p-2.5 font-bold text-slate-900 font-mono">{printingCertRecord.physicalExam.bloodPressure} mmHg</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-500 font-sans">Golongan Darah</td>
                            <td className="p-2.5 font-extrabold text-slate-900 font-mono">Tipe &ldquo;{printingCertRecord.doctorCertificate.healthCert.bloodType}&rdquo;</td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-500 font-sans">Status Buta Warna</td>
                            <td className="p-2.5 font-bold text-slate-900 font-sans">{printingCertRecord.doctorCertificate.healthCert.colorBlind === 'Ya' ? 'BUTA WARNA' : 'TIDAK BUTA WARNA'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p>
                      <strong>Keperluan Surat Keterangan:</strong> {printingCertRecord.doctorCertificate.healthCert.purpose || 'Persyaratan Melamar Pekerjaan / Administrasi'}
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
                  MR-ID: {printingCertRecord.id}
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[9px] text-slate-500">Jakarta, {printingCertRecord.date}</p>
                  <span className="text-[9px] text-slate-405 block pb-12 font-medium">Dokter Pemeriksa,</span>
                  <strong className="underline text-slate-950 block font-bold">{printingCertRecord.doctorName}</strong>
                  <span className="text-[9px] font-mono text-slate-500">{doctors.find(d => d.name === printingCertRecord.doctorName)?.sip || 'SIP.982/108/DISMA/2026'}</span>
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
                onClick={() => setPrintingCertRecord(null)}
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

import React, { useState, useEffect } from 'react';
import {
  initialPatients,
  initialDoctors,
  initialEmployees,
  initialMedicines,
  initialQueues,
  initialMedicalRecords,
  initialReferralLetters,
  initialTransactions,
  initialActivityLogs,
  defaultClinicProfile,
  defaultPermissions,
} from './utils/initialData';
import {
  Patient,
  Doctor,
  Employee,
  Queue,
  MedicalRecord,
  ReferralLetter,
  Medicine,
  Transaction,
  ActivityLog,
  ClinicProfile,
  RolePermission,
  ThemeColor,
  RoleType,
  Supplier,
  Purchase,
  StockTransaction,
} from './types';

// Import components
import Dashboard from './components/Dashboard';
import QueueSystem from './components/QueueSystem';
import PatientList from './components/PatientList';
import MedicalRecordsAndReferences from './components/MedicalRecordsAndReferences';
import DoctorSchedules from './components/DoctorSchedules';
import MedicineInventory from './components/MedicineInventory';
import FinancialReports from './components/FinancialReports';
import EmployeeList from './components/EmployeeList';
import ActivityLogView from './components/ActivityLogView';
import ClinicSettings from './components/ClinicSettings';
import BPJSChecker from './components/BPJSChecker';
import Login from './components/Login';
import SelfRegistration from './components/SelfRegistration';
import SupplierManagement from './components/SupplierManagement';
import PurchaseManagement from './components/PurchaseManagement';

// Import icons
import {
  LayoutDashboard,
  Clock,
  Users,
  ClipboardList,
  Calendar,
  Layers,
  FileBarChart,
  UserCheck,
  History,
  Settings,
  ShieldAlert,
  Menu,
  X,
  CreditCard,
  Ticket,
  LogOut,
  ShoppingCart,
  Truck,
  FolderTree,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // --- Persistent LocalStorage States ---
  const [patients, setPatients] = useState<Patient[]>(() => {
    const local = localStorage.getItem('klinik_patients');
    return local ? JSON.parse(local) : initialPatients;
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const local = localStorage.getItem('klinik_doctors');
    return local ? JSON.parse(local) : initialDoctors;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const local = localStorage.getItem('klinik_employees');
    return local ? JSON.parse(local) : initialEmployees;
  });

  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const local = localStorage.getItem('klinik_medicines');
    return local ? JSON.parse(local) : initialMedicines;
  });

  const [queues, setQueues] = useState<Queue[]>(() => {
    const local = localStorage.getItem('klinik_queues');
    return local ? JSON.parse(local) : initialQueues;
  });

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    const local = localStorage.getItem('klinik_records');
    return local ? JSON.parse(local) : initialMedicalRecords;
  });

  const [referrals, setReferrals] = useState<ReferralLetter[]>(() => {
    const local = localStorage.getItem('klinik_referrals');
    return local ? JSON.parse(local) : initialReferralLetters;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const local = localStorage.getItem('klinik_transactions');
    return local ? JSON.parse(local) : initialTransactions;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const local = localStorage.getItem('klinik_logs');
    return local ? JSON.parse(local) : initialActivityLogs;
  });

  const [clinicProfile, setClinicProfile] = useState<ClinicProfile>(() => {
    const local = localStorage.getItem('klinik_profile');
    return local ? JSON.parse(local) : defaultClinicProfile;
  });

  const [permissions, setPermissions] = useState<RolePermission[]>(() => {
    const local = localStorage.getItem('klinik_permissions');
    return local ? JSON.parse(local) : defaultPermissions;
  });

  const [theme, setTheme] = useState<ThemeColor>(() => {
    const local = localStorage.getItem('klinik_theme');
    return (local as ThemeColor) || 'soft-teal';
  });

  const [customMenus, setCustomMenus] = useState<any[]>([]);

  const [medicineCategories, setMedicineCategories] = useState<string[]>(() => {
    const local = localStorage.getItem('klinik_medicine_categories');
    return local ? JSON.parse(local) : [
      'Analgesik & Antipiretik',
      'Antibiotik Penicillin',
      'Antidiabetes Oral',
      'Antasida & Antiulserasi',
      'Antihipertesi',
      'Obat Batuk & Pilek',
      'Suplemen & Vitamin'
    ];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const local = localStorage.getItem('klinik_suppliers');
    return local ? JSON.parse(local) : [
      { id: 'SPL-001', name: 'PT. Kimia Farma Trading', phone: '021-3904441', address: 'Jl. Budi Utomo No.1, Jakarta Pusat', email: 'info@kimiafarma.co.id' },
      { id: 'SPL-002', name: 'PT. Bina San Prima', phone: '081122339900', address: 'Kawasan Industri Pulogadung, Jakarta Timur', email: 'order@binasanprima.com' },
      { id: 'SPL-003', name: 'PT. Kalbe Farma Tbk', phone: '021-8983300', address: 'Jl. Letjen Suprapto Kav. 4, Jakarta Pusat', email: 'sales@kalbe.co.id' },
    ];
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const local = localStorage.getItem('klinik_purchases');
    return local ? JSON.parse(local) : [];
  });

  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(() => {
    const local = localStorage.getItem('klinik_stock_transactions');
    return local ? JSON.parse(local) : [
      {
        id: 'TXS-001',
        medicineId: 'M001',
        medicineName: 'Paracetamol 500mg',
        type: 'Stok Masuk',
        qty: 450,
        date: '2026-05-20',
        reference: 'Saldo Awal',
        notes: 'Inisialisasi stok awal sistem',
        balanceAfter: 450,
      },
      {
        id: 'TXS-002',
        medicineId: 'M002',
        medicineName: 'Amoxicillin 500mg',
        type: 'Stok Masuk',
        qty: 80,
        date: '2026-05-20',
        reference: 'Saldo Awal',
        notes: 'Inisialisasi stok awal sistem',
        balanceAfter: 80,
      },
      {
        id: 'TXS-003',
        medicineId: 'M003',
        medicineName: 'Metformin HCl 500mg',
        type: 'Stok Masuk',
        qty: 320,
        date: '2026-05-20',
        reference: 'Saldo Awal',
        notes: 'Inisialisasi stok awal sistem',
        balanceAfter: 320,
      },
      {
        id: 'TXS-004',
        medicineId: 'M004',
        medicineName: 'Antasida Doen',
        type: 'Stok Masuk',
        qty: 15,
        date: '2026-05-20',
        reference: 'Saldo Awal',
        notes: 'Inisialisasi stok awal sistem',
        balanceAfter: 15,
      },
      {
        id: 'TXS-005',
        medicineId: 'M005',
        medicineName: 'Amlodipine 5mg',
        type: 'Stok Masuk',
        qty: 500,
        date: '2026-05-20',
        reference: 'Saldo Awal',
        notes: 'Inisialisasi stok awal sistem',
        balanceAfter: 500,
      },
      {
        id: 'TXS-006',
        medicineId: 'M051',
        medicineName: 'Spuit Suntik 3cc',
        type: 'Stok Masuk',
        qty: 150,
        date: '2026-05-20',
        reference: 'Saldo Awal',
        notes: 'Inisialisasi stok awal sistem',
        balanceAfter: 150,
      },
      {
        id: 'TXS-007',
        medicineId: 'M052',
        medicineName: 'Masker Medis 3-Ply',
        type: 'Stok Masuk',
        qty: 200,
        date: '2026-05-20',
        reference: 'Saldo Awal',
        notes: 'Inisialisasi stok awal sistem',
        balanceAfter: 200,
      },
      {
        id: 'TXS-008',
        medicineId: 'M006',
        medicineName: 'OBH Sirup 100ml',
        type: 'Stok Masuk',
        qty: 45,
        date: '2026-05-20',
        reference: 'Saldo Awal',
        notes: 'Inisialisasi stok awal sistem',
        balanceAfter: 45,
      }
    ];
  });

  const [currentRole, setCurrentRole] = useState<RoleType>('Admin');
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Session & Kiosk Mode States ---
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const local = localStorage.getItem('klinik_current_user');
    return local ? JSON.parse(local) : null;
  });

  const [isSelfRegistering, setIsSelfRegistering] = useState<boolean>(() => {
    const local = localStorage.getItem('klinik_is_self_registering');
    return local === 'true';
  });

  // --- Sync to LocalStorage on updates ---
  useEffect(() => {
    localStorage.setItem('klinik_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('klinik_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('klinik_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('klinik_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('klinik_queues', JSON.stringify(queues));
  }, [queues]);

  useEffect(() => {
    localStorage.setItem('klinik_records', JSON.stringify(medicalRecords));
  }, [medicalRecords]);

  useEffect(() => {
    localStorage.setItem('klinik_referrals', JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem('klinik_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('klinik_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('klinik_profile', JSON.stringify(clinicProfile));
  }, [clinicProfile]);

  useEffect(() => {
    localStorage.setItem('klinik_permissions', JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem('klinik_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('klinik_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('klinik_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('klinik_is_self_registering', String(isSelfRegistering));
  }, [isSelfRegistering]);

  useEffect(() => {
    localStorage.setItem('klinik_medicine_categories', JSON.stringify(medicineCategories));
  }, [medicineCategories]);

  useEffect(() => {
    localStorage.setItem('klinik_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('klinik_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('klinik_stock_transactions', JSON.stringify(stockTransactions));
  }, [stockTransactions]);

  // --- Mutators & Callbacks ---
  const handleLogActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: 'LOG' + Date.now(),
      userId: 'SESS_USER',
      userName: `Staff ${currentRole}`,
      userRole: currentRole,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const handleAddPatient = (patientPayload: Omit<Patient, 'id'>) => {
    const newPatient: Patient = {
      id: 'P00' + (patients.length + 1),
      ...patientPayload,
    };
    setPatients((prev) => [newPatient, ...prev]);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
  };

  const handleUpdatePatientBpjs = (patientId: string, status: 'Aktif' | 'Tidak Aktif', bpjsClass: string) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, bpjsStatus: status, bpjsClass } : p
      )
    );
  };

  const handleAddQueue = (patientId: string, doctorId: string) => {
    const patient = patients.find((p) => p.id === patientId)!;
    const doctor = doctors.find((d) => d.id === doctorId)!;

    // Estimate prefix Code based on physician's specialist
    const prefix = doctorId === 'D001' ? 'A' : doctorId === 'D002' ? 'B' : doctorId === 'D003' ? 'D' : 'C';
    const queuesOfPoli = queues.filter((q) => q.doctorId === doctorId);
    const queueNo = `${prefix}-${String(queuesOfPoli.length + 1).padStart(2, '0')}`;

    const newQueue: Queue = {
      id: 'Q' + Date.now(),
      queueNumber: queueNo,
      patientId,
      patientName: patient.name,
      patientType: patient.type,
      doctorId,
      doctorName: doctor.name,
      room: doctor.room,
      status: 'Menunggu Pendaftaran',
      datetime: new Date().toISOString(),
    };

    setQueues((prev) => [...prev, newQueue]);

    // Also deduct a small administrative consultation cost automatically to finance invoices if Patient is Umum!
    if (patient.type === 'Umum') {
      const isPoliUmum = doctor.specialist.includes('Umum');
      const consultationCost = isPoliUmum ? 150000 : 250000;
      
      const newInvoice: Transaction = {
        id: 'T' + Date.now(),
        invoiceNumber: 'INV/' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '/' + String(transactions.length + 1).padStart(3, '0'),
        type: 'Uang Masuk',
        category: 'Pendaftaran & Konsultasi',
        amount: consultationCost,
        date: new Date().toISOString().split('T')[0],
        description: `Biaya pelayanan awal poliklinik ${doctor.specialist} - ${patient.name}`,
        payerOrPayee: patient.name,
      };
      setTransactions((prev) => [newInvoice, ...prev]);
    }
  };

  const handleUpdateQueueStatus = (id: string, status: Queue['status']) => {
    setQueues((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    
    // Auto cut medicine stocks if doctor prescription finishes checking (when queue switches to Selesai)
    if (status === 'Selesai') {
      const originalQueue = queues.find((q) => q.id === id);
      if (originalQueue) {
        // Find corresponding medical record for patient today to trigger inventory subtraction
        const record = medicalRecords.find(r => r.patientId === originalQueue.patientId && r.date === new Date().toISOString().split('T')[0]);
        if (record && record.prescribedMeds && record.prescribedMeds.length > 0) {
          const mainMedsToDeduct = record.prescribedMeds.filter(pm => pm.id);
          
          if (mainMedsToDeduct.length > 0) {
            setMedicines((prevMeds) => {
              const newTxs: StockTransaction[] = [];
              const updatedMeds = prevMeds.map((m) => {
                const pm = mainMedsToDeduct.find(p => p.id === m.id);
                if (pm) {
                  const updatedStock = Math.max(0, m.stock - pm.qty);
                  newTxs.push({
                    id: 'TXS-' + String(Date.now()) + '-' + Math.floor(100 + Math.random() * 900) + '-' + pm.id,
                    medicineId: pm.id,
                    medicineName: pm.name,
                    type: 'Stok Keluar',
                    qty: pm.qty,
                    date: new Date().toISOString().split('T')[0],
                    reference: 'Resep RX-' + record.id.replace('MR', ''),
                    notes: `Pemberian resep pasien ${originalQueue.patientName} (${originalQueue.queueNumber}) via Apotek`,
                    balanceAfter: updatedStock,
                  });
                  return { ...m, stock: updatedStock };
                }
                return m;
              });
              
              if (newTxs.length > 0) {
                setStockTransactions((prevTxs) => [...newTxs, ...prevTxs]);
              }
              return updatedMeds;
            });
          }
        }
      }
    }
  };

  const handleAddMedicalRecord = (
    recordPayload: Omit<MedicalRecord, 'id'>,
    referralPayload?: { destinationHospital: string; targetSpecialist: string; notes: string }
  ) => {
    const recordId = 'MR00' + (medicalRecords.length + 1);
    let refId = undefined;

    if (referralPayload) {
      refId = 'REF00' + (referrals.length + 1);
      const patientData = patients.find((p) => p.id === recordPayload.patientId)!;
      const docData = doctors.find((d) => d.id === recordPayload.doctorId)!;

      const newReferral: ReferralLetter = {
        id: refId,
        medicalRecordId: recordId,
        patientId: recordPayload.patientId,
        patientName: recordPayload.patientName,
        patientNik: patientData.nik,
        patientBpjsNumber: patientData.bpjsNumber,
        gender: patientData.gender,
        birthDate: patientData.birthDate,
        diagnosis: recordPayload.diagnosis,
        destinationHospital: referralPayload.destinationHospital,
        targetSpecialist: referralPayload.targetSpecialist,
        notes: referralPayload.notes,
        dateIssued: recordPayload.date,
        doctorSignName: docData.name,
        doctorSip: docData.sip,
      };

      setReferrals((prev) => [newReferral, ...prev]);
    }

    const newRecord: MedicalRecord = {
      id: recordId,
      ...recordPayload,
      referralId: refId,
    };

    setMedicalRecords((prev) => [newRecord, ...prev]);
  };

  const handleUpdateDoctorSchedule = (
    doctorId: string,
    schedule: Doctor['schedule'],
    onDuty: boolean
  ) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === doctorId ? { ...d, schedule, onDuty } : d))
    );
  };

  const handleAddMedicine = (medPayload: Omit<Medicine, 'id'>) => {
    const newMed: Medicine = {
      id: 'M00' + (medicines.length + 1),
      ...medPayload,
    };
    setMedicines((prev) => [...prev, newMed]);
  };

  const handleUpdateMedicine = (updatedMedicine: Medicine) => {
    setMedicines((prev) => prev.map((m) => (m.id === updatedMedicine.id ? updatedMedicine : m)));
  };

  const handleAddCategory = (category: string) => {
    setMedicineCategories((prev) => [...prev, category]);
  };

  const handleDeleteCategory = (category: string) => {
    setMedicineCategories((prev) => prev.filter((c) => c !== category));
  };

  const handleAddSupplier = (supPayload: Omit<Supplier, 'id'>) => {
    const newId = 'SPL-' + String(suppliers.length + 1).padStart(3, '0');
    const newSup: Supplier = {
      id: newId,
      ...supPayload,
    };
    setSuppliers((prev) => [...prev, newSup]);
  };

  const handleUpdateSupplier = (updatedSup: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === updatedSup.id ? updatedSup : s)));
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddPurchase = (purPayload: Omit<Purchase, 'id' | 'invoiceNumber'> & { medicineId?: string; qty?: number; paymentStatus?: 'Hutang' | 'Bayar Lunas' }) => {
    const pNo = `PRC/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${String(purchases.length + 1).padStart(3, '0')}`;
    const { medicineId, qty, paymentStatus, ...payloadData } = purPayload;
    
    const newPurchase: Purchase = {
      id: 'P' + Date.now(),
      invoiceNumber: pNo,
      ...payloadData,
      medicineId,
      qty,
      receivedQty: 0,
      receiveStatus: 'Pending',
      paymentStatus: paymentStatus || 'Hutang',
    };
    setPurchases((prev) => [newPurchase, ...prev]);

    // Only record transaction in case of Cash (Bayar Lunas / Terbayar)
    if (paymentStatus === 'Bayar Lunas') {
      handleAddTransaction({
        type: 'Uang Keluar',
        category: purPayload.category,
        amount: purPayload.totalAmount,
        date: purPayload.date,
        description: `[Pembelian Lunas ${purPayload.taxType}] ${purPayload.itemsDescription}`,
        payerOrPayee: purPayload.supplierName,
      });
    }
  };

  const handleUpdatePurchase = (updatedPurchase: Purchase) => {
    const existing = purchases.find((p) => p.id === updatedPurchase.id);
    if (existing) {
      if (existing.paymentStatus === 'Hutang' && updatedPurchase.paymentStatus === 'Bayar Lunas') {
        handleAddTransaction({
          type: 'Uang Keluar',
          category: updatedPurchase.category,
          amount: updatedPurchase.totalAmount,
          date: new Date().toISOString().slice(0, 10), // Use today's date for payout
          description: `[Pelunasan Hutang PO ${updatedPurchase.taxType}] ${updatedPurchase.itemsDescription}`,
          payerOrPayee: updatedPurchase.supplierName,
        });
      }
    }
    setPurchases((prev) => prev.map((p) => (p.id === updatedPurchase.id ? updatedPurchase : p)));
  };

  const handleDeletePurchase = (id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  const handleReceivePurchase = (
    purchaseId: string,
    qtyToReceive: number,
    date: string,
    notes: string
  ) => {
    setPurchases((prevPurchases) => {
      return prevPurchases.map((purchase) => {
        if (purchase.id === purchaseId) {
          const currentReceived = purchase.receivedQty || 0;
          const totalQty = purchase.qty || 0;
          const newReceived = currentReceived + qtyToReceive;
          
          let newStatus: 'Pending' | 'Partial' | 'Closed' = 'Pending';
          if (newReceived >= totalQty) {
            newStatus = 'Closed';
          } else if (newReceived > 0) {
            newStatus = 'Partial';
          }

          const updatedPurchase: Purchase = {
            ...purchase,
            receivedQty: Math.min(totalQty, newReceived),
            receiveStatus: newStatus,
          };

          // Update actual medicine stock in inventory & create StockTransaction
          if (purchase.medicineId) {
            const medId = purchase.medicineId;
            setMedicines((prevMeds) => {
              return prevMeds.map((m) => {
                if (m.id === medId) {
                  const updatedStock = m.stock + qtyToReceive;

                  const newStockTx: StockTransaction = {
                    id: 'TXS-' + String(Date.now()) + '-' + Math.floor(100 + Math.random() * 900),
                    medicineId: m.id,
                    medicineName: m.name,
                    type: 'Stok Masuk',
                    qty: qtyToReceive,
                    date: date,
                    reference: purchase.invoiceNumber,
                    notes: notes || `Receive (${newStatus}) dari PO ${purchase.invoiceNumber}`,
                    balanceAfter: updatedStock,
                  };

                  setStockTransactions((prevTxs) => [newStockTx, ...prevTxs]);
                  return { ...m, stock: updatedStock };
                }
                return m;
              });
            });
          }

          return updatedPurchase;
        }
        return purchase;
      });
    });
  };

  const handleAddStockManualAdjustment = (
    medicineId: string,
    type: 'Stok Masuk' | 'Stok Keluar',
    qty: number,
    date: string,
    notes: string
  ) => {
    setMedicines((prevMeds) => {
      return prevMeds.map((m) => {
        if (m.id === medicineId) {
          const updatedStock = type === 'Stok Masuk' ? m.stock + qty : Math.max(0, m.stock - qty);
          const newStockTx: StockTransaction = {
            id: 'TXS-' + String(Date.now()) + '-' + Math.floor(100 + Math.random() * 900),
            medicineId: m.id,
            medicineName: m.name,
            type,
            qty,
            date,
            reference: 'Penyesuaian Manual',
            notes,
            balanceAfter: updatedStock,
          };
          setStockTransactions((prevTxs) => [newStockTx, ...prevTxs]);
          return { ...m, stock: updatedStock };
        }
        return m;
      });
    });
  };

  const handleAddTransaction = (trxPayload: Omit<Transaction, 'id' | 'invoiceNumber'>) => {
    const invoicePrefix = trxPayload.type === 'Uang Masuk' ? 'INV' : 'OUT';
    const invoiceNo = `${invoicePrefix}/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${String(transactions.length + 1).padStart(3, '0')}`;

    const newTrx: Transaction = {
      id: 'T' + Date.now(),
      invoiceNumber: invoiceNo,
      ...trxPayload,
    };
    setTransactions((prev) => [newTrx, ...prev]);
  };

  const handleAddEmployee = (empPayload: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      id: 'K00' + (employees.length + 1),
      ...empPayload,
    };
    setEmployees((prev) => [...prev, newEmp]);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
  };

  // --- Dynamic Theme Wrapper Class Generator ---
  const themeClasses = {
    'soft-teal': {
      primary: 'text-emerald-700 bg-emerald-50',
      primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      accent: 'emerald',
      sidebarActive: 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600',
      headerAccent: 'border-emerald-100',
    },
    'soft-blue': {
      primary: 'text-blue-705 bg-blue-50',
      primaryBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
      accent: 'blue',
      sidebarActive: 'bg-blue-50 text-blue-800 border-l-4 border-blue-600',
      headerAccent: 'border-blue-100',
    },
    'sage-green': {
      primary: 'text-teal-800 bg-teal-50',
      primaryBtn: 'bg-teal-700 hover:bg-teal-850 text-white',
      accent: 'teal',
      sidebarActive: 'bg-teal-50 text-teal-900 border-l-4 border-teal-700',
      headerAccent: 'border-teal-100',
    },
    'soft-rose': {
      primary: 'text-rose-700 bg-rose-50',
      primaryBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
      accent: 'rose',
      sidebarActive: 'bg-rose-50 text-rose-800 border-l-4 border-rose-600',
      headerAccent: 'border-rose-100',
    },
  };

  const currentTheme = themeClasses[theme] || themeClasses['soft-teal'];

  // Side bar directories configurations filtered by permissions
  const pCheck = permissions.find((perm) => perm.role === currentRole) || permissions.find((perm) => perm.role === 'Pasien')!;

  const handleNavigateToRecordFromDirectID = (patientId: string) => {
    setActiveView('rekam-medis');
  };

  const dynamicCustomNavs = customMenus
    .filter((cm) => cm.permissions?.[currentRole]?.read)
    .map((cm) => ({
      id: cm.id,
      label: cm.label,
      icon: cm.isSub ? FolderTree : Sparkles,
      canAccess: true
    }));

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard Klinik', icon: LayoutDashboard, canAccess: true },
    { id: 'pendaftaran-mandiri', label: 'Pendaftaran Mandiri', icon: Ticket, canAccess: true },
    { id: 'antrean', label: 'Sistem Queue Antrean', icon: Clock, canAccess: pCheck.canViewQueues },
    { id: 'pasien', label: 'Daftar Pasien KIS', icon: Users, canAccess: pCheck.canManagePatients },
    { id: 'rekam-medis', label: 'Rekam Medis & Rujukan', icon: ClipboardList, canAccess: pCheck.canManageMedicalRecords },
    { id: 'jadwal-dokter', label: 'Jadwal Kerja Dokter', icon: Calendar, canAccess: true },
    { id: 'obat', label: 'Inventaris Depo Obat', icon: Layers, canAccess: pCheck.canManageInventory },
    { id: 'supplier', label: 'Supplier Rekanan', icon: Truck, canAccess: pCheck.canManageInventory },
    { id: 'pembelian', label: 'Pembelian Klinik (PO)', icon: ShoppingCart, canAccess: pCheck.canManageInventory },
    ...dynamicCustomNavs,
    { id: 'laporan', label: 'Laporan Audit & KPI', icon: FileBarChart, canAccess: pCheck.canManageFinance || currentRole === 'Admin' },
    { id: 'karyawan', label: 'Karyawan / Pegawai', icon: UserCheck, canAccess: pCheck.canManageEmployees },
    { id: 'bpjs-cek', label: 'Cek BPJS Kesehatan', icon: CreditCard, canAccess: true },
    { id: 'log', label: 'Log Aktivitas Sistem', icon: History, canAccess: currentRole === 'Admin' },
    { id: 'setelan', label: 'Pengaturan', icon: Settings, canAccess: currentRole === 'Admin' },
  ];

  if (isSelfRegistering) {
    return (
      <SelfRegistration
        patients={patients}
        doctors={doctors}
        queues={queues}
        onAddPatient={handleAddPatient}
        onAddQueue={handleAddQueue}
        onLogActivity={handleLogActivity}
        onBackToLogin={() => setIsSelfRegistering(false)}
      />
    );
  }

  if (!currentUser) {
    return (
      <Login
        employees={employees}
        onLoginSuccess={(emp) => {
          setCurrentUser(emp);
          setCurrentRole(emp.role);
          setActiveView('dashboard');
          handleLogActivity('Login', `Berhasil login ke portal sebagai ${emp.role}`);
        }}
        onGoToSelfRegister={() => setIsSelfRegistering(true)}
        clinicName={clinicProfile.name}
        clinicTagline={clinicProfile.tagline}
        logo={clinicProfile.logo}
      />
    );
  }

  return (
    <div id="clinic-app-shell" className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-800 flex flex-col">
      
      {/* Top Header navbar with Role Switcher */}
      <header className={`bg-white border-b ${currentTheme.headerAccent} h-16 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors md:hidden text-slate-600"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">{clinicProfile.logo.startsWith('data:') ? '🏥' : clinicProfile.logo}</span>
            <div>
              <h1 className="font-extrabold text-sm md:text-base tracking-tight text-slate-800 uppercase leading-none">{clinicProfile.name}</h1>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block mt-0.5">{clinicProfile.tagline}</p>
            </div>
          </div>
        </div>

        {/* Action Header: Active User and Logout */}
        <div className="flex items-center space-x-3">
          {currentUser && (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-black text-slate-750 leading-none">{currentUser.name}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentUser(null);
                  setIsSelfRegistering(false);
                  handleLogActivity('Logout', `Keluar dari sesi portal ${currentRole}`);
                }}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-650 rounded-xl border border-rose-100 flex items-center space-x-1.5 cursor-pointer text-xs font-bold transition-all"
                title="Keluar dari Sistem"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content body container */}
      <div className="flex grow">
        {/* Sidebar Left Navigation - Desktop & Mobile Drawer */}
        <aside
          className={`bg-white border-r border-slate-150 w-64 flex-col shrink-0 sticky top-16 h-[calc(100vh-64px)] hidden md:flex transition-transform z-30`}
        >
          <div className="flex-1 overflow-y-auto py-4 space-y-1">
            {navigationItems
              .filter((item) => item.canAccess)
              .map((item) => {
                const IconComp = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                    }}
                    className={`w-full px-5 py-3 text-left text-xs font-bold transition-all flex items-center space-x-3 ${
                      isActive
                        ? currentTheme.sidebarActive
                        : 'text-slate-550 hover:bg-slate-50/70 hover:text-slate-800'
                    }`}
                  >
                    <IconComp className={`h-4 w-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </div>

          {/* Sidebar Footer info */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/40 text-[10px] text-slate-400 leading-relaxed font-sans">
            <p className="font-semibold text-slate-500">Sistem Bridging KIS-BPJS v2.4</p>
            <p>Database LocalStorage Terintegrasi</p>
          </div>
        </aside>

        {/* Mobile sidebar overlay drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden flex">
            <div className="bg-white w-64 h-full flex flex-col justify-between py-6 relative">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-1.5 divide-y divide-slate-100 mt-6 px-1">
                {navigationItems
                  .filter((item) => item.canAccess)
                  .map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveView(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full px-5 py-3 text-left text-xs font-bold flex items-center space-x-3 ${
                          activeView === item.id
                            ? currentTheme.sidebarActive
                            : 'text-slate-550'
                        }`}
                      >
                        <IconComp className="h-4 w-4 text-slate-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
              </div>

              <div className="p-4 border-t text-[10px] text-slate-400">
                <p>Klinik Medika Mobile v2.0</p>
              </div>
            </div>
          </div>
        )}

        {/* Right Main Panel Workspace Wrapper */}
        <main className="grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all duration-300">
          {activeView === 'dashboard' && (
            <Dashboard
              patients={patients}
              queues={queues}
              medicines={medicines}
              transactions={transactions}
              activityLogs={activityLogs}
              doctors={doctors}
              currentRole={currentRole}
              onNavigateToView={(v) => setActiveView(v)}
            />
          )}

          {activeView === 'pendaftaran-mandiri' && (
            <SelfRegistration
              patients={patients}
              doctors={doctors}
              queues={queues}
              onAddPatient={handleAddPatient}
              onAddQueue={handleAddQueue}
              onLogActivity={handleLogActivity}
              onBackToLogin={() => setActiveView('dashboard')}
            />
          )}

          {activeView === 'antrean' && (
            <QueueSystem
              queues={queues}
              patients={patients}
              doctors={doctors}
              currentRole={currentRole}
              onAddQueue={handleAddQueue}
              onUpdateQueueStatus={handleUpdateQueueStatus}
              onLogActivity={handleLogActivity}
              medicalRecords={medicalRecords}
              medicines={medicines}
              permissions={permissions}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {activeView === 'pasien' && (
            <PatientList
              patients={patients}
              onAddPatient={handleAddPatient}
              onUpdatePatient={handleUpdatePatient}
              onLogActivity={handleLogActivity}
              onNavigateToRecord={handleNavigateToRecordFromDirectID}
            />
          )}

          {activeView === 'rekam-medis' && (
            <MedicalRecordsAndReferences
              medicalRecords={medicalRecords}
              referrals={referrals}
              patients={patients}
              doctors={doctors}
              medicines={medicines}
              currentRole={currentRole}
              onAddMedicalRecord={handleAddMedicalRecord}
              onLogActivity={handleLogActivity}
            />
          )}

          {activeView === 'jadwal-dokter' && (
            <DoctorSchedules
              doctors={doctors}
              queues={queues}
              currentRole={currentRole}
              onUpdateDoctorSchedule={handleUpdateDoctorSchedule}
              onLogActivity={handleLogActivity}
              patients={patients}
              medicines={medicines}
              medicalRecords={medicalRecords}
              onAddMedicalRecord={handleAddMedicalRecord}
              onUpdateQueueStatus={handleUpdateQueueStatus}
            />
          )}

          {activeView === 'obat' && (
            <MedicineInventory
              medicines={medicines}
              currentRole={currentRole}
              onAddMedicine={handleAddMedicine}
              onUpdateMedicine={handleUpdateMedicine}
              onLogActivity={handleLogActivity}
              medicineCategories={medicineCategories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              stockTransactions={stockTransactions}
              onAddStockTransaction={handleAddStockManualAdjustment}
            />
          )}

          {activeView === 'supplier' && (
            <SupplierManagement
              suppliers={suppliers}
              currentRole={currentRole}
              onAddSupplier={handleAddSupplier}
              onUpdateSupplier={handleUpdateSupplier}
              onDeleteSupplier={handleDeleteSupplier}
              onLogActivity={handleLogActivity}
            />
          )}

          {activeView === 'pembelian' && (
            <PurchaseManagement
              purchases={purchases}
              suppliers={suppliers}
              currentRole={currentRole}
              onAddPurchase={handleAddPurchase}
              onUpdatePurchase={handleUpdatePurchase}
              onDeletePurchase={handleDeletePurchase}
              onReceivePurchase={handleReceivePurchase}
              onLogActivity={handleLogActivity}
              medicines={medicines}
            />
          )}

          {activeView === 'laporan' && (
            <FinancialReports
              patients={patients}
              transactions={transactions}
              doctors={doctors}
              queues={queues}
              currentRole={currentRole}
              onAddTransaction={handleAddTransaction}
              onLogActivity={handleLogActivity}
            />
          )}

          {activeView === 'karyawan' && (
            <EmployeeList
              employees={employees}
              currentRole={currentRole}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onLogActivity={handleLogActivity}
            />
          )}

          {activeView === 'bpjs-cek' && (
            <BPJSChecker
              patients={patients}
              onUpdatePatientBpjs={handleUpdatePatientBpjs}
            />
          )}

          {activeView === 'log' && (
            <ActivityLogView
              logs={activityLogs}
            />
          )}

          {activeView === 'setelan' && (
            <ClinicSettings
              profile={clinicProfile}
              permissions={permissions}
              theme={theme}
              onChangeProfile={setClinicProfile}
              onChangeTheme={setTheme}
              onChangePermissions={setPermissions}
              onLogActivity={handleLogActivity}
              doctors={doctors}
              onUpdateDoctors={setDoctors}
            />
          )}


        </main>
      </div>

      {/* Floating alert for critical medicines warning */}
      {medicines.filter(m => m.stock <= m.minStock).length > 0 && activeView !== 'obat' && (
        <div className="fixed bottom-4 right-4 bg-amber-500 hover:bg-amber-600 text-white font-bold p-3.5 rounded-xl shadow-lg border border-amber-600 flex items-center space-x-2.5 z-50 cursor-pointer text-xs transition-transform hover:-translate-y-0.5" onClick={() => setActiveView('obat')}>
          <ShieldAlert className="h-4 w-4 animate-bounce" />
          <span>{medicines.filter(m => m.stock <= m.minStock).length} Obat Kritis Sebaiknya Restock</span>
        </div>
      )}
    </div>
  );
}

export type RoleType = 'Admin' | 'Dokter' | 'Perawat' | 'Apoteker' | 'Kasir' | 'Pasien';

export interface Patient {
  id: string;
  name: string;
  nik: string;
  bpjsNumber?: string;
  type: 'Umum' | 'BPJS';
  gender: 'Laki-laki' | 'Perempuan';
  birthDate: string;
  phone: string;
  address: string;
  registerDate: string;
  bpjsStatus?: 'Aktif' | 'Tidak Aktif' | 'Tidak Ditemukan' | 'Belum Dicek';
  bpjsClass?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialist: string;
  sip: string;
  room: string;
  onDuty: boolean;
  schedule: {
    Senin?: string;
    Selasa?: string;
    Rabu?: string;
    Kamis?: string;
    Jumat?: string;
    Sabtu?: string;
    Minggu?: string;
  };
}

export interface Employee {
  id: string;
  name: string;
  nip: string;
  role: RoleType;
  email: string;
  phone: string;
  status: 'Aktif' | 'Cuti' | 'Nonaktif';
  password?: string;
}

export interface Queue {
  id: string;
  queueNumber: string; // e.g., A-01, B-05
  patientId: string;
  patientName: string;
  patientType: 'Umum' | 'BPJS';
  doctorId: string;
  doctorName: string;
  room: string;
  status: 'Menunggu Pendaftaran' | 'Menunggu' | 'Diperiksa' | 'Menunggu Kasir' | 'Menunggu Obat' | 'Selesai' | 'Batal';
  datetime: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  complaints: string; // Keluhan Utama
  physicalExam: {
    bloodPressure: string; // Tensi Darah (mmHg)
    temperature: number; // Suhu (°C)
    pulseRate: number; // Nadi (x/mnt)
    weight: number; // Berat Badan (kg)
  };
  diagnosis: string;
  treatment: string; // Tindakan
  prescribedMeds: Array<{
    id: string;
    name: string;
    qty: number;
    usage: string;
    isNotAvailable?: boolean;
  }>;
  referralId?: string; // ID rujukan jika dirujuk
  doctorCertificate?: {
    type: 'Sakit' | 'Sehat';
    sickLeave?: {
      startDate: string;
      endDate: string;
      durationDays: number;
      reason: string;
    };
    healthCert?: {
      purpose: string;
      colorBlind: 'Ya' | 'Tidak';
      bloodType: string;
      height: number;
    };
  };
}

export interface ReferralLetter {
  id: string;
  medicalRecordId: string;
  patientId: string;
  patientName: string;
  patientNik: string;
  patientBpjsNumber?: string;
  gender: string;
  birthDate: string;
  diagnosis: string;
  destinationHospital: string;
  targetSpecialist: string;
  notes: string;
  dateIssued: string;
  doctorSignName: string;
  doctorSip: string;
  queueNumberUsed?: string;
}

export interface Medicine {
  id: string;
  name: string;
  code: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  price: number;
  expiryDate: string;
  type: 'Obat' | 'Non Obat';
}

export interface StockTransaction {
  id: string;
  medicineId: string;
  medicineName: string;
  type: 'Stok Masuk' | 'Stok Keluar';
  qty: number;
  date: string;
  reference: string;
  notes?: string;
  balanceAfter: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  itemsDescription: string;
  taxType: 'Non PPn' | 'Include' | 'Exclude';
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  category: string;
  medicineId?: string;
  qty?: number;
  receivedQty?: number;
  receiveStatus?: 'Pending' | 'Partial' | 'Closed';
  paymentStatus?: 'Hutang' | 'Bayar Lunas';
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  type: 'Uang Masuk' | 'Uang Keluar';
  category: string;
  amount: number;
  date: string;
  description: string;
  payerOrPayee: string; // Nama Pembayar / Penerima
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: RoleType;
  action: string;
  details: string;
  timestamp: string;
}

export interface ClinicProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string; // Base64 or image URL/emoji
}

export interface RolePermission {
  [key: string]: any;
  role: RoleType;
  description: string;
  canManagePatients: boolean;
  canManageMedicalRecords: boolean;
  canManageSchedules: boolean;
  canManageInventory: boolean;
  canManageFinance: boolean;
  canManageEmployees: boolean;
  canViewQueues: boolean;
  canCallQueues: boolean;

  // New Menu and Submenu Permissions for full RBAC matrix
  canViewDashboard: boolean;
  canViewPatientsList: boolean;
  canViewMedicalRecordsAndReferrals: boolean;
  canViewDoctorSchedules: boolean;
  canViewMedicineInventory: boolean;
  canViewFinancialReports: boolean;
  canViewEmployeeList: boolean;
  canViewBPJSChecker: boolean;
  canViewActivityLog: boolean;
  canViewClinicSettings: boolean;

  // Submenus
  canManagePendaftaranQueue: boolean; // Pendaftaran & Pengecekan
  canManageKasirQueue: boolean;       // Kasir queue
  canManageObatQueue: boolean;        // Obat queue
  canViewMonitorTVLobby: boolean;     // TV monitor submenu
  canManageClinicProfileAndLogo: boolean;
  canManageThemeColorSchema: boolean;
  canManageRoleAccessMatrix: boolean;
  canManageQueueSetup: boolean;       // New doctor/room management submenu
}

export type ThemeColor = 'soft-teal' | 'soft-blue' | 'sage-green' | 'soft-rose';

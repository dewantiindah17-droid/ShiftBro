export type Role = "pegawai" | "manager" | "owner";

export interface User {
  id: string;
  nama: string;
  role: Role;
  posisi: string;
  outlet: string;
  nip?: string;
  kodeOutlet?: string;
  email?: string;
  noHp?: string;
  shiftHariIni?: string;
  shiftBertugas?: string;
  status?: string;
  tingkatKeamanan?: string;
}

export interface ShiftItem {
  id: number;
  hari: string;
  pegawai: string;
  peran: string;
  mulai: string;
  selesai: string;
}

export interface InvoiceItem {
  id: string;
  periode: string;
  jumlah: number;
  status: "lunas" | "belum bayar";
  jatuhTempo?: string;
  tglBayar?: string;
}

"use client";

import React, { useState } from "react";
import { User, InvoiceItem } from "@/types/auth";
import {
  TrendingUp,
  DollarSign,
  Users,
  CalendarCheck,
  FileText,
  Download,
  CheckCircle,
  CreditCard,
  LogOut,
  ShieldCheck,
  Building,
  Sparkles,
} from "lucide-react";

interface DashboardOwnerProps {
  user: User;
  authMethod: string;
  onLogout: () => void;
  onToast: (title: string, desc: string, type?: "success" | "error") => void;
}

export default function DashboardOwner({
  user,
  authMethod,
  onLogout,
  onToast,
}: DashboardOwnerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "billing" | "recap">("overview");

  // Invoices state
  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    { id: "INV-2026-10", periode: "2026-10", jumlah: 450000, status: "belum bayar", jatuhTempo: "25 Okt 2026" },
    { id: "INV-2026-09", periode: "2026-09", jumlah: 450000, status: "lunas", tglBayar: "24 Sep 2026" },
    { id: "INV-2026-08", periode: "2026-08", jumlah: 450000, status: "lunas", tglBayar: "25 Agu 2026" },
  ]);

  const handleMarkPaid = (invId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invId ? { ...inv, status: "lunas" as const } : inv))
    );
    onToast("Invoice Diperbarui", `Invoice ${invId} berhasil ditandai Lunas.`, "success");
  };

  const handleExportCsv = () => {
    onToast("Export CSV Berhasil", "Mengunduh berkas 'rekap-kehadiran-kopi-harmoni-okt2026.csv'.", "success");
  };

  return (
    <div className="space-y-6">
      {/* Top Header Outlet & Executive Identity */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E4E1D6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-[#0F2A43]">
              Dasbor Operasional & Finansial Owner
            </h2>
            <span className="bg-[#D7F0EA] text-[#0B6E5C] text-xs font-bold px-2.5 py-0.5 rounded-full">
              Outlet Aktif
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Eksekutif: <strong className="text-[#0F2A43]">{user.nama}</strong> · Outlet:{" "}
            <strong className="text-[#0F2A43]">Kopi Harmoni (Yogyakarta)</strong> · Paket Bertumbuh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1.5 touch-target"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </div>

      {/* Security Level Verification Tag */}
      <div className="px-4 py-2 rounded-xl bg-[#0F2A43] text-white text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2C9B8A]" />
          Akses Terverifikasi: <strong>{authMethod}</strong>
        </span>
        <span className="font-mono text-[10px] text-slate-300">
          Enkripsi TLS 256-Bit Aktif · Lokasi IP: Yogyakarta
        </span>
      </div>

      {/* 5 KARTU STATISTIK FINANSIAL & OPERASIONAL */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Aktivasi */}
        <div className="bg-white p-4 rounded-2xl border border-[#E4E1D6] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-[#6B7280] tracking-wider">
            Aktivasi Mingguan
          </span>
          <div className="my-2">
            <span className="text-2xl font-black text-[#2C9B8A] tabular-nums">50%</span>
            <p className="text-[11px] text-[#6B7280]">Pegawai check-in ≥1x</p>
          </div>
        </div>

        {/* 2. Kehadiran Hari Ini */}
        <div className="bg-white p-4 rounded-2xl border border-[#E4E1D6] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-[#6B7280] tracking-wider">
            Kehadiran Hari Ini
          </span>
          <div className="my-2">
            <span className="text-2xl font-black text-[#2C9B8A] tabular-nums">4</span>
            <p className="text-[11px] text-[#6B7280]">Shift aktif berjalan</p>
          </div>
        </div>

        {/* 3. Retensi Bayar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E4E1D6] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-[#6B7280] tracking-wider">
            Retensi Bayar
          </span>
          <div className="my-2">
            <span className="text-2xl font-black text-[#2C9B8A] tabular-nums">67%</span>
            <p className="text-[11px] text-[#6B7280]">Invoice lunas / total</p>
          </div>
        </div>

        {/* 4. Total MRR */}
        <div className="bg-white p-4 rounded-2xl border border-[#E4E1D6] shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-[#6B7280] tracking-wider">
            Total MRR Aktif
          </span>
          <div className="my-2">
            <span className="text-xl font-black text-[#0F2A43] tabular-nums">Rp1.350.000</span>
            <p className="text-[11px] text-[#6B7280]">3 periode langganan</p>
          </div>
        </div>

        {/* 5. Estimasi Penghematan Bulanan */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-white to-[#D7F0EA]/30 p-4 rounded-2xl border-2 border-[#2C9B8A]/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-[#0F2A43] tracking-wider">
              Estimasi Penghematan
            </span>
            <span className="text-[9px] font-bold text-[#0B6E5C] bg-[#D7F0EA] px-1.5 py-0.2 rounded-full">
              +18% efisiensi
            </span>
          </div>
          <div className="my-2">
            <span className="text-xl font-black text-[#2C9B8A] tabular-nums">
              Rp1.200.000 <span className="text-xs font-semibold text-[#0F2A43]">/bln</span>
            </span>
            <p className="text-[10px] text-[#6B7280] leading-snug">
              Cegah lembur tak terverifikasi
            </p>
          </div>
        </div>
      </div>

      {/* SUB-TABS INTERACTIVE */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === "overview"
              ? "bg-[#0F2A43] text-white shadow-xs"
              : "text-[#6B7280] hover:text-[#0F2A43]"
          }`}
        >
          Aktivitas Hari Ini
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === "billing"
              ? "bg-[#0F2A43] text-white shadow-xs"
              : "text-[#6B7280] hover:text-[#0F2A43]"
          }`}
        >
          Tagihan & MRR
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("recap")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === "recap"
              ? "bg-[#0F2A43] text-white shadow-xs"
              : "text-[#6B7280] hover:text-[#0F2A43]"
          }`}
        >
          Rekap Kehadiran
        </button>
      </div>

      {/* ========================================= */}
      {/* TAB 1: OVERVIEW & AKTIVITAS TERAKHIR      */}
      {/* ========================================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shift Hari Ini */}
          <div className="bg-white rounded-2xl p-5 border border-[#E4E1D6] shadow-xs">
            <h3 className="text-sm font-bold text-[#0F2A43] mb-1">Shift Berjalan Hari Ini</h3>
            <p className="text-xs text-[#6B7280] mb-3">Kamis, 16 Oktober 2026</p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#F4F2EA] border border-[#E4E1D6]">
                <span className="text-[11px] font-bold text-[#0F2A43] block">
                  Shift Pagi (07:00 - 15:00) · 2 Staf
                </span>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded text-[#0B6E5C] border border-[#E4E1D6]">
                    ● Joko (Barista)
                  </span>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded text-[#0B6E5C] border border-[#E4E1D6]">
                    ● Ningsih (Kasir)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F2EA] border border-[#E4E1D6]">
                <span className="text-[11px] font-bold text-[#0F2A43] block">
                  Shift Sore (15:00 - 23:00) · 2 Staf
                </span>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded text-[#2C6079] border border-[#E4E1D6]">
                    ● Putra (Barista)
                  </span>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded text-[#0F2A43] border border-[#E4E1D6]">
                    ● Rina (Manager)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Log Kehadiran Realtime */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E4E1D6] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#0F2A43]">Log Kehadiran Pegawai Real-time</h3>
              <span className="text-xs text-[#2C9B8A] font-bold">Live Synced</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F2EA] text-[#0F2A43] font-bold border-b border-[#E4E1D6]">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-lg">Pegawai</th>
                    <th className="py-2.5 px-3">Peran</th>
                    <th className="py-2.5 px-3">Jam Masuk</th>
                    <th className="py-2.5 px-3">Jam Keluar</th>
                    <th className="py-2.5 px-3 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E1D6]">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-[#0F2A43]">Joko</td>
                    <td className="py-2.5 px-3 text-[#6B7280]">Barista</td>
                    <td className="py-2.5 px-3 font-mono font-medium">06:58</td>
                    <td className="py-2.5 px-3 text-[#6B7280] font-mono">— (Aktif)</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D7F0EA] text-[#0B6E5C]">
                        hadir
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-[#0F2A43]">Ningsih</td>
                    <td className="py-2.5 px-3 text-[#6B7280]">Kasir</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-[#B03A00]">07:18</td>
                    <td className="py-2.5 px-3 text-[#6B7280] font-mono">— (Aktif)</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FCE8D8] text-[#B03A00]">
                        telat (+18m)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-[#0F2A43]">Rina</td>
                    <td className="py-2.5 px-3 text-[#6B7280]">Manager</td>
                    <td className="py-2.5 px-3 font-mono font-medium">07:00</td>
                    <td className="py-2.5 px-3 font-mono">15:02</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D7F0EA] text-[#0B6E5C]">
                        hadir
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-[#0F2A43]">Putra</td>
                    <td className="py-2.5 px-3 text-[#6B7280]">Barista</td>
                    <td className="py-2.5 px-3 font-mono font-medium">14:55</td>
                    <td className="py-2.5 px-3 text-[#6B7280] font-mono">— (Shift Sore)</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D7F0EA] text-[#0B6E5C]">
                        hadir
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* TAB 2: TAGIHAN & MRR OUTLET               */}
      {/* ========================================= */}
      {activeTab === "billing" && (
        <div className="bg-white rounded-2xl p-5 border border-[#E4E1D6] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4E1D6] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F2A43]">Tagihan & Rekapitulasi MRR</h3>
              <p className="text-xs text-[#2C6079] font-medium">
                Kopi Harmoni · Paket Bertumbuh · Rp450.000 / bulan
              </p>
            </div>
            <span className="text-xs bg-[#D7F0EA] text-[#0B6E5C] font-bold px-3 py-1 rounded-full self-start sm:self-auto">
              Langganan Aktif s/d Nov 2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F2EA] text-[#0F2A43] font-bold border-b border-[#E4E1D6]">
                <tr>
                  <th className="py-3 px-3 rounded-l-lg">Periode</th>
                  <th className="py-3 px-3">Deskripsi Layanan</th>
                  <th className="py-3 px-3">Jumlah</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right rounded-r-lg">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E1D6]">
                {invoices.map((inv) => {
                  const isPaid = inv.status === "lunas";
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-[#0F2A43]">{inv.periode}</td>
                      <td className="py-3 px-3 text-[#6B7280]">Paket Bertumbuh (5 pegawai)</td>
                      <td className="py-3 px-3 font-bold text-[#0F2A43] tabular-nums">
                        Rp{inv.jumlah.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? "bg-[#D7F0EA] text-[#0B6E5C]"
                              : "bg-[#FCE8D8] text-[#B03A00]"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isPaid ? (
                          <span className="text-xs text-[#0B6E5C] font-bold flex items-center justify-end gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Terbayar
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(inv.id)}
                            className="bg-[#2C9B8A] hover:bg-[#237c6e] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs touch-target"
                          >
                            Tandai Lunas
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* TAB 3: REKAP KEHADIRAN & EKSPOR CSV       */}
      {activeTab === "recap" && (
        <div className="bg-white rounded-2xl p-5 border border-[#E4E1D6] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#0F2A43]">Rekapitulasi Jam Kerja & Disiplin Pegawai</h3>
              <p className="text-xs text-[#6B7280]">Periode: 13–19 Okt 2026 · Kopi Harmoni</p>
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              className="bg-[#F2A33A] hover:bg-[#e09129] text-[#0F2A43] font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs touch-target"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F2EA] text-[#0F2A43] font-bold border-b border-[#E4E1D6]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Nama Pegawai</th>
                  <th className="py-2.5 px-3">Peran</th>
                  <th className="py-2.5 px-3 text-center">Jadwal Hari</th>
                  <th className="py-2.5 px-3 text-center">Hadir</th>
                  <th className="py-2.5 px-3 text-center">Absen</th>
                  <th className="py-2.5 px-3 text-center rounded-r-lg">Lembur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E1D6]">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0F2A43]">Joko</td>
                  <td className="py-3 px-3 text-[#6B7280]">Barista</td>
                  <td className="py-3 px-3 text-center font-bold">5</td>
                  <td className="py-3 px-3 text-center text-[#0B6E5C] font-bold">4</td>
                  <td className="py-3 px-3 text-center text-[#6B7280]">0</td>
                  <td className="py-3 px-3 text-center font-bold text-[#2C9B8A]">+2.5 Jam</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0F2A43]">Putra</td>
                  <td className="py-3 px-3 text-[#6B7280]">Barista</td>
                  <td className="py-3 px-3 text-center font-bold">4</td>
                  <td className="py-3 px-3 text-center text-[#0B6E5C] font-bold">4</td>
                  <td className="py-3 px-3 text-center text-[#6B7280]">0</td>
                  <td className="py-3 px-3 text-center text-[#6B7280]">0 Jam</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0F2A43]">Ningsih</td>
                  <td className="py-3 px-3 text-[#6B7280]">Kasir</td>
                  <td className="py-3 px-3 text-center font-bold">4</td>
                  <td className="py-3 px-3 text-center text-[#0B6E5C] font-bold">3</td>
                  <td className="py-3 px-3 text-center text-[#B03A00] font-bold">1 (Telat)</td>
                  <td className="py-3 px-3 text-center text-[#6B7280]">0 Jam</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-[#0F2A43]">Rina</td>
                  <td className="py-3 px-3 text-[#6B7280]">Manager</td>
                  <td className="py-3 px-3 text-center font-bold">5</td>
                  <td className="py-3 px-3 text-center text-[#0B6E5C] font-bold">4</td>
                  <td className="py-3 px-3 text-center text-[#6B7280]">0</td>
                  <td className="py-3 px-3 text-center font-bold text-[#2C9B8A]">+4.0 Jam</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

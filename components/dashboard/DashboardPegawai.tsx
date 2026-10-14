"use client";

import React, { useState } from "react";
import { User } from "@/types/auth";
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRightLeft,
  LogOut,
  Coffee,
  Check,
  Shield,
  Smartphone,
} from "lucide-react";

interface DashboardPegawaiProps {
  user: User;
  authMethod: string;
  onLogout: () => void;
  onToast: (title: string, desc: string, type?: "success" | "error") => void;
}

export default function DashboardPegawai({
  user,
  authMethod,
  onLogout,
  onToast,
}: DashboardPegawaiProps) {
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [clockInTime, setClockInTime] = useState("06:58 WIB");
  const [clockOutTime, setClockOutTime] = useState("");
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedShiftForSwap, setSelectedShiftForSwap] = useState<string | null>(null);
  const [swapTarget, setSwapTarget] = useState("Putra (Barista)");
  const [swapReason, setSwapReason] = useState("");

  const handleToggleClock = () => {
    if (isClockedIn) {
      // Clock Out
      setIsClockedIn(false);
      setClockOutTime("15:02 WIB");
      onToast("Clock-Out Berhasil", "Terima kasih atas kerja keras hari ini! Jam kerja tersimpan.", "success");
    } else {
      // Clock In
      setIsClockedIn(true);
      setClockInTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB");
      onToast("Clock-In Berhasil", "Selamat bertugas! Status kehadiran tercatat 'Hadir Tepat Waktu'.", "success");
    }
  };

  const openSwapModal = (shiftName: string) => {
    setSelectedShiftForSwap(shiftName);
    setIsSwapModalOpen(true);
  };

  const handleSendSwap = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSwapModalOpen(false);
    onToast(
      "Permintaan Tukar Shift Terkirim",
      `Mengajukan tukar shift ${selectedShiftForSwap} dengan ${swapTarget}. Menunggu persetujuan Manager Shift.`,
      "success"
    );
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Mobile Top Profile Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E4E1D6] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2C9B8A] to-[#1E3E5C] text-white flex items-center justify-center font-black text-sm shadow-xs">
            {user.nama[0]}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-[#0F2A43]">{user.nama}</h3>
              <span className="text-[10px] bg-[#D7F0EA] text-[#0B6E5C] font-bold px-1.5 py-0.2 rounded">
                {user.posisi}
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280]">
              NIP: <span className="font-mono text-[#0F2A43] font-bold">{user.nip || "JK-01"}</span> · {user.outlet}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="p-2 rounded-xl text-[#6B7280] hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors touch-target flex items-center justify-center"
          title="Keluar Sesi"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Auth Method Verification Badge */}
      <div className="px-3.5 py-1.5 rounded-xl bg-[#D7F0EA]/60 border border-[#2C9B8A]/30 text-[11px] text-[#0B6E5C] flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <Shield className="w-3.5 h-3.5 text-[#2C9B8A]" />
          Masuk via: <strong>{authMethod}</strong>
        </span>
        <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded shadow-xs">
          POV: KARYAWAN PWA
        </span>
      </div>

      {/* MAIN CLOCK-IN / CLOCK-OUT CARD */}
      <div className="bg-white rounded-3xl p-5 border border-[#E4E1D6] shadow-sm text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
          Presensi Mandiri Hari Ini (Kamis, 16 Okt)
        </span>
        <div className="text-xs font-semibold text-[#0F2A43] mb-4">
          Shift Pagi: 07:00 – 15:00 WIB · Stasiun Barista
        </div>

        {/* Primary Large Touch Button (Teal #2C9B8A) */}
        <button
          type="button"
          onClick={handleToggleClock}
          className={`w-full py-4 px-6 rounded-2xl text-sm font-black transition-all shadow-md touch-target touch-press flex items-center justify-center gap-2 mb-3 ${
            isClockedIn
              ? "bg-[#1E3E5C] hover:bg-[#0F2A43] text-white"
              : "bg-[#2C9B8A] hover:bg-[#237c6e] text-white"
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>{isClockedIn ? "Clock-Out Selesai Shift" : "Clock-In Sekarang"}</span>
        </button>

        {/* Status Verification Feedback */}
        <div className="p-3 rounded-xl bg-[#F4F2EA] border border-[#E4E1D6] text-left flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-[#D7F0EA] text-[#0B6E5C] flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
          <div className="text-[11px] text-[#0F2A43] leading-snug">
            {isClockedIn ? (
              <p>
                <strong>Shift Sedang Berlangsung.</strong> Clock-in tercatat pukul{" "}
                <span className="font-mono font-bold text-[#0B6E5C]">{clockInTime}</span>. Lokasi GPS terverifikasi di area kedai Kopi Harmoni.
              </p>
            ) : (
              <p>
                <strong>Shift Selesai.</strong> Clock-out tercatat pukul{" "}
                <span className="font-mono font-bold">{clockOutTime}</span>. Jam kerja harian Anda tersimpan rapi tanpa perlu aplikasi terpisah.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SHIFT SAYA MINGGU INI (DENGAN TOMBOL TUKAR SHIFT) */}
      <div className="bg-white rounded-2xl p-4 border border-[#E4E1D6] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-[#0F2A43] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#2C9B8A]" />
            Shift Saya Minggu Ini
          </h4>
          <span className="text-[10px] font-bold text-[#2C9B8A] bg-[#D7F0EA] px-2 py-0.5 rounded-full">
            4 Hari Terjadwal
          </span>
        </div>

        <div className="space-y-2">
          {[
            { hari: "Kamis, 16 Okt", jam: "07:00 - 15:00", peran: "Barista", isToday: true },
            { hari: "Jumat, 17 Okt", jam: "07:00 - 15:00", peran: "Barista", isToday: false },
            { hari: "Sabtu, 18 Okt", jam: "15:00 - 23:00", peran: "Barista", isToday: false },
            { hari: "Minggu, 19 Okt", jam: "15:00 - 23:00", peran: "Barista", isToday: false },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                item.isToday
                  ? "border-[#F2A33A] bg-[#FCE8D8]/20"
                  : "border-[#E4E1D6] bg-[#F4F2EA]/40"
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#0F2A43]">{item.hari}</span>
                  {item.isToday && (
                    <span className="text-[9px] font-black bg-[#F2A33A] text-white px-1.5 py-0.2 rounded">
                      HARI INI
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#6B7280] font-mono block mt-0.5">
                  {item.jam} · {item.peran}
                </span>
              </div>

              <button
                type="button"
                onClick={() => openSwapModal(`${item.hari} (${item.jam})`)}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F2A33A] hover:text-[#0F2A43] text-[#B03A00] border border-[#E4E1D6] font-bold text-[10px] shadow-xs transition-colors flex items-center gap-1 touch-target"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Tukar</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RIWAYAT PRESENSI BULAN INI */}
      <div className="bg-white rounded-2xl p-4 border border-[#E4E1D6] shadow-xs">
        <h4 className="text-xs font-bold text-[#0F2A43] mb-2.5">Riwayat Kehadiran Terbaru</h4>
        <div className="divide-y divide-[#E4E1D6] text-[11px]">
          <div className="py-2 flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#0F2A43]">Rabu, 15 Okt 2026</span>
              <span className="text-[10px] text-[#6B7280] font-mono block">06:58 - 15:04 WIB (8 Jam)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D7F0EA] text-[#0B6E5C]">
              hadir
            </span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#0F2A43]">Selasa, 14 Okt 2026</span>
              <span className="text-[10px] text-[#6B7280] font-mono block">07:02 - 15:00 WIB (8 Jam)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D7F0EA] text-[#0B6E5C]">
              hadir
            </span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#0F2A43]">Senin, 13 Okt 2026</span>
              <span className="text-[10px] text-[#6B7280] font-mono block">06:55 - 15:30 WIB (+30m Lembur)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D7F0EA] text-[#0B6E5C]">
              hadir + lembur
            </span>
          </div>
        </div>
      </div>

      {/* MODAL PENGAJUAN TUKAR SHIFT */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F2A43]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-[#E4E1D6] shadow-2xl p-5 space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E4E1D6] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F2A33A] text-[#0F2A43] flex items-center justify-center font-bold text-xs">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-[#0F2A43]">
                  Pengajuan Tukar Shift
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsSwapModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F4F2EA] border border-[#E4E1D6] text-xs">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                Shift yang ingin ditukar:
              </span>
              <p className="font-bold text-[#0F2A43] mt-0.5">{selectedShiftForSwap}</p>
            </div>

            <form onSubmit={handleSendSwap} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0F2A43] mb-1">
                  Pilih Rekan Kerja Pengganti:
                </label>
                <select
                  value={swapTarget}
                  onChange={(e) => setSwapTarget(e.target.value)}
                  className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F2A43]"
                >
                  <option value="Putra (Barista)">Putra — Barista Shift Sore</option>
                  <option value="Ningsih (Kasir)">Ningsih — Kasir</option>
                  <option value="Rina (Manager)">Rina — Supervisor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2A43] mb-1">
                  Alasan Singkat (Opsional):
                </label>
                <input
                  type="text"
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  placeholder="Contoh: Ada acara keluarga mendadak"
                  className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs text-[#0F2A43]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSwapModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E4E1D6] text-xs font-bold text-[#6B7280]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2.5 rounded-xl bg-[#2C9B8A] hover:bg-[#237c6e] text-white text-xs font-bold shadow-md"
                >
                  Kirim Permintaan ke Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

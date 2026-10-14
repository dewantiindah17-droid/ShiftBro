"use client";

import React, { useState } from "react";
import { User, ShiftItem } from "@/types/auth";
import {
  Calendar,
  Plus,
  Send,
  AlertTriangle,
  Clock,
  Users,
  LogOut,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface DashboardManagerProps {
  user: User;
  authMethod: string;
  onLogout: () => void;
  onToast: (title: string, desc: string, type?: "success" | "error") => void;
}

export default function DashboardManager({
  user,
  authMethod,
  onLogout,
  onToast,
}: DashboardManagerProps) {
  // Weekly shifts state
  const [shifts, setShifts] = useState<ShiftItem[]>([
    { id: 1, hari: "Senin", pegawai: "Joko", peran: "Barista", mulai: "07:00", selesai: "15:00" },
    { id: 2, hari: "Senin", pegawai: "Ningsih", peran: "Kasir", mulai: "07:00", selesai: "15:00" },
    { id: 3, hari: "Senin", pegawai: "Putra", peran: "Barista", mulai: "15:00", selesai: "23:00" },
    { id: 4, hari: "Senin", pegawai: "Rina", peran: "Manager", mulai: "15:00", selesai: "23:00" },
    { id: 5, hari: "Selasa", pegawai: "Joko", peran: "Barista", mulai: "07:00", selesai: "15:00" },
    { id: 6, hari: "Selasa", pegawai: "Ningsih", peran: "Kasir", mulai: "07:00", selesai: "15:00" },
    { id: 7, hari: "Rabu", pegawai: "Putra", peran: "Barista", mulai: "07:00", selesai: "15:00" },
    { id: 8, hari: "Rabu", pegawai: "Ningsih", peran: "Kasir", mulai: "07:00", selesai: "15:00" },
    { id: 9, hari: "Kamis", pegawai: "Joko", peran: "Barista", mulai: "07:00", selesai: "15:00" },
    { id: 10, hari: "Kamis", pegawai: "Ningsih", peran: "Kasir", mulai: "07:00", selesai: "15:00" },
    { id: 11, hari: "Kamis", pegawai: "Putra", peran: "Barista", mulai: "15:00", selesai: "23:00" },
    { id: 12, hari: "Kamis", pegawai: "Rina", peran: "Manager", mulai: "15:00", selesai: "23:00" },
    { id: 13, hari: "Jumat", pegawai: "Joko", peran: "Barista", mulai: "07:00", selesai: "15:00" },
    { id: 14, hari: "Jumat", pegawai: "Putra", peran: "Barista", mulai: "15:00", selesai: "23:00" },
    { id: 15, hari: "Sabtu", pegawai: "Joko", peran: "Barista", mulai: "07:00", selesai: "15:00" },
    { id: 16, hari: "Sabtu", pegawai: "Ningsih", peran: "Kasir", mulai: "07:00", selesai: "15:00" },
    { id: 17, hari: "Sabtu", pegawai: "Putra", peran: "Barista", mulai: "15:00", selesai: "23:00" },
    { id: 18, hari: "Minggu", pegawai: "Joko", peran: "Barista", mulai: "07:00", selesai: "15:00" },
    { id: 19, hari: "Minggu", pegawai: "Rina", peran: "Manager", mulai: "07:00", selesai: "15:00" },
    { id: 20, hari: "Minggu", pegawai: "Putra", peran: "Barista", mulai: "15:00", selesai: "23:00" },
  ]);

  // Form state
  const [pegawai, setPegawai] = useState("Joko");
  const [hari, setHari] = useState("Kamis");
  const [peran, setPeran] = useState("Barista");
  const [mulai, setMulai] = useState("08:00");
  const [selesai, setSelesai] = useState("16:00");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Emergency Modal
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("Joko — Barista (Shift Pagi 07:00 - 15:00, Hari Ini)");

  const daysList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  // Add shift with validation
  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (selesai <= mulai) {
      setErrorMsg(`Jam selesai (${selesai}) harus lebih besar dari jam mulai (${mulai})!`);
      return;
    }

    // Check collision for same employee on same day
    const clash = shifts.find(
      (s) => s.hari === hari && s.pegawai === pegawai && (mulai < s.selesai && selesai > s.mulai)
    );

    if (clash) {
      setErrorMsg(`Jadwal Bentrok: ${pegawai} sudah terjadwal di hari ${hari} (${clash.mulai} - ${clash.selesai})!`);
      return;
    }

    const newShift: ShiftItem = {
      id: Date.now(),
      hari,
      pegawai,
      peran,
      mulai,
      selesai,
    };

    setShifts((prev) => [...prev, newShift]);
    onToast("Shift Ditambahkan", `${pegawai} terjadwal hari ${hari} (${mulai} - ${selesai}).`, "success");
  };

  // Publish to WhatsApp
  const handlePublishWA = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      onToast("Terkirim ke WhatsApp!", "Roster resmi berhasil disiarkan ke grup 'Tim Kopi Harmoni' via Gateway WA.", "success");
    }, 1000);
  };

  // Broadcast Emergency
  const handleBroadcastEmergency = () => {
    setIsEmergencyModalOpen(false);
    onToast(
      "Panggilan Darurat Terkirim ke WhatsApp Grup!",
      "Pesan broadcast prioritas tinggi telah dikirim ke 5 anggota tim lepas piket.",
      "success"
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Operational Supervisor */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E4E1D6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-[#0F2A43]">
              Konsol Manajemen Shift Kafe
            </h2>
            <span className="bg-[#1E3E5C] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Supervisor Active
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Supervisor: <strong className="text-[#0F2A43]">{user.nama}</strong> ({user.id}) · {user.outlet}
          </p>
        </div>

        {/* Action Buttons: Darurat + Terbitkan WA + Logout */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEmergencyModalOpen(true)}
            className="bg-[#BA1A1A] hover:bg-[#9a1414] text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 touch-target touch-press"
          >
            <span>🚨</span>
            <span>Cari Pengganti Darurat</span>
          </button>

          <button
            type="button"
            onClick={handlePublishWA}
            disabled={isPublishing}
            className="bg-[#F2A33A] hover:bg-[#e09129] text-[#0F2A43] font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 touch-target touch-press"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPublishing ? "Menyiarkan..." : "Terbitkan via WA"}</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="p-2.5 rounded-xl text-[#6B7280] hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors touch-target flex items-center justify-center"
            title="Keluar Sesi Manager"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Auth Method Banner */}
      <div className="px-4 py-2 rounded-xl bg-[#1E3E5C]/10 border border-[#1E3E5C]/20 text-xs text-[#0F2A43] flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#1E3E5C]" />
          Metode Otentikasi: <strong>{authMethod}</strong> (ID & Passcode Supervisor)
        </span>
        <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded shadow-xs font-bold text-[#1E3E5C]">
          POV: MANAGER SHIFT
        </span>
      </div>

      {/* FORM TAMBAH SHIFT BARU & VALIDASI BENTROK */}
      <div className="bg-white rounded-2xl p-5 border border-[#E4E1D6] shadow-xs">
        <h3 className="text-sm font-bold text-[#0F2A43] mb-1">
          Form Alokasi Shift Baru
        </h3>
        <p className="text-xs text-[#6B7280] mb-3">
          Sistem secara otomatis mencegah double-shift atau jadwal saling bertumpuk untuk staf yang sama.
        </p>

        {errorMsg && (
          <div className="p-3 mb-3 rounded-xl bg-[#FCE8D8] border border-[#F2A33A] text-xs text-[#B03A00] font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAddShift} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold text-[#0F2A43] mb-1">Pegawai</label>
            <select
              value={pegawai}
              onChange={(e) => setPegawai(e.target.value)}
              className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F2A43]"
            >
              <option value="Joko">Joko (Barista)</option>
              <option value="Putra">Putra (Barista)</option>
              <option value="Ningsih">Ningsih (Kasir)</option>
              <option value="Rina">Rina (Manager)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2A43] mb-1">Hari</label>
            <select
              value={hari}
              onChange={(e) => setHari(e.target.value)}
              className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F2A43]"
            >
              {daysList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2A43] mb-1">Stasiun</label>
            <select
              value={peran}
              onChange={(e) => setPeran(e.target.value)}
              className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F2A43]"
            >
              <option value="Barista">Barista</option>
              <option value="Kasir">Kasir</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2A43] mb-1">Mulai</label>
            <input
              type="time"
              value={mulai}
              onChange={(e) => setMulai(e.target.value)}
              className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F2A43]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2A43] mb-1">Selesai</label>
            <input
              type="time"
              value={selesai}
              onChange={(e) => setSelesai(e.target.value)}
              className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F2A43]"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-[#0F2A43] hover:bg-[#1E3E5C] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all shadow-xs touch-target touch-press flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Shift</span>
            </button>
          </div>
        </form>
      </div>

      {/* GRID MINGGUAN (SENIN SAMPAI MINGGU) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#0F2A43]">
            Kalender Jadwal Mingguan Terjadwal ({shifts.length} Slot Aktif)
          </h3>
          <span className="text-xs text-[#2C6079] font-semibold">Periode 13–19 Okt 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {daysList.map((d) => {
            const dayShifts = shifts.filter((s) => s.hari === d);
            const isToday = d === "Kamis";

            return (
              <div
                key={d}
                className={`p-3 rounded-2xl border shadow-xs flex flex-col justify-between ${
                  isToday
                    ? "border-2 border-[#F2A33A] bg-[#FCE8D8]/20"
                    : "border-[#E4E1D6] bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E4E1D6]">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-bold ${isToday ? "text-[#B03A00]" : "text-[#0F2A43]"}`}>
                        {d}
                      </span>
                      {isToday && (
                        <span className="text-[8px] bg-[#F2A33A] text-white px-1 py-0.2 rounded font-black">
                          HARI INI
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {dayShifts.length}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {dayShifts.length === 0 ? (
                      <p className="text-[11px] text-[#6B7280] italic py-2">Kosong</p>
                    ) : (
                      dayShifts.map((s) => (
                        <div
                          key={s.id}
                          className="p-1.5 rounded-lg bg-[#F4F2EA] border border-[#E4E1D6] text-[11px]"
                        >
                          <div className="flex items-center justify-between">
                            <strong className="text-[#0F2A43] truncate">{s.pegawai}</strong>
                            <span className="font-mono text-[10px] text-[#2C6079]">{s.mulai}-{s.selesai}</span>
                          </div>
                          <span className="text-[9px] text-[#6B7280] block">{s.peran}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL BROADCAST DARURAT SHIFT */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F2A43]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E4E1D6] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#BA1A1A] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <div>
                  <h3 className="font-bold text-sm">Broadcast Pengganti Shift Darurat</h3>
                  <p className="text-[10px] text-white/80">Kirim panggilan darurat langsung ke WhatsApp Grup Tim</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0F2A43] mb-1">
                  Pilih Shift yang Berhalangan
                </label>
                <select
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-semibold text-[#0F2A43]"
                >
                  <option value="Joko — Barista (Shift Pagi 07:00 - 15:00, Hari Ini)">
                    Joko — Barista (Shift Pagi 07:00 - 15:00, Hari Ini)
                  </option>
                  <option value="Putra — Barista (Shift Sore 15:00 - 23:00, Hari Ini)">
                    Putra — Barista (Shift Sore 15:00 - 23:00, Hari Ini)
                  </option>
                  <option value="Ningsih — Kasir (Shift Pagi 07:00 - 15:00, Besok)">
                    Ningsih — Kasir (Shift Pagi 07:00 - 15:00, Besok)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2A43] mb-1">
                  Pratinjau Pesan Siaran WhatsApp
                </label>
                <div className="p-3 rounded-xl bg-[#F4F2EA] border border-[#E4E1D6] font-mono text-xs text-[#0F2A43] leading-relaxed">
                  🚨 <strong>URGENT CALL KOPI HARMONI</strong>
                  <br />
                  Dibutuhkan barista pengganti untuk {emergencyReason}. Yang bersedia lembur / backup, balas pesan ini segera!
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E4E1D6] text-xs font-bold text-[#6B7280]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleBroadcastEmergency}
                  className="flex-[2] py-2.5 rounded-xl bg-[#2C9B8A] hover:bg-[#237c6e] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke Grup WhatsApp Tim</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

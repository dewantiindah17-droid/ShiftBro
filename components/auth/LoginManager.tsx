"use client";

import React, { useState } from "react";
import { User } from "@/types/auth";
import {
  Briefcase,
  ShieldAlert,
  Wifi,
  MapPin,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Building2,
} from "lucide-react";

interface LoginManagerProps {
  onSuccess: (user: User, authMethod: string) => void;
  onToast: (title: string, desc: string, type?: "success" | "error") => void;
}

export default function LoginManager({ onSuccess, onToast }: LoginManagerProps) {
  const [kodeOutlet, setKodeOutlet] = useState("HRM-YOG-01");
  const [idSupervisor, setIdSupervisor] = useState("MGR-RINA");
  const [passcode, setPasscode] = useState("");
  const [shiftBertugas, setShiftBertugas] = useState("Shift Pagi & Sore");
  const [showPasscode, setShowPasscode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [wifiVerified, setWifiVerified] = useState(true);

  // Quick fill demo helper
  const handleQuickDemo = () => {
    setKodeOutlet("HRM-YOG-01");
    setIdSupervisor("MGR-RINA");
    setPasscode("889900");
    setShiftBertugas("Shift Pagi & Sore");
    setErrorMessage("");
    onToast("Kredensial Demo Terisi", "ID: MGR-RINA · Passcode: 889900", "success");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "manager",
          identifier: idSupervisor,
          credential: passcode,
          outletCode: kodeOutlet,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onToast("Otorisasi Manager Berhasil", data.message, "success");
        onSuccess(data.user, data.authMethod);
      } else {
        setErrorMessage(data.message || "ID Supervisor atau Passcode tidak cocok.");
      }
    } catch {
      setErrorMessage("Gangguan jaringan. Silakan ulangi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Operational Supervisor Context Card */}
      <div className="p-3.5 rounded-2xl bg-[#1E3E5C]/10 border border-[#1E3E5C]/20 text-[#0F2A43]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#1E3E5C] text-white flex items-center justify-center text-xs font-bold">
              <Briefcase className="w-3.5 h-3.5 text-[#F2A33A]" />
            </div>
            <span className="text-xs font-bold text-[#0F2A43]">
              Konsol Supervisor Operasional
            </span>
          </div>
          <span className="text-[10px] font-bold bg-[#D7F0EA] text-[#0B6E5C] px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0B6E5C]" />
            Outlet Aktif
          </span>
        </div>
        <p className="text-[11px] text-[#6B7280]">
          Memerlukan otorisasi level supervisor untuk mengatur rotasi jadwal kerja, persetujuan tukar shift, dan broadcast darurat.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Outlet & ID Supervisor (2-Columns on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#0F2A43] mb-1">
              Kode Outlet Resmi
            </label>
            <div className="relative">
              <input
                type="text"
                value={kodeOutlet}
                onChange={(e) => setKodeOutlet(e.target.value.toUpperCase())}
                required
                placeholder="HRM-YOG-01"
                className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0F2A43] uppercase focus:outline-none focus:ring-2 focus:ring-[#1E3E5C]"
              />
              <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
            <span className="text-[10px] text-[#6B7280]">Kopi Harmoni (Yogyakarta)</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2A43] mb-1">
              ID Supervisor Shift
            </label>
            <input
              type="text"
              value={idSupervisor}
              onChange={(e) => setIdSupervisor(e.target.value.toUpperCase())}
              required
              placeholder="MGR-RINA"
              className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#0F2A43] uppercase focus:outline-none focus:ring-2 focus:ring-[#1E3E5C]"
            />
            <span className="text-[10px] text-[#6B7280]">Contoh ID demo: <strong>MGR-RINA</strong></span>
          </div>
        </div>

        {/* 6-Digit Security Passcode */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-[#0F2A43]">
              Passcode Keamanan Supervisor (6 Digit)
            </label>
            <button
              type="button"
              onClick={() => setShowPasscode(!showPasscode)}
              className="text-[11px] text-[#2C6079] hover:underline flex items-center gap-1 font-semibold"
            >
              {showPasscode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showPasscode ? "Sembunyikan" : "Periksa"}
            </button>
          </div>
          <input
            type={showPasscode ? "text" : "password"}
            maxLength={6}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            required
            placeholder="● ● ● ● ● ●"
            className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3.5 py-2.5 text-center text-sm font-mono tracking-widest font-bold text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#1E3E5C] touch-target"
          />
        </div>

        {/* Shift Assignment Selection */}
        <div>
          <label className="block text-xs font-bold text-[#0F2A43] mb-1">
            Sesi Supervisi Hari Ini
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label
              className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                shiftBertugas === "Shift Pagi & Sore"
                  ? "border-[#1E3E5C] bg-[#1E3E5C]/10 font-bold text-[#0F2A43]"
                  : "border-[#E4E1D6] bg-white text-[#6B7280]"
              }`}
            >
              <input
                type="radio"
                name="session_shift"
                checked={shiftBertugas === "Shift Pagi & Sore"}
                onChange={() => setShiftBertugas("Shift Pagi & Sore")}
                className="text-[#1E3E5C]"
              />
              <Clock className="w-3.5 h-3.5 text-[#1E3E5C]" />
              <span>Full Supervisi</span>
            </label>

            <label
              className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                shiftBertugas === "Shift Khusus Sore"
                  ? "border-[#1E3E5C] bg-[#1E3E5C]/10 font-bold text-[#0F2A43]"
                  : "border-[#E4E1D6] bg-white text-[#6B7280]"
              }`}
            >
              <input
                type="radio"
                name="session_shift"
                checked={shiftBertugas === "Shift Khusus Sore"}
                onChange={() => setShiftBertugas("Shift Khusus Sore")}
                className="text-[#1E3E5C]"
              />
              <Clock className="w-3.5 h-3.5 text-[#2C6079]" />
              <span>Shift Sore Saja</span>
            </label>
          </div>
        </div>

        {/* WiFi & GPS Guard Indicator */}
        <div className="p-2.5 rounded-xl bg-white border border-[#E4E1D6] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-[#0F2A43]">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>Jaringan: <strong>Harmoni-Staff-5G</strong></span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            GPS Valid (Kedai)
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1E3E5C] hover:bg-[#0F2A43] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md touch-target touch-press flex items-center justify-center gap-2"
        >
          {isLoading ? (
            "Memverifikasi Otorisasi Supervisor..."
          ) : (
            <>
              <Briefcase className="w-4 h-4 text-[#F2A33A]" />
              <span>Buka Konsol Penjadwalan Manager</span>
            </>
          )}
        </button>

        {/* Demo Shortcut */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-[11px] text-[#2C6079] hover:underline font-bold inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#F2A33A]" />
            Gunakan Akun Demo Manager (1-Klik Isi: 889900)
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { User } from "@/types/auth";
import {
  KeyRound,
  MessageSquare,
  QrCode,
  Shield,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Delete,
  Sparkles,
} from "lucide-react";

interface LoginPegawaiProps {
  onSuccess: (user: User, authMethod: string) => void;
  onToast: (title: string, desc: string, type?: "success" | "error") => void;
}

export default function LoginPegawai({ onSuccess, onToast }: LoginPegawaiProps) {
  // Method: 'pin' | 'wa' | 'scan'
  const [method, setMethod] = useState<"pin" | "wa" | "scan">("pin");

  // PIN state
  const [selectedStaff, setSelectedStaff] = useState("JK-01");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // WhatsApp OTP state
  const [noHp, setNoHp] = useState("081234567890");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [simulatedOtpHint, setSimulatedOtpHint] = useState("");

  // Scan simulation state
  const [isScanning, setIsScanning] = useState(false);

  const staffList = [
    { nip: "JK-01", nama: "Joko", role: "Barista", defaultPin: "1234" },
    { nip: "NS-02", nama: "Ningsih", role: "Kasir", defaultPin: "4321" },
    { nip: "PT-03", nama: "Putra", role: "Barista", defaultPin: "1234" },
  ];

  // Keypad click handler
  const handleKeypadPress = (val: string) => {
    setErrorMessage("");
    if (val === "clear") {
      setPin("");
    } else if (val === "back") {
      setPin((prev) => prev.slice(0, -1));
    } else {
      if (pin.length < 4) {
        const newPin = pin + val;
        setPin(newPin);
        if (newPin.length === 4) {
          submitPin(newPin);
        }
      }
    }
  };

  // Submit PIN to secure server API
  const submitPin = async (submittedPin: string) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "pegawai",
          identifier: selectedStaff,
          credential: submittedPin,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onToast("Login Pegawai Berhasil", data.message, "success");
        onSuccess(data.user, data.authMethod);
      } else {
        setErrorMessage(data.message || "PIN salah. Coba 1234.");
        setPin("");
      }
    } catch (err) {
      setErrorMessage("Koneksi gagal. Silakan coba lagi.");
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  // Request WhatsApp OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noHp }),
      });

      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
        setSimulatedOtpHint(data.simulatedOtp);
        setOtpCode(data.simulatedOtp); // Auto-fill for test friendliness
        onToast("OTP Terkirim", `Kode verifikasi: ${data.simulatedOtp}`, "success");
      } else {
        setErrorMessage(data.message || "Gagal mengirim OTP.");
      }
    } catch {
      setErrorMessage("Kesalahan server saat kirim OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify WhatsApp OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noHp, otp: otpCode }),
      });

      const data = await res.json();

      if (data.success) {
        onToast("Login WhatsApp Sukses", data.message, "success");
        onSuccess(data.user, data.authMethod);
      } else {
        setErrorMessage(data.message || "Kode OTP tidak valid.");
      }
    } catch {
      setErrorMessage("Terjadi gangguan verifikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Barcode Scan
  const handleScanBarcode = () => {
    setIsScanning(true);
    setErrorMessage("");
    setTimeout(async () => {
      setIsScanning(false);
      // Auto login as Joko (JK-01) with PIN 1234 via server
      await submitPin("1234");
    }, 1200);
  };

  const currentStaffObj = staffList.find((s) => s.nip === selectedStaff);

  return (
    <div className="space-y-4">
      {/* Sub-Tabs: 3 Cara Login Pegawai */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMethod("pin");
            setErrorMessage("");
          }}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            method === "pin"
              ? "bg-[#2C9B8A] text-white shadow-xs font-bold"
              : "text-[#6B7280] hover:text-[#0F2A43]"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>PIN 4-Digit</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod("wa");
            setErrorMessage("");
          }}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            method === "wa"
              ? "bg-[#2C9B8A] text-white shadow-xs font-bold"
              : "text-[#6B7280] hover:text-[#0F2A43]"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp OTP</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod("scan");
            setErrorMessage("");
          }}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            method === "scan"
              ? "bg-[#2C9B8A] text-white shadow-xs font-bold"
              : "text-[#6B7280] hover:text-[#0F2A43]"
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Scan ID Card</span>
        </button>
      </div>

      {/* Error notification banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================= */}
      {/* METHOD 1: QUICK PIN (VIRTUAL KEYPAD)      */}
      {/* ========================================= */}
      {method === "pin" && (
        <div className="space-y-4">
          {/* Staff Selector */}
          <div>
            <label className="block text-xs font-bold text-[#0F2A43] mb-1.5">
              Pilih Profil Karyawan Bertugas:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {staffList.map((st) => {
                const isSelected = selectedStaff === st.nip;
                return (
                  <button
                    key={st.nip}
                    type="button"
                    onClick={() => {
                      setSelectedStaff(st.nip);
                      setPin("");
                      setErrorMessage("");
                    }}
                    className={`p-2 rounded-xl text-left border transition-all touch-press ${
                      isSelected
                        ? "border-[#2C9B8A] bg-[#D7F0EA]/40 text-[#0F2A43] ring-1 ring-[#2C9B8A]"
                        : "border-[#E4E1D6] bg-white text-[#6B7280] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#0F2A43] text-white text-[10px] font-bold flex items-center justify-center">
                        {st.nama[0]}
                      </div>
                      <span className="text-xs font-bold truncate text-[#0F2A43]">
                        {st.nama}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#2C6079] block mt-0.5">
                      {st.role} · {st.nip}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Masked PIN Display */}
          <div className="bg-[#F4F2EA] p-4 rounded-2xl border border-[#E4E1D6] text-center">
            <span className="text-[11px] font-semibold text-[#6B7280] block mb-2">
              Masukkan 4-Digit PIN untuk {currentStaffObj?.nama}
            </span>

            {/* 4 PIN Dots */}
            <div className="flex items-center justify-center gap-3 my-2">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-150 ${
                      isFilled
                        ? "bg-[#2C9B8A] scale-110 shadow-sm"
                        : "bg-white border-2 border-[#CBD5E1]"
                    }`}
                  />
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleKeypadPress("clear")}
                className="text-[11px] text-[#6B7280] hover:text-[#0F2A43] underline font-medium"
              >
                Hapus
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => {
                  setPin("1234");
                  submitPin("1234");
                }}
                className="text-[11px] text-[#2C9B8A] hover:underline font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Isi PIN Demo (1234)
              </button>
            </div>
          </div>

          {/* Virtual Touch Keypad (Ergonomis untuk Jempol Mobile) */}
          <div className="grid grid-cols-3 gap-2 pt-1 max-w-xs mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                disabled={isLoading}
                onClick={() => handleKeypadPress(num)}
                className="h-12 rounded-xl bg-white hover:bg-slate-50 border border-[#E4E1D6] text-base font-bold text-[#0F2A43] shadow-xs active:bg-[#D7F0EA] active:scale-95 transition-all flex items-center justify-center touch-target"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeypadPress("clear")}
              className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#6B7280] active:scale-95 transition-all flex items-center justify-center touch-target"
            >
              C
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleKeypadPress("0")}
              className="h-12 rounded-xl bg-white hover:bg-slate-50 border border-[#E4E1D6] text-base font-bold text-[#0F2A43] shadow-xs active:bg-[#D7F0EA] active:scale-95 transition-all flex items-center justify-center touch-target"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress("back")}
              className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#6B7280] active:scale-95 transition-all flex items-center justify-center touch-target"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* METHOD 2: WHATSAPP DIRECT OTP             */}
      {/* ========================================= */}
      {method === "wa" && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Masuk Tanpa Sandi via WhatsApp</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Karyawan tidak perlu mengingat password. Kode token 4 digit langsung dikirim ke chat WhatsApp nomor aktif.
              </p>
            </div>
          </div>

          {!otpSent ? (
            <form onSubmit={handleRequestOtp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0F2A43] mb-1">
                  Nomor WhatsApp Terdaftar
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    required
                    placeholder="081234567890"
                    className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#2C9B8A] touch-target"
                  />
                </div>
                <span className="text-[10px] text-[#6B7280] mt-1 block">
                  Nomor demo tersedia: <strong>081234567890</strong> (Joko) atau <strong>081298765432</strong> (Ningsih)
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2C9B8A] hover:bg-[#237c6e] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md touch-target touch-press flex items-center justify-center gap-2"
              >
                {isLoading ? "Mengirim Token..." : "Kirim Kode OTP ke WhatsApp"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3 animate-in fade-in">
              <div className="p-3 rounded-xl bg-white border border-[#E4E1D6]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0F2A43]">
                    Kode OTP Terkirim ke +{noHp}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[11px] text-[#2C9B8A] hover:underline"
                  >
                    Ganti No. HP
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  required
                  placeholder="4 digit angka"
                  className="w-full text-center tracking-widest text-lg font-mono font-black bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl py-2 text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#2C9B8A]"
                />
                {simulatedOtpHint && (
                  <p className="text-[11px] text-[#0B6E5C] text-center mt-1.5 font-medium">
                    Kode simulasi terkirim: <strong>{simulatedOtpHint}</strong>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2C9B8A] hover:bg-[#237c6e] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md touch-target touch-press flex items-center justify-center gap-2"
              >
                {isLoading ? "Memvalidasi OTP..." : "Verifikasi & Masuk Stasiun"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ========================================= */}
      {/* METHOD 3: SCAN ID CARD / BARCODE OUTLET   */}
      {/* ========================================= */}
      {method === "scan" && (
        <div className="space-y-4 text-center">
          <div className="relative w-full aspect-square max-w-[260px] mx-auto rounded-3xl bg-[#0F2A43] border-4 border-[#2C9B8A] overflow-hidden flex flex-col items-center justify-center p-6 text-white shadow-lg">
            {/* Viewfinder Reticle */}
            <div className="absolute inset-4 border border-dashed border-white/40 rounded-2xl pointer-events-none" />

            {/* Laser scan line animation */}
            <div
              className={`absolute left-0 right-0 h-1 bg-[#F2A33A] shadow-md transition-all duration-1000 ${
                isScanning ? "top-3/4 animate-bounce" : "top-1/4"
              }`}
            />

            <QrCode className="w-16 h-16 text-slate-300 mb-3" />
            <p className="text-xs font-bold text-white">Simulasi Scanner ID Outlet</p>
            <p className="text-[10px] text-slate-300 mt-1 max-w-[180px]">
              Arahkan barcode kartu karyawan Kopi Harmoni ke kamera.
            </p>
          </div>

          <button
            type="button"
            disabled={isScanning || isLoading}
            onClick={handleScanBarcode}
            className="w-full bg-[#0F2A43] hover:bg-[#1E3E5C] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md touch-target touch-press flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F2A33A] animate-ping" />
                Membaca Barcode Kartu (JK-01)...
              </span>
            ) : (
              <span>Simulasikan Scan Kartu Barcode (Joko Barista)</span>
            )}
          </button>
        </div>
      )}

      {/* Security Footer Notice */}
      <div className="pt-2 border-t border-[#E4E1D6] flex items-center justify-between text-[10px] text-[#6B7280]">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-[#2C9B8A]" />
          Enkripsi Server-Side Aktif
        </span>
        <span>Outlet: Kopi Harmoni (Yogyakarta)</span>
      </div>
    </div>
  );
}

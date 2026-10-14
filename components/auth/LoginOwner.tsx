"use client";

import React, { useState } from "react";
import { User } from "@/types/auth";
import {
  ShieldCheck,
  Lock,
  Mail,
  KeySquare,
  Globe,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface LoginOwnerProps {
  onSuccess: (user: User, authMethod: string) => void;
  onToast: (title: string, desc: string, type?: "success" | "error") => void;
}

export default function LoginOwner({ onSuccess, onToast }: LoginOwnerProps) {
  const [authFlow, setAuthFlow] = useState<"standard" | "sso">("standard");

  // Step 1 & 2 state
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("syifa.owner@kopiharmoni.com");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Quick fill demo
  const handleQuickDemo = () => {
    setEmail("syifa.owner@kopiharmoni.com");
    setPassword("OwnerHarmoni2026!");
    setTotp("552419");
    setErrorMessage("");
    onToast("Kredensial Owner Demo Diisi", "Email & Password terisi. Lanjutkan verifikasi.", "success");
  };

  // Step 1: Verify Password -> Triggers 2FA challenge
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "owner",
          identifier: email,
          credential: password,
        }),
      });

      const data = await res.json();

      if (data.require2FA) {
        setStep(2);
        setTotp("552419"); // Pre-populate demo code for convenience
        onToast("Kredensial Valid", data.message, "success");
      } else if (data.success) {
        onToast("Akses Owner Terbuka", data.message, "success");
        onSuccess(data.user, data.authMethod);
      } else {
        setErrorMessage(data.message || "Email atau kata sandi tidak cocok.");
      }
    } catch {
      setErrorMessage("Koneksi gagal saat otentikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 2FA TOTP Code
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "owner",
          identifier: email,
          credential: password,
          totp: totp,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onToast("Verifikasi 2FA Sukses", data.message, "success");
        onSuccess(data.user, data.authMethod);
      } else {
        setErrorMessage(data.message || "Kode 2FA tidak cocok.");
      }
    } catch {
      setErrorMessage("Kesalahan verifikasi 2FA.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Workspace SSO Handler
  const handleGoogleSso = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/sso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "syifa.owner@kopiharmoni.com",
          domain: "kopiharmoni.com",
        }),
      });

      const data = await res.json();

      if (data.success) {
        onToast("Google Workspace SSO Sukses", data.message, "success");
        onSuccess(data.user, data.authMethod);
      } else {
        setErrorMessage(data.message || "SSO Gagal.");
      }
    } catch {
      setErrorMessage("Gangguan pada layanan SSO.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Executive Security Header Banner */}
      <div className="p-3.5 rounded-2xl bg-[#0F2A43] text-white flex items-center justify-between border border-[#1E3E5C]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2C9B8A] to-[#F2A33A] flex items-center justify-center font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold leading-tight">
              Portal Finansial & HR Eksekutif
            </h4>
            <p className="text-[10px] text-slate-300">
              Enkripsi End-to-End · Perlindungan Data Omset & MRR
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-[#F2A33A] font-bold">
          2FA Wajib
        </span>
      </div>

      {/* Toggle Flow: Standard Password vs Google SSO */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setAuthFlow("standard");
            setErrorMessage("");
          }}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            authFlow === "standard"
              ? "bg-[#0F2A43] text-white shadow-xs font-bold"
              : "text-[#6B7280] hover:text-[#0F2A43]"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Email + 2FA TOTP</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthFlow("sso");
            setErrorMessage("");
          }}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            authFlow === "sso"
              ? "bg-[#0F2A43] text-white shadow-xs font-bold"
              : "text-[#6B7280] hover:text-[#0F2A43]"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Google Workspace SSO</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================= */}
      {/* FLOW 1: STANDARD (STEP 1: PASSWORD)       */}
      {/* ========================================= */}
      {authFlow === "standard" && step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#0F2A43] mb-1">
              Email Bisnis Terdaftar (@kopiharmoni.com)
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="syifa.owner@kopiharmoni.com"
                className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#0F2A43]"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#0F2A43]">
                Kata Sandi Eksekutif
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#2C6079] hover:underline flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPassword ? "Tutup" : "Lihat"}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan kata sandi..."
                className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3.5 py-2.5 text-xs text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#0F2A43] touch-target"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
            <span className="text-[10px] text-[#6B7280] mt-1 block">
              Demo password: <strong>OwnerHarmoni2026!</strong>
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0F2A43] hover:bg-[#1E3E5C] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md touch-target touch-press flex items-center justify-center gap-2"
          >
            {isLoading ? (
              "Memvalidasi Kredensial..."
            ) : (
              <>
                <span>Lanjut ke Verifikasi 2FA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-[11px] text-[#2C6079] hover:underline font-bold inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#F2A33A]" />
              Isi Otomatis Kredensial Demo Owner
            </button>
          </div>
        </form>
      )}

      {/* ========================================= */}
      {/* FLOW 1: STANDARD (STEP 2: 2FA TOTP CODE)  */}
      {/* ========================================= */}
      {authFlow === "standard" && step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-4 animate-in fade-in">
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold mb-1">
              <KeySquare className="w-4 h-4 text-amber-600" />
              <span>Langkah 2: Masukkan Kode Google Authenticator</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Buka aplikasi Authenticator terdaftar pada ponsel Owner ({email}) untuk melihat 6 digit kode keamanan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2A43] mb-1.5 text-center">
              Kode 6-Digit 2FA
            </label>
            <input
              type="text"
              maxLength={6}
              value={totp}
              onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
              required
              placeholder="552419"
              className="w-full text-center tracking-[0.5em] text-xl font-mono font-black bg-[#F4F2EA] border-2 border-[#0F2A43] rounded-2xl py-3 text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#F2A33A]"
            />
            <span className="text-[10px] text-center text-[#2C6079] block mt-1.5 font-semibold">
              Kode demo aktif: <strong>552419</strong> (Kedaluwarsa dalam 30 detik)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 px-3 rounded-xl border border-[#E4E1D6] bg-white text-xs font-bold text-[#6B7280] hover:bg-slate-50 transition-colors"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] bg-[#0F2A43] hover:bg-[#1E3E5C] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md touch-target touch-press flex items-center justify-center gap-2"
            >
              {isLoading ? "Mengaudit 2FA..." : "Otorisasi & Buka Dasbor Owner"}
            </button>
          </div>
        </form>
      )}

      {/* ========================================= */}
      {/* FLOW 2: GOOGLE WORKSPACE SSO              */}
      {/* ========================================= */}
      {authFlow === "sso" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E4E1D6] text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 mx-auto mb-3 flex items-center justify-center shadow-xs">
              <Globe className="w-6 h-6 text-[#2C9B8A]" />
            </div>
            <h5 className="text-xs font-bold text-[#0F2A43]">
              Google Workspace Single Sign-On
            </h5>
            <p className="text-[11px] text-[#6B7280] mt-1 max-w-xs mx-auto leading-relaxed">
              Masuk aman menggunakan akun korporat Google Workspace terdaftar (@kopiharmoni.com) tanpa mengetik password manual.
            </p>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSso}
              className="mt-4 w-full bg-white hover:bg-slate-50 border-2 border-[#0F2A43] text-[#0F2A43] font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-sm touch-target touch-press flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? "Mengautentikasi SSO..." : "Masuk via Google Workspace (@kopiharmoni.com)"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Security Audit Session Footnote */}
      <div className="pt-2 border-t border-[#E4E1D6] flex flex-col sm:flex-row sm:items-center justify-between text-[10px] text-[#6B7280] gap-1">
        <span className="flex items-center gap-1 font-mono">
          <CheckCircle className="w-3 h-3 text-[#0B6E5C]" />
          Audit Log Aktif · Lokasi IP: Yogyakarta
        </span>
        <span className="text-[#2C6079] font-medium">Session Timeout: 15 Menit</span>
      </div>
    </div>
  );
}

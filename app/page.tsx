"use client";

import React, { useState, useEffect } from "react";
import {
  Coffee,
  Building2,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Download,
  Check,
  Flame,
  AlertTriangle,
  ArrowRightLeft,
  Wifi,
  Camera,
  FileSpreadsheet,
  Filter,
  CheckCheck,
} from "lucide-react";

// Types
type Role = "owner" | "pegawai";
type AuthMode = "daftar" | "login";
type Station = "Barista" | "Kasir" | "Kitchen";
type ShiftType = "Shift Pagi (07:00 - 15:00)" | "Shift Malam (15:00 - 23:00)";

interface AttendanceRecord {
  id: string;
  namaPegawai: string;
  peranStasiun: Station;
  shiftType: ShiftType;
  tanggalInput: string; // YYYY-MM-DD
  hari: string;
  jamMulai: string;
  jamSelesai?: string;
  status: "Sedang Bekerja" | "Selesai Shift";
  durasiJam: number;
  lemburJam: number;
  lemburApproved: boolean;
  outlet: string;
}

interface SwapRequest {
  id: string;
  pemohon: string;
  target: string;
  tanggal: string;
  shift: string;
  alasan: string;
  status: "Menunggu Approval" | "Disetujui" | "Ditolak";
}

// ==========================================
// KONFIGURASI PAKET PREMIUM (Rp25.000 / bulan)
// ==========================================
// Link produk "ShiftBro Pro" milikmu di lynk.id
const LYNK_PRO_URL = "https://lynk.id/pionaaaaaaa/g2nn8r72303o";
const PREMIUM_PRICE_LABEL = "Rp25.000 / bulan";
const PRO_STORAGE_KEY = "shiftbro_premium_expiry";

export default function ShiftBroApp() {
  // Navigation & Role states (Hanya 2 POV: Owner & Pegawai)
  const [currentScreen, setCurrentScreen] = useState<"portal" | "form-auth" | "dashboard-owner" | "dashboard-pegawai">("portal");
  const [selectedRole, setSelectedRole] = useState<Role>("owner");
  const [authMode, setAuthMode] = useState<AuthMode>("daftar");

  // Plan State: Free vs Premium (Rp25.000 / bulan)
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [premiumExpiry, setPremiumExpiry] = useState<number | null>(null);
  const [hourlyRate, setHourlyRate] = useState<number>(18000); // Rp 18.000 / jam

  // Upgrade / Aktivasi Lisensi Premium
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [licenseInput, setLicenseInput] = useState<string>("");
  const [licenseError, setLicenseError] = useState<string>("");
  const [licenseLoading, setLicenseLoading] = useState<boolean>(false);

  // Form Inputs Owner
  const [ownerOutlet, setOwnerOutlet] = useState("");
  const [ownerNama, setOwnerNama] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);

  // Form Inputs Pegawai (Nama, Password, Jobdesk)
  const [pegawaiNama, setPegawaiNama] = useState("");
  const [pegawaiPassword, setPegawaiPassword] = useState("");
  const [showPegawaiPassword, setShowPegawaiPassword] = useState(false);
  const [pegawaiJobdesk, setPegawaiJobdesk] = useState<Station>("Barista");

  // Active Session
  const [activeOwner, setActiveOwner] = useState<{ nama: string; outlet: string; email: string } | null>(null);
  const [activePegawai, setActivePegawai] = useState<{ nama: string; jobdesk: Station; outlet: string } | null>(null);

  // Active Shift Pegawai State
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType>("Shift Pagi (07:00 - 15:00)");
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false);
  const [activeShiftRecord, setActiveShiftRecord] = useState<AttendanceRecord | null>(null);

  // Verification 2-step modal for End Shift (Pencegahan salah pencet)
  const [showEndShiftConfirmModal, setShowEndShiftConfirmModal] = useState<boolean>(false);
  const [recordToEnd, setRecordToEnd] = useState<AttendanceRecord | null>(null);

  // Swap Shift Modal for Pegawai
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
  const [swapTargetStaff, setSwapTargetStaff] = useState<string>("Budi Santoso (Barista)");
  const [swapReason, setSwapReason] = useState<string>("Ada keperluan mendadak kuliah");

  // In-Memory Attendance Database
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([
    {
      id: "ATT-101",
      namaPegawai: "Joko Susanto",
      peranStasiun: "Barista",
      shiftType: "Shift Pagi (07:00 - 15:00)",
      tanggalInput: "2026-10-14",
      hari: "Rabu",
      jamMulai: "07:00",
      status: "Sedang Bekerja",
      durasiJam: 6.5,
      lemburJam: 1.5,
      lemburApproved: false,
      outlet: "Kopi Harmoni",
    },
    {
      id: "ATT-102",
      namaPegawai: "Siti Ningsih",
      peranStasiun: "Kasir",
      shiftType: "Shift Pagi (07:00 - 15:00)",
      tanggalInput: "2026-10-14",
      hari: "Rabu",
      jamMulai: "06:55",
      status: "Sedang Bekerja",
      durasiJam: 6.6,
      lemburJam: 0,
      lemburApproved: false,
      outlet: "Kopi Harmoni",
    },
    {
      id: "ATT-103",
      namaPegawai: "Budi Santoso",
      peranStasiun: "Barista",
      shiftType: "Shift Malam (15:00 - 23:00)",
      tanggalInput: "2026-10-14",
      hari: "Rabu",
      jamMulai: "15:00",
      status: "Sedang Bekerja",
      durasiJam: 1.2,
      lemburJam: 0,
      lemburApproved: false,
      outlet: "Kopi Harmoni",
    },
    {
      id: "ATT-099",
      namaPegawai: "Joko Susanto",
      peranStasiun: "Barista",
      shiftType: "Shift Pagi (07:00 - 15:00)",
      tanggalInput: "2026-10-13",
      hari: "Selasa",
      jamMulai: "07:00",
      jamSelesai: "15:05",
      status: "Selesai Shift",
      durasiJam: 8.0,
      lemburJam: 0,
      lemburApproved: false,
      outlet: "Kopi Harmoni",
    },
    {
      id: "ATT-098",
      namaPegawai: "Joko Susanto",
      peranStasiun: "Barista",
      shiftType: "Shift Malam (15:00 - 23:00)",
      tanggalInput: "2026-10-12",
      hari: "Senin",
      jamMulai: "15:00",
      jamSelesai: "23:02",
      status: "Selesai Shift",
      durasiJam: 8.0,
      lemburJam: 0,
      lemburApproved: false,
      outlet: "Kopi Harmoni",
    },
    {
      id: "ATT-097",
      namaPegawai: "Ahmad Kitchen",
      peranStasiun: "Kitchen",
      shiftType: "Shift Pagi (07:00 - 15:00)",
      tanggalInput: "2026-10-13",
      hari: "Selasa",
      jamMulai: "07:00",
      jamSelesai: "15:00",
      status: "Selesai Shift",
      durasiJam: 8.0,
      lemburJam: 0,
      lemburApproved: false,
      outlet: "Kopi Harmoni",
    },
  ]);

  // Swap Requests List
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([
    {
      id: "SWP-01",
      pemohon: "Joko Susanto",
      target: "Budi Santoso",
      tanggal: "Kamis, 15 Okt 2026",
      shift: "Shift Pagi ⇄ Shift Malam",
      alasan: "Ada ujian tengah semester",
      status: "Menunggu Approval",
    },
  ]);

  // Owner Filter States
  const [filterDay, setFilterDay] = useState<string>("14");
  const [filterMonth, setFilterMonth] = useState<string>("10");
  const [filterYear, setFilterYear] = useState<string>("2026");
  const [filterStation, setFilterStation] = useState<string>("Semua");

  // Realtime clock ticker
  const [currentClock, setCurrentClock] = useState<string>("");
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentClock(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB");
      setCurrentDateFormatted(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Muat status Premium yang tersimpan di browser (localStorage)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PRO_STORAGE_KEY);
      if (stored) {
        const expiry = Number(stored);
        if (!Number.isNaN(expiry) && expiry > Date.now()) {
          setIsPremium(true);
          setPremiumExpiry(expiry);
        } else {
          window.localStorage.removeItem(PRO_STORAGE_KEY);
        }
      }
    } catch {
      // localStorage mungkin tidak tersedia; abaikan.
    }
  }, []);

  // Toast Notifier
  const [toast, setToast] = useState<{ show: boolean; title: string; desc: string; type: "success" | "error" }>({
    show: false,
    title: "",
    desc: "",
    type: "success",
  });

  const showToast = (title: string, desc: string, type: "success" | "error" = "success") => {
    setToast({ show: true, title, desc, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Navigasi ke Form Role
  const openAuthForm = (role: Role, mode: AuthMode = "daftar") => {
    setSelectedRole(role);
    setAuthMode(mode);
    setCurrentScreen("form-auth");
  };

  // ==========================================
  // AUTH SUBMISSION HANDLERS
  // ==========================================
  const handleOwnerAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerEmail || !ownerPassword) {
      showToast("Data Kurang", "Email dan password wajib diisi.", "error");
      return;
    }

    if (authMode === "daftar") {
      if (!ownerOutlet || !ownerNama) {
        showToast("Data Kurang", "Nama outlet dan nama owner wajib diisi.", "error");
        return;
      }
      const newOwner = {
        nama: ownerNama.trim(),
        outlet: ownerOutlet.trim(),
        email: ownerEmail.trim(),
      };
      setActiveOwner(newOwner);
      showToast("Akun Owner Berhasil Didaftarkan!", `Selamat datang ${newOwner.nama} di ${newOwner.outlet}.`, "success");
      setCurrentScreen("dashboard-owner");
    } else {
      // Login
      const owner = {
        nama: ownerNama || "Ibu Syifa",
        outlet: ownerOutlet || "Kopi Harmoni",
        email: ownerEmail,
      };
      setActiveOwner(owner);
      showToast("Login Berhasil", `Selamat datang kembali, Owner ${owner.nama}!`, "success");
      setCurrentScreen("dashboard-owner");
    }
  };

  const handlePegawaiAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pegawaiNama.trim() || !pegawaiPassword.trim()) {
      showToast("Data Kurang", "Nama lengkap dan password wajib diisi pegawai.", "error");
      return;
    }

    const currentOutlet = activeOwner?.outlet || "Kopi Harmoni";
    const newPegawai = {
      nama: pegawaiNama.trim(),
      jobdesk: pegawaiJobdesk,
      outlet: currentOutlet,
    };

    setActivePegawai(newPegawai);

    // Check if there is an active shift for this pegawai today
    const activeRec = attendanceList.find(
      (a) => a.namaPegawai.toLowerCase() === newPegawai.nama.toLowerCase() && a.status === "Sedang Bekerja"
    );

    if (activeRec) {
      setIsShiftActive(true);
      setActiveShiftRecord(activeRec);
    } else {
      setIsShiftActive(false);
      setActiveShiftRecord(null);
    }

    showToast("Login Pegawai Berhasil", `Selamat bertugas di stasiun ${pegawaiJobdesk}, ${newPegawai.nama}!`, "success");
    setCurrentScreen("dashboard-pegawai");
  };

  // ==========================================
  // PEGAWAI: START SHIFT & END SHIFT (2-STEP)
  // ==========================================
  const handleStartShift = () => {
    if (!activePegawai) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayName = now.toLocaleDateString("id-ID", { weekday: "long" });

    const newRec: AttendanceRecord = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      namaPegawai: activePegawai.nama,
      peranStasiun: activePegawai.jobdesk,
      shiftType: selectedShiftType,
      tanggalInput: dateStr,
      hari: dayName,
      jamMulai: timeStr,
      status: "Sedang Bekerja",
      durasiJam: 0.1,
      lemburJam: 0,
      lemburApproved: false,
      outlet: activePegawai.outlet,
    };

    setActiveShiftRecord(newRec);
    setIsShiftActive(true);
    setAttendanceList((prev) => [newRec, ...prev]);

    showToast("Shift Dimulai!", `Jam kerja Anda tercatat mulai pukul ${timeStr} WIB. Selamat bekerja!`, "success");
  };

  // Klik tombol Akhiri Shift di Pojok Kanan Riwayat Hari Itu -> Muncul Verifikasi 2 Langkah
  const handleTriggerEndShift = (rec: AttendanceRecord) => {
    setRecordToEnd(rec);
    setShowEndShiftConfirmModal(true);
  };

  // Verifikasi Langkah ke-2: Konfirmasi Akhir Shift
  const handleConfirmEndShift = () => {
    if (!recordToEnd) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    setAttendanceList((prev) =>
      prev.map((rec) =>
        rec.id === recordToEnd.id
          ? { ...rec, status: "Selesai Shift", jamSelesai: timeStr, durasiJam: 8.0 }
          : rec
      )
    );

    setIsShiftActive(false);
    setActiveShiftRecord(null);
    setShowEndShiftConfirmModal(false);
    setRecordToEnd(null);

    showToast(
      "Shift Resmi Selesai!",
      `Shift Anda berhasil diakhiri pada pukul ${timeStr} WIB. Terima kasih atas kerja keras Anda hari ini!`,
      "success"
    );
  };

  // Pengajuan Tukar Shift
  const handleSubmitSwapRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePegawai) return;

    const newReq: SwapRequest = {
      id: `SWP-${Date.now().toString().slice(-3)}`,
      pemohon: activePegawai.nama,
      target: swapTargetStaff,
      tanggal: "Kamis, 15 Okt 2026",
      shift: selectedShiftType,
      alasan: swapReason,
      status: "Menunggu Approval",
    };

    setSwapRequests((prev) => [newReq, ...prev]);
    setShowSwapModal(false);
    showToast("Pengajuan Terkirim", "Permintaan tukar shift diteruskan ke Owner untuk di-approve 1-klik.", "success");
  };

  // Owner Approve Lembur 1-Klik
  const handleApproveOvertime = (id: string) => {
    setAttendanceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, lemburApproved: true } : item))
    );
    showToast("Lembur Disetujui!", "Jam lembur resmi dihitung ke dalam kalkulasi payroll bulan ini.", "success");
  };

  // Owner Approve Tukar Shift 1-Klik
  const handleApproveSwap = (id: string) => {
    setSwapRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Disetujui" } : item))
    );
    showToast("Tukar Shift Disetujui!", "Jadwal operasional mingguan otomatis diperbarui di sistem.", "success");
  };

  // Logout / Switch
  const handleLogout = () => {
    setActiveOwner(null);
    setActivePegawai(null);
    setIsShiftActive(false);
    setActiveShiftRecord(null);
    setCurrentScreen("portal");
    showToast("Sesi Diakhiri", "Kembali ke Portal Pemilihan Peran ShiftBro.", "success");
  };

  // ==========================================
  // PREMIUM: AKTIVASI & PENONAKTIFAN LISENSI
  // ==========================================
  const premiumExpiryLabel = premiumExpiry
    ? new Date(premiumExpiry).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = licenseInput.trim();
    if (!code) {
      setLicenseError("Masukkan kode lisensi terlebih dahulu.");
      return;
    }

    setLicenseLoading(true);
    setLicenseError("");

    try {
      const res = await fetch("/api/license/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          outlet: activeOwner?.outlet,
          nama: activeOwner?.nama,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setLicenseError(data.message || "Kode lisensi tidak valid.");
        return;
      }

      const expiry = new Date(data.expiresAt).getTime();
      setIsPremium(true);
      setPremiumExpiry(expiry);
      setLicenseInput("");
      setShowUpgradeModal(false);
      try {
        window.localStorage.setItem(PRO_STORAGE_KEY, String(expiry));
      } catch {
        // abaikan bila localStorage tidak tersedia
      }
      showToast(
        "Premium Aktif! 🎉",
        "Fitur Payroll, Overtime Guard & Tukar Shift telah terbuka.",
        "success"
      );
    } catch {
      setLicenseError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setLicenseLoading(false);
    }
  };

  const handleDeactivatePremium = () => {
    setIsPremium(false);
    setPremiumExpiry(null);
    try {
      window.localStorage.removeItem(PRO_STORAGE_KEY);
    } catch {
      // abaikan
    }
    showToast("Premium Dinonaktifkan", "Kembali ke Paket Free (mode demo).", "success");
  };

  // ==========================================
  // FILTERING LOGIC OWNER DASHBOARD
  // ==========================================
  const filteredAttendance = attendanceList.filter((item) => {
    const [itemY, itemM, itemD] = item.tanggalInput.split("-");
    const matchYear = filterYear === "Semua" || itemY === filterYear;
    const matchMonth = filterMonth === "Semua" || itemM === filterMonth.padStart(2, "0");
    const matchDay = filterDay === "Semua" || itemD === filterDay.padStart(2, "0");
    const matchStation = filterStation === "Semua" || item.peranStasiun === filterStation;

    return matchYear && matchMonth && matchDay && matchStation;
  });

  // Filter Riwayat Khusus Pegawai yang sedang login
  const pegawaiHistory = activePegawai
    ? attendanceList.filter(
        (item) => item.namaPegawai.toLowerCase() === activePegawai.nama.toLowerCase()
      )
    : [];

  return (
    <div className="min-h-screen bg-[#F4F2EA] text-[#111827] flex flex-col antialiased">
      {/* ======================================================== */}
      {/* GLOBAL TOPBAR                                            */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#0F2A43] text-white shadow-md border-b border-[#1E3E5C]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentScreen("portal")}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2C9B8A] to-[#1E3E5C] flex items-center justify-center font-bold text-white shadow-xs">
              <Coffee className="w-5 h-5 text-[#F2A33A]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-none">
                ShiftBr<span className="text-[#F2A33A]">o</span>
              </span>
              <span className="text-[10px] text-slate-300 font-medium">Sistem Operasional Shift Kafe</span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            {currentScreen !== "portal" && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-[#1E3E5C] hover:bg-white/10 text-xs font-bold text-white border border-[#2C6079] transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-[#F2A33A]" />
                <span className="hidden sm:inline">Ganti Peran / Keluar</span>
              </button>
            )}

            {/* Status Paket Badge (klik untuk kelola langganan) */}
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-1.5 text-xs text-slate-200 bg-[#1E3E5C] hover:bg-[#2C6079] px-3 py-1.5 rounded-xl border border-[#2C6079]/50 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${isPremium ? "bg-[#F2A33A] animate-pulse" : "bg-[#2C9B8A]"}`} />
              <span className="font-semibold">{isPremium ? "Paket Premium (Rp25rb/bln)" : "Paket Free"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* TOAST NOTIFIKASI */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 max-w-sm ${
          toast.show ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-12 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-[#0F2A43] text-white p-4 rounded-2xl shadow-2xl border border-[#2C9B8A] flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[#2C9B8A]/20 text-[#2C9B8A] flex items-center justify-center shrink-0 mt-0.5 font-bold">
            ✓
          </div>
          <div>
            <h5 className="text-xs font-bold text-white leading-tight">{toast.title}</h5>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.desc}</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN VIEWPORT                                            */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col items-center justify-center">

        {/* ======================================================== */}
        {/* LAYAR 1: PORTAL HOME (DENGAN MASKOT "BRO" & SAMBUTAN)    */}
        {/* ======================================================== */}
        {currentScreen === "portal" && (
          <div className="w-full max-w-4xl py-4 sm:py-8 text-center animate-in fade-in duration-200">

            {/* BANNER SAMBUTAN + MASKOT BERGERAK BRO */}
            <div className="bg-gradient-to-r from-white via-white to-[#FCE8D8]/50 rounded-3xl p-5 sm:p-7 border-2 border-[#E4E1D6] shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6 text-left relative overflow-hidden">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D7F0EA] text-[#0B6E5C] text-xs font-bold mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#2C9B8A] animate-ping" />
                  Presensi Cepat & Operasional Tanpa Drama
                </div>
                {/* Teks Sambutan Eksak Sesuai Permintaan */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F2A43] tracking-tight leading-tight">
                  &ldquo;hallo selamat datang di shift bro, silahkan lakukan absensi dan selamat bekerja&rdquo;
                </h1>
                <p className="text-xs sm:text-sm text-[#6B7280] mt-2.5 leading-relaxed">
                  Pilih sudut pandang peran Anda di bawah ini: <strong>Owner Kafe</strong> untuk memantau kehadiran & payroll, atau <strong>Pegawai Kafe</strong> untuk start shift dan rekap jam kerja.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#0F2A43]">
                  <Clock className="w-4 h-4 text-[#2C9B8A]" />
                  <span>Waktu Sekarang: {currentDateFormatted} · {currentClock}</span>
                </div>
              </div>

              {/* MASKOT BERGERAK BRO (CANGKIR KOPI BARISTA) */}
              <div className="shrink-0 flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center animate-mascot-bob">
                  {/* Steam Rising Animation */}
                  <div className="absolute -top-3 left-10 flex gap-2">
                    <span className="w-2 h-7 bg-[#F2A33A]/60 rounded-full blur-[1px] animate-mascot-steam-1" />
                    <span className="w-2 h-9 bg-[#2C9B8A]/60 rounded-full blur-[1px] animate-mascot-steam-2" />
                    <span className="w-1.5 h-6 bg-[#F2A33A]/50 rounded-full blur-[1px] animate-mascot-steam-1" />
                  </div>

                  {/* Coffee Cup Character Body */}
                  <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-xl">
                    <ellipse cx="80" cy="142" rx="60" ry="12" fill="#E4E1D6" stroke="#0F2A43" strokeWidth="4" />
                    <ellipse cx="80" cy="140" rx="45" ry="8" fill="#F4F2EA" />

                    <path
                      d="M 120 70 C 150 70, 150 115, 120 115"
                      fill="none"
                      stroke="#0F2A43"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />

                    <path
                      d="M 35 55 L 42 120 C 45 136, 115 136, 118 120 L 125 55 Z"
                      fill="#FFFFFF"
                      stroke="#0F2A43"
                      strokeWidth="5"
                    />

                    {/* Barista Apron Bib */}
                    <path
                      d="M 52 85 L 108 85 L 104 125 C 100 132, 60 132, 56 125 Z"
                      fill="#2C9B8A"
                    />
                    <path d="M 65 72 L 65 85 M 95 72 L 95 85" stroke="#0F2A43" strokeWidth="3" />

                    {/* NAMA MASKOT DIUBAH JADI "BRO" PADA CELEMEK */}
                    <rect x="68" y="94" width="24" height="8" rx="2" fill="#F2A33A" stroke="#0F2A43" strokeWidth="1" />
                    <text x="80" y="100.5" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0F2A43">BRO</text>

                    {/* Coffee surface */}
                    <ellipse cx="80" cy="55" rx="45" ry="12" fill="#6B4226" stroke="#0F2A43" strokeWidth="4" />
                    {/* Latte Art Heart */}
                    <path
                      d="M 80 58 C 76 52, 70 54, 73 60 C 76 64, 80 67, 80 67 C 80 67, 84 64, 87 60 C 90 54, 84 52, 80 58 Z"
                      fill="#FFF"
                    />

                    {/* Kawaii Eyes */}
                    <circle cx="65" cy="74" r="5" fill="#0F2A43" />
                    <circle cx="67" cy="72" r="1.8" fill="#FFF" />
                    <circle cx="95" cy="74" r="5" fill="#0F2A43" />
                    <circle cx="97" cy="72" r="1.8" fill="#FFF" />

                    {/* Rosy Cheeks */}
                    <circle cx="56" cy="80" r="4" fill="#FCE8D8" opacity="0.9" />
                    <circle cx="104" cy="80" r="4" fill="#FCE8D8" opacity="0.9" />

                    {/* Smile */}
                    <path d="M 74 79 Q 80 85 86 79" fill="none" stroke="#0F2A43" strokeWidth="3" strokeLinecap="round" />

                    {/* Waving Hand (Arm waving animation) */}
                    <g className="animate-mascot-wave origin-[35px_85px]">
                      <path
                        d="M 38 88 Q 20 70 14 62 Q 10 58 16 54 Q 22 52 26 58 Q 32 66 42 78"
                        fill="#F2A33A"
                        stroke="#0F2A43"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                      />
                      <circle cx="15" cy="56" r="3.5" fill="#FFF" stroke="#0F2A43" strokeWidth="1.5" />
                      <circle cx="19" cy="53" r="3" fill="#FFF" stroke="#0F2A43" strokeWidth="1.5" />
                    </g>
                  </svg>
                </div>
                {/* NAMA MASKOT: BRO */}
                <span className="text-[10px] font-black tracking-wider text-[#0F2A43] bg-white px-2.5 py-0.5 rounded-full border border-[#E4E1D6] shadow-xs mt-1">
                  Hai! Aku Bro 👋
                </span>
              </div>
            </div>

            {/* 2 PILIHAN PERAN (HANYA OWNER & PEGAWAI KAFE) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8 max-w-3xl mx-auto">
              {/* Card 1: Owner / HR */}
              <div className="bg-white p-7 rounded-3xl border-2 border-[#E4E1D6] hover:border-[#0F2A43] transition-all shadow-xs hover:shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#0F2A43] text-white flex items-center justify-center mb-4 shadow-xs">
                    <Building2 className="w-7 h-7 text-[#F2A33A]" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#F2A33A] block">
                    POV 01 · Akses Pemilik & Finansial
                  </span>
                  <h3 className="text-2xl font-bold text-[#0F2A43] mt-1 mb-2">Owner / HR Kafe</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed mb-6">
                    Lihat siapa saja pegawai yang masuk berdasarkan filter tanggal, bulan, dan tahun. Cek staf yang sedang bekerja, shift pagi/malam, hitung gaji otomatis, serta konfirmasi lembur 1-klik.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E4E1D6] space-y-2">
                  <button
                    type="button"
                    onClick={() => openAuthForm("owner", "daftar")}
                    className="w-full bg-[#0F2A43] hover:bg-[#1E3E5C] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 touch-target"
                  >
                    <span>Daftar Kafe & Buka Dasbor Owner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthForm("owner", "login")}
                    className="w-full bg-[#F4F2EA] hover:bg-[#E4E1D6] text-[#0F2A43] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors"
                  >
                    Masuk Akun Owner Terdaftar
                  </button>
                </div>
              </div>

              {/* Card 2: Pegawai Kafe */}
              <div className="bg-white p-7 rounded-3xl border-2 border-[#E4E1D6] hover:border-[#2C9B8A] transition-all shadow-xs hover:shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#2C9B8A] text-white flex items-center justify-center mb-4 shadow-xs">
                    <UserCheck className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#0B6E5C] block">
                    POV 02 · Antarmuka Absensi Pegawai
                  </span>
                  <h3 className="text-2xl font-bold text-[#0F2A43] mt-1 mb-2">Pegawai Kafe</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed mb-6">
                    Ketik Nama, Password, dan Jobdesk (Barista, Kasir, Kitchen). Tekan tombol <strong>Start Shift</strong> untuk mulai bekerja, lihat <strong>Riwayat Absen</strong> lengkap (Hari, Tanggal, Shift Pagi/Malam), serta tombol <strong>Akhiri Shift</strong> di pojok kanan riwayat.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E4E1D6] space-y-2">
                  <button
                    type="button"
                    onClick={() => openAuthForm("pegawai", "login")}
                    className="w-full bg-[#2C9B8A] hover:bg-[#237c6e] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 touch-target"
                  >
                    <span>Masuk / Absensi Pegawai</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="block text-center text-[10px] text-[#6B7280]">
                    Tampilan penuh & bersih tanpa bingkai ponsel
                  </span>
                </div>
              </div>
            </div>

            {/* BANNER FASILITAS: FREE vs PREMIUM (RP25.000 / BULAN) */}
            <div className="bg-white rounded-3xl p-6 border border-[#E4E1D6] shadow-sm max-w-3xl mx-auto text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E1D6]">
                <div>
                  <h4 className="text-sm font-bold text-[#0F2A43]">Fasilitas Layanan ShiftBro: Free vs Premium</h4>
                  <p className="text-xs text-[#6B7280]">Solusi efisiensi operasional kafe terjangkau hanya Rp25.000 / bulan</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isPremium ? "bg-[#F2A33A] text-[#0F2A43] shadow-xs" : "bg-[#2C9B8A] text-white shadow-xs hover:bg-[#237c6e]"
                    }`}
                  >
                    {isPremium ? "★ Premium Aktif" : "Upgrade ke Premium →"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 text-xs">
                {/* Kolom Free */}
                <div className="p-4 rounded-2xl bg-[#F4F2EA]/60 border border-[#E4E1D6]">
                  <span className="font-bold text-[#6B7280] uppercase tracking-wider block mb-2">Paket Free (Gratis)</span>
                  <ul className="space-y-2 text-[#0F2A43]">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2C9B8A] shrink-0" />
                      <span>Absen Masuk & Pulang (Start/End Shift 2-Langkah)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2C9B8A] shrink-0" />
                      <span>Kunci Wi-Fi Kafe (Hanya bisa absen di kafe)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2C9B8A] shrink-0" />
                      <span>Foto Wajah / Selfie Verification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2C9B8A] shrink-0" />
                      <span>Rekap Jam Kerja Dasar</span>
                    </li>
                  </ul>
                </div>

                {/* Kolom Premium */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-[#F2A33A]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-[#B03A00] uppercase tracking-wider">Paket Premium (Rp25.000 / bln)</span>
                    <span className="text-[10px] font-bold bg-[#F2A33A] text-[#0F2A43] px-2 py-0.5 rounded-full">Best Value</span>
                  </div>
                  <ul className="space-y-2 text-[#0F2A43]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#B03A00] shrink-0 mt-0.5" />
                      <div>
                        <strong>1. Hitung Gaji Otomatis (Payroll):</strong> Jam Kerja x Tarif per Jam = Total Gaji. Download laporan Excel akhir bulan!
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#B03A00] shrink-0 mt-0.5" />
                      <div>
                        <strong>2. 🚨 Overtime Guard (Cegah Lembur Siluman):</strong> Auto-alert jika mendekati 40 jam & Konfirmasi Lembur 1-Klik Owner.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#B03A00] shrink-0 mt-0.5" />
                      <div>
                        <strong>3. Manajemen Shift & Tukar Shift Mandiri:</strong> Pegawai ajukan tukar shift di web, Owner tinggal tekan tombol Approve!
                      </div>
                    </li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    className="mt-4 w-full bg-[#F2A33A] hover:bg-[#e09129] text-[#0F2A43] font-bold py-2.5 rounded-xl text-xs shadow-xs flex items-center justify-center gap-1.5"
                  >
                    {isPremium ? "Kelola Langganan Premium" : "Berlangganan Premium Sekarang →"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* LAYAR 2: FORM DAFTAR & LOGIN (SESUAI 2 POV)              */}
        {/* ======================================================== */}
        {currentScreen === "form-auth" && (
          <div className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 border border-[#E4E1D6] shadow-xl relative animate-in zoom-in-95 duration-200">
            {/* Header Form */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E1D6] mb-5">
              <button
                type="button"
                onClick={() => setCurrentScreen("portal")}
                className="text-xs font-bold text-[#2C6079] hover:text-[#0F2A43] flex items-center gap-1 touch-target"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Pilih Peran Lain</span>
              </button>

              <span className="text-[10px] uppercase font-mono font-bold bg-[#F4F2EA] px-2.5 py-1 rounded text-[#0F2A43]">
                POV: {selectedRole === "owner" ? "OWNER KAFE" : "PEGAWAI KAFE"}
              </span>
            </div>

            {/* Toggle Daftar vs Login untuk Owner */}
            {selectedRole === "owner" && (
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#F4F2EA] rounded-xl mb-5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMode("daftar")}
                  className={`py-2 rounded-lg transition-all ${
                    authMode === "daftar" ? "bg-[#0F2A43] text-white shadow-xs" : "text-[#6B7280] hover:text-[#0F2A43]"
                  }`}
                >
                  Daftar Kafe Baru
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`py-2 rounded-lg transition-all ${
                    authMode === "login" ? "bg-[#0F2A43] text-white shadow-xs" : "text-[#6B7280] hover:text-[#0F2A43]"
                  }`}
                >
                  Login Owner
                </button>
              </div>
            )}

            {/* A. FORM POV OWNER / HR */}
            {selectedRole === "owner" && (
              <form onSubmit={handleOwnerAuthSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2A43]">
                    {authMode === "daftar" ? "Pendaftaran Owner & Outlet Baru" : "Masuk ke Dasbor Owner"}
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {authMode === "daftar"
                      ? "Ketik nama kafe dan data owner untuk inisialisasi sistem."
                      : "Gunakan email & kata sandi yang telah Anda daftarkan."}
                  </p>
                </div>

                {authMode === "daftar" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#0F2A43] mb-1">Nama Outlet Kafe *</label>
                      <input
                        type="text"
                        required
                        value={ownerOutlet}
                        onChange={(e) => setOwnerOutlet(e.target.value)}
                        placeholder="Contoh: Kopi Harmoni, Titik Temu, dll."
                        className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#0F2A43]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F2A43] mb-1">Nama Lengkap Owner / HR *</label>
                      <input
                        type="text"
                        required
                        value={ownerNama}
                        onChange={(e) => setOwnerNama(e.target.value)}
                        placeholder="Contoh: Syifa Azzahra"
                        className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#0F2A43]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#0F2A43] mb-1">Email Bisnis Owner *</label>
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="nama@kopiharmoni.com"
                    className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#0F2A43]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0F2A43]">Password *</label>
                    <button
                      type="button"
                      onClick={() => setShowOwnerPassword(!showOwnerPassword)}
                      className="text-[11px] text-[#2C6079] hover:underline flex items-center gap-1"
                    >
                      {showOwnerPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showOwnerPassword ? "Tutup" : "Lihat"}</span>
                    </button>
                  </div>
                  <input
                    type={showOwnerPassword ? "text" : "password"}
                    required
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="Ketik password Anda"
                    className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3.5 py-2.5 text-xs text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#0F2A43]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0F2A43] hover:bg-[#1E3E5C] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md touch-target flex items-center justify-center gap-1.5"
                >
                  <span>{authMode === "daftar" ? "Daftarkan Kafe & Buka Dasbor" : "Masuk ke Dasbor Owner"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* B. FORM POV PEGAWAI KAFE (NAMA, PASSWORD, JOBDESK) */}
            {selectedRole === "pegawai" && (
              <form onSubmit={handlePegawaiAuthSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2A43]">Masuk Pegawai Kafe</h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Ketik nama, password, dan pilih jobdesk Anda sebelum memulai shift.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2A43] mb-1">Nama Lengkap Pegawai *</label>
                  <input
                    type="text"
                    required
                    value={pegawaiNama}
                    onChange={(e) => setPegawaiNama(e.target.value)}
                    placeholder="Contoh: Joko Susanto"
                    className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#2C9B8A]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#0F2A43]">Password Akun Pegawai *</label>
                    <button
                      type="button"
                      onClick={() => setShowPegawaiPassword(!showPegawaiPassword)}
                      className="text-[11px] text-[#2C6079] hover:underline flex items-center gap-1"
                    >
                      {showPegawaiPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPegawaiPassword ? "Tutup" : "Lihat"}</span>
                    </button>
                  </div>
                  <input
                    type={showPegawaiPassword ? "text" : "password"}
                    required
                    value={pegawaiPassword}
                    onChange={(e) => setPegawaiPassword(e.target.value)}
                    placeholder="Ketik password"
                    className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3.5 py-2.5 text-xs text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#2C9B8A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2A43] mb-1.5">Pilih Jobdesk / Stasiun Shift *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Barista", "Kasir", "Kitchen"] as const).map((station) => (
                      <button
                        key={station}
                        type="button"
                        onClick={() => setPegawaiJobdesk(station)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          pegawaiJobdesk === station
                            ? "bg-[#2C9B8A] text-white border-[#2C9B8A] shadow-xs"
                            : "bg-[#F4F2EA] text-[#6B7280] border-[#E4E1D6] hover:bg-slate-50"
                        }`}
                      >
                        {station}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2C9B8A] hover:bg-[#237c6e] text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md touch-target flex items-center justify-center gap-1.5"
                >
                  <span>Buka Halaman Presensi ({pegawaiJobdesk})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* LAYAR 3: DASBOR OWNER (FILTER TANGGAL, JAM & FITUR PREMIUM) */}
        {/* ======================================================== */}
        {currentScreen === "dashboard-owner" && (
          <div className="w-full max-w-5xl space-y-6 animate-in fade-in duration-200">

            {/* Header Outlet Identity */}
            <div className="bg-white rounded-3xl p-6 border border-[#E4E1D6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">👑</span>
                  <h2 className="text-2xl font-black text-[#0F2A43]">Dasbor Operasional Owner</h2>
                  <span className="bg-[#D7F0EA] text-[#0B6E5C] text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Akses Penuh
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">
                  Outlet: <strong className="text-[#0F2A43]">{activeOwner?.outlet || "Kopi Harmoni"}</strong> · Owner:{" "}
                  <strong className="text-[#0F2A43]">{activeOwner?.nama || "Ibu Syifa"}</strong> ({activeOwner?.email || "owner@kopiharmoni.com"})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                    isPremium
                      ? "bg-amber-100 text-[#B03A00] border-amber-300 hover:bg-amber-200"
                      : "bg-[#F2A33A] text-[#0F2A43] border-[#F2A33A] hover:bg-[#e09129]"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-[#F2A33A]" />
                  <span>{isPremium ? `Premium Aktif s/d ${premiumExpiryLabel}` : "Upgrade ke Premium"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold"
                >
                  Keluar
                </button>
              </div>
            </div>

            {/* OVERTIME GUARD BANNER (PREMIUM) */}
            {isPremium && (
              <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 border-2 border-[#F2A33A] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F2A33A] text-[#0F2A43] flex items-center justify-center shrink-0 font-bold">
                    <AlertTriangle className="w-5 h-5 text-[#0F2A43]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#B03A00]">
                        🚨 Auto-Alert Overtime Guard (Pencegahan Lembur Siluman)
                      </h4>
                      <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.2 rounded-full">
                        Peringatan Aktif
                      </span>
                    </div>
                    <p className="text-xs text-[#0F2A43] mt-1 leading-relaxed">
                      <strong>Joko Susanto</strong> sudah bekerja <strong>38 jam minggu ini</strong> (sisa 2 jam sebelum batas maksimum 40 jam). Terdeteksi potensi lembur 1.5 jam hari ini.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleApproveOvertime("ATT-101")}
                    className="bg-[#2C9B8A] hover:bg-[#237c6e] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 touch-target"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Konfirmasi Lembur 1-Klik</span>
                  </button>
                </div>
              </div>
            )}

            {/* BAGIAN PARA PEGAWAI DENGAN MENU FILTER LENGKAP */}
            <div className="bg-white rounded-3xl p-6 border border-[#E4E1D6] shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E1D6]">
                <div>
                  <h3 className="text-base font-bold text-[#0F2A43]">
                    Daftar Absensi & Status Kerja Pegawai
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Pantau pegawai yang sedang aktif bekerja di jam saat Anda mengecek, atau yang sudah menyelesaikan shift.
                  </p>
                </div>

                {isPremium && (
                  <button
                    type="button"
                    onClick={() => showToast("Download Laporan Gaji", "Mengunduh file laporan payroll bulanan format Excel/CSV.", "success")}
                    className="self-start sm:self-auto bg-[#F2A33A] hover:bg-[#e09129] text-[#0F2A43] px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download Rekap Gaji (.xlsx)</span>
                  </button>
                )}
              </div>

              {/* MENU FILTER TANGGAL, BULAN, TAHUN & STASIUN */}
              <div className="p-4 rounded-2xl bg-[#F4F2EA] border border-[#E4E1D6] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F2A43] flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[#2C9B8A]" />
                    Filter Berdasarkan Tanggal Masuk Kerja:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDay("14");
                      setFilterMonth("10");
                      setFilterYear("2026");
                      setFilterStation("Semua");
                    }}
                    className="text-[11px] text-[#2C6079] hover:underline font-bold"
                  >
                    Reset ke Hari Ini (14 Okt 2026)
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* Filter Tanggal */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Tanggal</label>
                    <select
                      value={filterDay}
                      onChange={(e) => setFilterDay(e.target.value)}
                      className="w-full bg-white border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-bold text-[#0F2A43]"
                    >
                      <option value="Semua">Semua Tanggal</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                          Tanggal {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Bulan */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Bulan</label>
                    <select
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="w-full bg-white border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-bold text-[#0F2A43]"
                    >
                      <option value="Semua">Semua Bulan</option>
                      <option value="1">Januari</option>
                      <option value="2">Februari</option>
                      <option value="3">Maret</option>
                      <option value="4">April</option>
                      <option value="5">Mei</option>
                      <option value="6">Juni</option>
                      <option value="7">Juli</option>
                      <option value="8">Agustus</option>
                      <option value="9">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </select>
                  </div>

                  {/* Filter Tahun */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Tahun</label>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="w-full bg-white border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-bold text-[#0F2A43]"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="Semua">Semua Tahun</option>
                    </select>
                  </div>

                  {/* Filter Stasiun */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">Stasiun Jobdesk</label>
                    <select
                      value={filterStation}
                      onChange={(e) => setFilterStation(e.target.value)}
                      className="w-full bg-white border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-bold text-[#0F2A43]"
                    >
                      <option value="Semua">Semua Stasiun</option>
                      <option value="Barista">Barista</option>
                      <option value="Kasir">Kasir</option>
                      <option value="Kitchen">Kitchen</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TABEL HASIL FILTER ABSENSI */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F4F2EA] text-[#0F2A43] font-bold border-b border-[#E4E1D6]">
                    <tr>
                      <th className="py-3 px-3 rounded-l-xl">Pegawai & Stasiun</th>
                      <th className="py-3 px-3">Tanggal & Hari</th>
                      <th className="py-3 px-3">Kategori Shift</th>
                      <th className="py-3 px-3">Jam Masuk - Pulang</th>
                      <th className="py-3 px-3">Status Saat Ini</th>
                      {isPremium && <th className="py-3 px-3 rounded-r-xl text-right">Hitung Gaji (Tarif/Jam)</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E1D6]">
                    {filteredAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={isPremium ? 6 : 5} className="py-8 text-center text-slate-400">
                          Tidak ada data absensi pegawai untuk filter tanggal/bulan/tahun tersebut.
                        </td>
                      </tr>
                    ) : (
                      filteredAttendance.map((rec) => {
                        const isWorkingNow = rec.status === "Sedang Bekerja";
                        const isShiftPagi = rec.shiftType.includes("Pagi");
                        const totalGaji = Math.round(rec.durasiJam * hourlyRate);

                        return (
                          <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-bold text-[#0F2A43] block">{rec.namaPegawai}</span>
                              <span className="text-[10px] text-[#2C6079] font-semibold">{rec.peranStasiun}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-[#0F2A43]">{rec.hari}</span>
                              <span className="font-mono text-[10px] text-[#6B7280] block">{rec.tanggalInput}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isShiftPagi
                                    ? "bg-amber-100 text-amber-900 border border-amber-200"
                                    : "bg-indigo-100 text-indigo-900 border border-indigo-200"
                                }`}
                              >
                                {isShiftPagi ? "🌅 Shift Pagi" : "🌙 Shift Malam"}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono">
                              <span className="font-bold text-[#0F2A43]">{rec.jamMulai}</span>
                              <span className="text-slate-400"> s/d </span>
                              <span className="text-[#6B7280]">{rec.jamSelesai || "— (Sedang Berjalan)"}</span>
                            </td>
                            <td className="py-3 px-3">
                              {isWorkingNow ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#D7F0EA] text-[#0B6E5C] border border-[#2C9B8A]/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B6E5C] animate-ping" />
                                  Sedang Bekerja ({isShiftPagi ? "Shift Pagi" : "Shift Malam"})
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                  ✓ Selesai Shift ({rec.durasiJam} Jam)
                                </span>
                              )}
                            </td>
                            {isPremium && (
                              <td className="py-3 px-3 text-right">
                                <span className="font-black text-[#0F2A43] text-sm tabular-nums">
                                  Rp{totalGaji.toLocaleString("id-ID")}
                                </span>
                                <span className="text-[10px] text-[#6B7280] block">
                                  {rec.durasiJam} jam x Rp{hourlyRate.toLocaleString("id-ID")}
                                </span>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MANAJEMEN TUKAR SHIFT MANDIRI (1-KLIK APPROVAL OWNER) */}
            {isPremium && (
              <div className="bg-white rounded-3xl p-6 border border-[#E4E1D6] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D6]">
                  <div>
                    <h3 className="text-base font-bold text-[#0F2A43]">
                      Manajemen Tukar Shift Mandiri (1-Klik Approval)
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Pegawai mengajukan dari akun mereka, Owner cukup klik Setujui/Approve untuk meresmikan.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#0B6E5C] bg-[#D7F0EA] px-3 py-1 rounded-full">
                    {swapRequests.filter((r) => r.status === "Menunggu Approval").length} Pengajuan Menunggu
                  </span>
                </div>

                <div className="space-y-3">
                  {swapRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-[#F4F2EA] border border-[#E4E1D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0F2A43]">{req.pemohon}</span>
                          <span className="text-[#6B7280]">ingin tukar shift dengan</span>
                          <span className="font-bold text-[#0F2A43]">{req.target}</span>
                        </div>
                        <p className="text-[11px] text-[#2C6079] mt-0.5">
                          Jadwal: {req.tanggal} ({req.shift}) · Alasan: &ldquo;{req.alasan}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {req.status === "Menunggu Approval" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveSwap(req.id)}
                              className="bg-[#2C9B8A] hover:bg-[#237c6e] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs touch-target"
                            >
                              ✓ Approve Tukar Shift
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSwapRequests((prev) =>
                                  prev.map((r) => (r.id === req.id ? { ...r, status: "Ditolak" } : r))
                                );
                                showToast("Tukar Shift Ditolak", "Jadwal asli tetap berlaku.", "error");
                              }}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold"
                            >
                              Tolak
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              req.status === "Disetujui" ? "bg-[#D7F0EA] text-[#0B6E5C]" : "bg-red-100 text-red-700"
                            }`}
                          >
                            Status: {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* LAYAR 4: TAMPILAN ABSENSI PEGAWAI (FULL VIEW - NO HP FRAME)*/}
        {/* ======================================================== */}
        {currentScreen === "dashboard-pegawai" && activePegawai && (
          <div className="w-full max-w-5xl space-y-6 animate-in fade-in duration-200">

            {/* Header Profil Pegawai (Full Width) */}
            <div className="bg-white rounded-3xl p-6 border border-[#E4E1D6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0F2A43] text-white flex items-center justify-center font-black text-lg shadow-xs">
                  {activePegawai.nama[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-[#0F2A43] leading-tight">{activePegawai.nama}</h2>
                    <span className="text-xs bg-[#D7F0EA] text-[#0B6E5C] font-bold px-2.5 py-0.5 rounded-full">
                      Stasiun {activePegawai.jobdesk}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Outlet: <strong className="text-[#0F2A43]">{activePegawai.outlet}</strong> · Sistem Presensi Kafe ShiftBro
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 text-[#B03A00] hover:bg-amber-100 border border-[#F2A33A]/40 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#F2A33A]" />
                  <span>Ajukan Tukar Shift</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold transition-colors"
                >
                  Keluar
                </button>
              </div>
            </div>

            {/* KARTU MULAI SHIFT BARU (JIKA BELUM MULAI SHIFT) */}
            {!isShiftActive ? (
              <div className="bg-gradient-to-br from-white via-white to-[#D7F0EA]/40 rounded-3xl p-6 border-2 border-[#2C9B8A] shadow-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E1D6]">
                  <div>
                    <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-[#D7F0EA] text-[#0B6E5C] px-3 py-1 rounded-full mb-1">
                      Menu Presensi Masuk (Start Shift)
                    </span>
                    <h3 className="text-xl font-black text-[#0F2A43]">
                      Halo, {activePegawai.nama}! Silakan Mulai Shift Anda
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B6E5C] bg-[#D7F0EA] px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    <Wifi className="w-3.5 h-3.5" />
                    <span>Wi-Fi Kafe Terhubung</span>
                  </div>
                </div>

                {/* Grid Rincian Informasi Input Shift */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Info 1: Nama & Jobdesk */}
                  <div className="p-3.5 rounded-2xl bg-[#F4F2EA] border border-[#E4E1D6]">
                    <span className="text-[10px] uppercase font-bold text-[#6B7280] block">Nama Pegawai</span>
                    <strong className="text-sm text-[#0F2A43] block mt-0.5">{activePegawai.nama}</strong>
                    <span className="text-[11px] text-[#2C6079] font-semibold">Stasiun {activePegawai.jobdesk}</span>
                  </div>

                  {/* Info 2: Waktu Input (Hari, Tanggal, Bulan, Tahun) */}
                  <div className="p-3.5 rounded-2xl bg-[#F4F2EA] border border-[#E4E1D6]">
                    <span className="text-[10px] uppercase font-bold text-[#6B7280] block">Hari & Tanggal Input</span>
                    <strong className="text-sm text-[#0F2A43] block mt-0.5">{currentDateFormatted}</strong>
                    <span className="text-[11px] text-[#0B6E5C] font-mono font-semibold">Pukul {currentClock}</span>
                  </div>

                  {/* Info 3: Pilihan Jam Shift (Mulai s/d Selesai) */}
                  <div className="p-3.5 rounded-2xl bg-[#F4F2EA] border border-[#E4E1D6]">
                    <label className="text-[10px] uppercase font-bold text-[#6B7280] block mb-1">Pilih Kategori Shift</label>
                    <select
                      value={selectedShiftType}
                      onChange={(e) => setSelectedShiftType(e.target.value as ShiftType)}
                      className="w-full bg-white border border-[#E4E1D6] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#2C9B8A]"
                    >
                      <option value="Shift Pagi (07:00 - 15:00)">🌅 Shift Pagi (07:00 – 15:00 WIB)</option>
                      <option value="Shift Malam (15:00 - 23:00)">🌙 Shift Malam (15:00 – 23:00 WIB)</option>
                    </select>
                  </div>

                  {/* Info 4: Rentang Jam Kerja */}
                  <div className="p-3.5 rounded-2xl bg-[#D7F0EA]/60 border border-[#2C9B8A]/40 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#0B6E5C] block">Rentang Jam Kerja</span>
                    <strong className="text-sm text-[#0F2A43] block">
                      {selectedShiftType.includes("Pagi") ? "07:00 s/d 15:00 WIB" : "15:00 s/d 23:00 WIB"}
                    </strong>
                    <span className="text-[10px] text-[#0B6E5C] font-semibold">Durasi Normal: 8 Jam Kerja</span>
                  </div>
                </div>

                {/* Tombol Aksi Start Shift */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-[#6B7280]">
                    Pastikan Anda sudah berada di outlet kafe sebelum menekan tombol di samping.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartShift}
                    className="w-full sm:w-auto bg-[#2C9B8A] hover:bg-[#237c6e] text-white font-black px-7 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all touch-target flex items-center justify-center gap-2"
                  >
                    <Clock className="w-5 h-5 text-white" />
                    <span>Start Shift (Mulai Bekerja Sekarang)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* KARTU STATUS SHIFT AKTIF (SEDANG BEKERJA) */
              <div className="bg-gradient-to-r from-emerald-50 via-white to-amber-50/50 rounded-3xl p-6 border-2 border-[#2C9B8A] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#2C9B8A] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-6 h-6 animate-spin text-[#F2A33A]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <h3 className="text-base font-black text-[#0F2A43]">
                        Anda Sedang Bekerja ({activeShiftRecord?.shiftType.includes("Pagi") ? "Shift Pagi" : "Shift Malam"})
                      </h3>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-1">
                      Mulai pukul <strong className="text-[#0F2A43]">{activeShiftRecord?.jamMulai} WIB</strong> pada hari <strong>{activeShiftRecord?.hari}, {activeShiftRecord?.tanggalInput}</strong>.
                    </p>
                    <p className="text-[11px] text-[#2C6079] font-medium mt-0.5">
                      💡 Tombol <strong>&quot;Akhiri Shift&quot;</strong> tersedia di pojok kanan kartu riwayat absen Anda di bawah ini jika telah selesai bekerja.
                    </p>
                  </div>
                </div>

                {activeShiftRecord && (
                  <button
                    type="button"
                    onClick={() => handleTriggerEndShift(activeShiftRecord)}
                    className="bg-[#BA1A1A] hover:bg-[#961414] text-white font-black px-5 py-3 rounded-2xl text-xs shadow-md transition-all touch-target flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Akhiri Shift Hari Ini</span>
                  </button>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* RIWAYAT ABSEN PEGAWAI (DENGAN TOMBOL AKHIRI SHIFT DI POJOK KANAN) */}
            {/* ======================================================== */}
            <div className="bg-white rounded-3xl p-6 border border-[#E4E1D6] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E4E1D6]">
                <div>
                  <h3 className="text-base font-bold text-[#0F2A43]">
                    Riwayat Absen Anda ({activePegawai.nama})
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Catatan hari, tanggal, kategori shift (Pagi/Malam), dan tombol akhiri shift berada di pojok kanan kartu aktif.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F2A43]">
                  <Calendar className="w-4 h-4 text-[#2C9B8A]" />
                  <span>Total Absen: {pegawaiHistory.length} Hari</span>
                </div>
              </div>

              {/* LIST RIWAYAT ABSEN PEGAWAI */}
              <div className="space-y-3.5">
                {pegawaiHistory.length === 0 ? (
                  <div className="p-8 text-center bg-[#F4F2EA] rounded-2xl border border-dashed border-[#E4E1D6]">
                    <p className="text-xs font-bold text-[#0F2A43]">Belum ada riwayat absensi yang tercatat.</p>
                    <p className="text-[11px] text-[#6B7280] mt-1">
                      Tekan tombol <strong>Start Shift (Mulai Bekerja)</strong> di atas untuk membuat catatan absensi hari ini.
                    </p>
                  </div>
                ) : (
                  pegawaiHistory.map((rec) => {
                    const isWorkingNow = rec.status === "Sedang Bekerja";
                    const isShiftPagi = rec.shiftType.includes("Pagi");

                    return (
                      <div
                        key={rec.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isWorkingNow
                            ? "bg-gradient-to-r from-white via-white to-amber-50/40 border-2 border-[#F2A33A] shadow-md"
                            : "bg-[#F4F2EA]/70 border-[#E4E1D6]"
                        }`}
                      >
                        {/* Kiri: Detail Hari, Tanggal, dan Shift */}
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-[#0F2A43]">
                              {rec.hari}, {rec.tanggalInput}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isShiftPagi
                                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                                  : "bg-indigo-100 text-indigo-900 border border-indigo-200"
                              }`}
                            >
                              {isShiftPagi ? "🌅 Shift Pagi (07:00 – 15:00)" : "🌙 Shift Malam (15:00 – 23:00)"}
                            </span>
                            <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-[#E4E1D6] text-[#2C6079]">
                              Stasiun {rec.peranStasiun}
                            </span>
                          </div>

                          <div className="text-xs text-[#6B7280] flex flex-wrap items-center gap-3">
                            <span className="font-mono">
                              Jam Masuk: <strong className="text-[#0F2A43]">{rec.jamMulai} WIB</strong>
                            </span>
                            <span>·</span>
                            <span className="font-mono">
                              Jam Pulang: <strong className="text-[#0F2A43]">{rec.jamSelesai ? `${rec.jamSelesai} WIB` : "Sedang Berlangsung"}</strong>
                            </span>
                            <span>·</span>
                            <span>
                              Status:{" "}
                              <strong className={isWorkingNow ? "text-[#0B6E5C]" : "text-[#0F2A43]"}>
                                {isWorkingNow ? "🟢 Sedang Bekerja" : `✓ Selesai (${rec.durasiJam} Jam)`}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* POJOK KANAN DARI RIWAYAT ABSEN DI HARI ITU: TOMBOL AKHIRI SHIFT ATAU STATUS SELESAI */}
                        <div className="shrink-0 flex items-center justify-end">
                          {isWorkingNow ? (
                            <button
                              type="button"
                              onClick={() => handleTriggerEndShift(rec)}
                              className="bg-[#BA1A1A] hover:bg-[#961414] text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition-all touch-target flex items-center gap-1.5"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Akhiri Shift</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-[#0B6E5C] bg-[#D7F0EA] px-3 py-1 rounded-xl flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Shift Selesai Tercatat</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* MODAL 1: VERIFIKASI 2 LANGKAH AKHIRI SHIFT (PENCEGAHAN)   */}
      {/* ======================================================== */}
      {showEndShiftConfirmModal && recordToEnd && (
        <div className="fixed inset-0 z-50 bg-[#0F2A43]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-[#E4E1D6] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-2 text-xl font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-[#0F2A43]">
                Apakah kamu yakin ingin mengakhiri shift?
              </h3>
              <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                Peringatan ini dibuat agar tombol tidak sengaja tertekan. Jika Anda menyetujui, jam kerja resmi shift hari ini akan dihentikan dan dicatat ke rekap absensi.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F4F2EA] text-xs text-[#0F2A43] space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Pegawai:</span>
                <span className="font-bold">{recordToEnd.namaPegawai}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Stasiun:</span>
                <span className="font-bold">{recordToEnd.peranStasiun}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Kategori Shift:</span>
                <span className="font-bold">{recordToEnd.shiftType.includes("Pagi") ? "Shift Pagi" : "Shift Malam"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Jam Mulai:</span>
                <span className="font-bold">{recordToEnd.jamMulai} WIB</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEndShiftConfirmModal(false)}
                className="flex-1 py-3 px-3 rounded-xl border border-[#E4E1D6] text-xs font-bold text-[#6B7280] hover:bg-slate-50 transition-colors"
              >
                Batal / Lanjut Bekerja
              </button>
              <button
                type="button"
                onClick={handleConfirmEndShift}
                className="flex-1 py-3 px-3 rounded-xl bg-[#BA1A1A] hover:bg-[#961414] text-white text-xs font-black shadow-md transition-all touch-target"
              >
                Ya, Akhiri Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: FORM PENGAJUAN TUKAR SHIFT (PEGAWAI)            */}
      {/* ======================================================== */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 bg-[#0F2A43]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-[#E4E1D6] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D6]">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#2C9B8A]" />
                <h4 className="text-xs font-bold text-[#0F2A43]">Pengajuan Tukar Shift Kafe</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSwapModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSwapRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">
                  Pilih Rekan Pengganti Shift:
                </label>
                <select
                  value={swapTargetStaff}
                  onChange={(e) => setSwapTargetStaff(e.target.value)}
                  className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs font-bold text-[#0F2A43]"
                >
                  <option value="Budi Santoso (Barista)">Budi Santoso (Barista)</option>
                  <option value="Siti Ningsih (Kasir)">Siti Ningsih (Kasir)</option>
                  <option value="Ahmad Kitchen (Kitchen)">Ahmad (Kitchen)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6B7280] uppercase mb-1">
                  Alasan Singkat:
                </label>
                <input
                  type="text"
                  required
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  placeholder="Contoh: Ada kuliah/urusan keluarga mendadak"
                  className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3 py-2 text-xs text-[#0F2A43]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E4E1D6] text-xs font-bold text-[#6B7280]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2.5 rounded-xl bg-[#2C9B8A] hover:bg-[#237c6e] text-white text-xs font-bold shadow-md"
                >
                  Kirim ke Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: UPGRADE / KELOLA PREMIUM (BAYAR via lynk.id)     */}
      {/* ======================================================== */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-[#0F2A43]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E4E1D6] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-[#E4E1D6]">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#F2A33A] text-[#0F2A43] flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-[#0F2A43]">ShiftBro Premium</h3>
                  <p className="text-[11px] text-[#6B7280]">{PREMIUM_PRICE_LABEL}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {isPremium ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#D7F0EA] border border-[#2C9B8A]/40 text-xs text-[#0F2A43]">
                  <p className="font-bold">✅ Paket Premium Aktif</p>
                  <p className="mt-1">
                    Berlaku hingga <strong>{premiumExpiryLabel}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeactivatePremium}
                  className="w-full py-2.5 rounded-xl border border-[#E4E1D6] text-xs font-bold text-[#6B7280] hover:bg-slate-50"
                >
                  Nonaktifkan (mode demo)
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <ul className="text-xs text-[#0F2A43] space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#2C9B8A] shrink-0 mt-0.5" />
                    <span>
                      <strong>Hitung Gaji Otomatis (Payroll)</strong> + download rekap .xlsx
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#2C9B8A] shrink-0 mt-0.5" />
                    <span>
                      <strong>Overtime Guard</strong> &amp; konfirmasi lembur 1-klik
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#2C9B8A] shrink-0 mt-0.5" />
                    <span>
                      <strong>Manajemen Tukar Shift Mandiri</strong>
                    </span>
                  </li>
                </ul>

                <a
                  href={LYNK_PRO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#F2A33A] hover:bg-[#e09129] text-[#0F2A43] font-bold py-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Bayar {PREMIUM_PRICE_LABEL} di lynk.id</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                <form onSubmit={handleActivateLicense} className="space-y-2 pt-3 border-t border-[#E4E1D6]">
                  <label className="block text-[11px] font-bold text-[#0F2A43]">
                    Sudah bayar? Masukkan kode lisensi dari lynk.id:
                  </label>
                  <input
                    type="text"
                    value={licenseInput}
                    onChange={(e) => setLicenseInput(e.target.value)}
                    placeholder="Contoh: SHIFTBRO-PRO-XXXXXX"
                    className="w-full bg-[#F4F2EA] border border-[#E4E1D6] rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-[#0F2A43] focus:outline-none focus:ring-2 focus:ring-[#F2A33A]"
                  />
                  {licenseError && (
                    <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{licenseError}</span>
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={licenseLoading}
                    className="w-full bg-[#0F2A43] hover:bg-[#1E3E5C] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                  >
                    {licenseLoading ? "Memverifikasi..." : "Aktivasi Kode Lisensi"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GLOBAL FOOTER */}
      <footer className="bg-white border-t border-[#E4E1D6] py-5 text-center text-xs text-[#6B7280] mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#0F2A43]">ShiftBro</span>
            <span>— Sistem Operasional Shift Kafe & F&B Lokal</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span>100% Antarmuka Bahasa Indonesia</span>
            <span>·</span>
            <span>Warm Operational Utility</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

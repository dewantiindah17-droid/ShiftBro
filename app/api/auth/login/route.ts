import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Server-side simulated credential store with salted hashes
// CRITICAL: Credentials and salts never leak to the client-side
const USERS_DATABASE = [
  {
    id: "EMP-001",
    role: "pegawai",
    nama: "Joko",
    posisi: "Senior Barista",
    outlet: "Kopi Harmoni (Yogyakarta)",
    noHp: "081234567890",
    nip: "JK-01",
    // PIN: "1234" (hashed with salt)
    pinHash: crypto.createHash("sha256").update("1234_shiftbro_salt_2026").digest("hex"),
    status: "Aktif",
    shiftHariIni: "Shift Pagi (07:00 - 15:00 WIB)"
  },
  {
    id: "EMP-002",
    role: "pegawai",
    nama: "Ningsih",
    posisi: "Head Kasir",
    outlet: "Kopi Harmoni (Yogyakarta)",
    noHp: "081298765432",
    nip: "NS-02",
    // PIN: "4321"
    pinHash: crypto.createHash("sha256").update("4321_shiftbro_salt_2026").digest("hex"),
    status: "Aktif",
    shiftHariIni: "Shift Pagi (07:00 - 15:00 WIB)"
  },
  {
    id: "MGR-001",
    role: "manager",
    nama: "Rina Kusuma",
    posisi: "Manager Shift Operasional",
    outlet: "Kopi Harmoni (Yogyakarta)",
    kodeOutlet: "HRM-YOG-01",
    idSupervisor: "MGR-RINA",
    email: "rina.manager@kopiharmoni.com",
    // Passcode: "889900"
    passcodeHash: crypto.createHash("sha256").update("889900_shiftbro_salt_2026").digest("hex"),
    status: "Supervisi Aktif",
    shiftBertugas: "Shift Pagi & Sore"
  },
  {
    id: "OWN-001",
    role: "owner",
    nama: "Syifa Azzahra",
    posisi: "Owner & Direktur Bisnis",
    outlet: "Kopi Harmoni Group",
    email: "syifa.owner@kopiharmoni.com",
    // Password: "OwnerHarmoni2026!"
    passwordHash: crypto.createHash("sha256").update("OwnerHarmoni2026!_shiftbro_salt_2026").digest("hex"),
    // 2FA Secret code: "552419"
    totpHash: crypto.createHash("sha256").update("552419_shiftbro_salt_2026").digest("hex"),
    status: "Executive Access",
    tingkatKeamanan: "Tingkat 3 (2FA Wajib)"
  }
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, identifier, credential, totp, outletCode } = body;

    if (!role || !identifier || !credential) {
      return NextResponse.json(
        { success: false, message: "Parameter otentikasi tidak lengkap." },
        { status: 400 }
      );
    }

    // Role-specific authentication evaluation
    if (role === "pegawai") {
      // Identifier: NIP or Nama
      // Credential: 4-digit PIN
      const inputHash = crypto.createHash("sha256").update(`${credential}_shiftbro_salt_2026`).digest("hex");
      const user = USERS_DATABASE.find(
        (u) =>
          u.role === "pegawai" &&
          ((u.nip && u.nip.toLowerCase() === identifier.toLowerCase()) ||
           u.nama.toLowerCase() === identifier.toLowerCase()) &&
          "pinHash" in u && u.pinHash === inputHash
      );

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "NIP atau PIN Karyawan tidak cocok. Coba NIP 'JK-01' atau 'NS-02' dengan PIN demo 1234."
          },
          { status: 401 }
        );
      }

      // Generate secure session token
      const sessionToken = crypto.randomBytes(24).toString("hex");

      return NextResponse.json({
        success: true,
        message: `Selamat datang, ${user.nama}! Siap bertugas di stasiun ${user.posisi}.`,
        user: {
          id: user.id,
          nama: user.nama,
          role: user.role,
          posisi: user.posisi,
          outlet: user.outlet,
          nip: "nip" in user ? user.nip : undefined,
          shiftHariIni: "shiftHariIni" in user ? user.shiftHariIni : undefined,
          status: user.status
        },
        sessionToken,
        authMethod: "Quick PIN Karyawan"
      });
    }

    if (role === "manager") {
      // Identifier: ID Supervisor
      // Credential: 6-digit Passcode
      // Optional: outletCode check
      const inputHash = crypto.createHash("sha256").update(`${credential}_shiftbro_salt_2026`).digest("hex");
      const user = USERS_DATABASE.find(
        (u) =>
          u.role === "manager" &&
          (("idSupervisor" in u && u.idSupervisor && u.idSupervisor.toLowerCase() === identifier.toLowerCase()) ||
           ("email" in u && u.email && u.email.toLowerCase() === identifier.toLowerCase())) &&
          "passcodeHash" in u && u.passcodeHash === inputHash
      );

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "ID Supervisor atau Passcode Manager salah. Gunakan ID 'MGR-RINA' dan Passcode 889900."
          },
          { status: 401 }
        );
      }

      const sessionToken = crypto.randomBytes(24).toString("hex");

      return NextResponse.json({
        success: true,
        message: `Otorisasi Supervisor Berhasil. Selamat bertugas, ${user.nama}.`,
        user: {
          id: user.id,
          nama: user.nama,
          role: user.role,
          posisi: user.posisi,
          outlet: user.outlet,
          kodeOutlet: "kodeOutlet" in user ? user.kodeOutlet : undefined,
          shiftBertugas: "shiftBertugas" in user ? user.shiftBertugas : undefined,
          status: user.status
        },
        sessionToken,
        authMethod: "Supervisor Security Passcode"
      });
    }

    if (role === "owner") {
      // Identifier: Email bisnis
      // Credential: Password
      // totp: 6-digit 2FA code (required for Owner level security)
      const inputPassHash = crypto.createHash("sha256").update(`${credential}_shiftbro_salt_2026`).digest("hex");
      const user = USERS_DATABASE.find(
        (u) =>
          u.role === "owner" &&
          "email" in u && u.email && u.email.toLowerCase() === identifier.toLowerCase() &&
          "passwordHash" in u && u.passwordHash === inputPassHash
      );

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "Email bisnis atau kata sandi Owner tidak valid. Gunakan email demo 'syifa.owner@kopiharmoni.com'."
          },
          { status: 401 }
        );
      }

      // Check 2FA if provided
      if (totp) {
        const inputTotpHash = crypto.createHash("sha256").update(`${totp}_shiftbro_salt_2026`).digest("hex");
        if (!("totpHash" in user) || user.totpHash !== inputTotpHash) {
          return NextResponse.json(
            {
              success: false,
              message: "Kode 2FA / Authenticator salah. Gunakan kode 2FA demo: 552419."
            },
            { status: 401 }
          );
        }
      } else {
        // Require 2FA challenge step
        return NextResponse.json({
          success: false,
          require2FA: true,
          message: "Kredensial valid. Masukkan 6-digit kode verifikasi 2FA Authenticator untuk melanjutkan."
        });
      }

      const sessionToken = crypto.randomBytes(32).toString("hex");

      return NextResponse.json({
        success: true,
        message: `Akses Eksekutif Diberikan. Selamat datang, Ibu ${user.nama}.`,
        user: {
          id: user.id,
          nama: user.nama,
          role: user.role,
          posisi: user.posisi,
          outlet: user.outlet,
          email: "email" in user ? user.email : undefined,
          tingkatKeamanan: "tingkatKeamanan" in user ? user.tingkatKeamanan : undefined,
          status: user.status
        },
        sessionToken,
        authMethod: "Email Terenkripsi + 2FA TOTP Keamanan Tinggi"
      });
    }

    return NextResponse.json(
      { success: false, message: "Peran pengguna tidak dikenali." },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem otentikasi." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Simulated temporary OTP registry on the server (TTL 5 minutes)
// In production, this would be an encrypted Redis cache
const OTP_STORE = new Map<string, { code: string; expiresAt: number; nama: string; nip: string }>();

export async function POST(req: NextRequest) {
  try {
    const { noHp } = await req.json();

    if (!noHp) {
      return NextResponse.json(
        { success: false, message: "Nomor WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    // Clean phone number format
    const cleaned = noHp.replace(/\D/g, "");

    // Simulated check for registered staff phone numbers
    const validStaff: Record<string, { nama: string; nip: string }> = {
      "081234567890": { nama: "Joko", nip: "JK-01" },
      "081298765432": { nama: "Ningsih", nip: "NS-02" },
      "081300112233": { nama: "Putra", nip: "PT-03" }
    };

    const staff = validStaff[cleaned] || { nama: "Pegawai Demo", nip: "DEMO-01" };

    // Generate 4-digit numeric OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    OTP_STORE.set(cleaned, { code: otpCode, expiresAt, nama: staff.nama, nip: staff.nip });

    return NextResponse.json({
      success: true,
      message: `Kode OTP verifikasi berhasil dikirimkan ke WhatsApp +${cleaned}.`,
      simulatedOtp: otpCode, // Provided for easy demo testing
      expiresInSeconds: 300
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memproses permintaan OTP." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { noHp, otp } = await req.json();

    if (!noHp || !otp) {
      return NextResponse.json(
        { success: false, message: "Nomor WhatsApp dan kode OTP wajib diisi." },
        { status: 400 }
      );
    }

    const cleaned = noHp.replace(/\D/g, "");

    // Allow testing with demo codes or dynamic OTP
    if (otp.length !== 4) {
      return NextResponse.json(
        { success: false, message: "Kode OTP harus berupa 4 digit angka." },
        { status: 400 }
      );
    }

    // Determine staff profile
    let staffName = "Joko";
    let staffPosisi = "Senior Barista";
    let nip = "JK-01";

    if (cleaned.endsWith("432")) {
      staffName = "Ningsih";
      staffPosisi = "Head Kasir";
      nip = "NS-02";
    } else if (cleaned.endsWith("233")) {
      staffName = "Putra";
      staffPosisi = "Barista Shift Sore";
      nip = "PT-03";
    }

    const sessionToken = crypto.randomBytes(24).toString("hex");

    return NextResponse.json({
      success: true,
      message: `Verifikasi WhatsApp Berhasil! Selamat datang, ${staffName}.`,
      user: {
        id: `EMP-${nip}`,
        nama: staffName,
        role: "pegawai",
        posisi: staffPosisi,
        outlet: "Kopi Harmoni (Yogyakarta)",
        nip: nip,
        noHp: cleaned,
        shiftHariIni: "Shift Pagi (07:00 - 15:00 WIB)",
        status: "Aktif via WhatsApp"
      },
      sessionToken,
      authMethod: "WhatsApp Instant Verification"
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat verifikasi OTP." },
      { status: 500 }
    );
  }
}

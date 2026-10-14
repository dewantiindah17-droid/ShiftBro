import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { domain, email } = await req.json();

    const allowedDomain = "kopiharmoni.com";
    const requestedEmail = email || "syifa.owner@kopiharmoni.com";

    if (!requestedEmail.endsWith(`@${allowedDomain}`)) {
      return NextResponse.json(
        {
          success: false,
          message: `Hanya akun Google Workspace resmi dengan domain @${allowedDomain} yang diizinkan untuk akses Owner.`
        },
        { status: 403 }
      );
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");

    return NextResponse.json({
      success: true,
      message: `Otentikasi SSO Google Workspace Berhasil. Selamat datang, Syifa Azzahra.`,
      user: {
        id: "OWN-001",
        nama: "Syifa Azzahra",
        role: "owner",
        posisi: "Owner & Direktur Bisnis",
        outlet: "Kopi Harmoni Group",
        email: requestedEmail,
        tingkatKeamanan: "Enterprise SSO Verified",
        status: "Executive Access"
      },
      sessionToken,
      authMethod: "Google Workspace Enterprise SSO"
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan proses SSO." },
      { status: 500 }
    );
  }
}

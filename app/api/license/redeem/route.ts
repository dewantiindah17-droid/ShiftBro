import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Kode demo cadangan bila SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY belum diisi.
// Supaya prototype tetap bisa dijajal walau database belum siap.
const FALLBACK_DEMO_CODES = ["SHIFTBRO-PRO-DEMO25", "SHIFTBRO-PRO-2026", "SHIFTBRO-PRO-KOPI01"];
const FALLBACK_PERIOD_DAYS = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = typeof body?.code === "string" ? body.code : "";
    const code = rawCode.trim().toUpperCase();
    const redeemedBy = typeof body?.nama === "string" ? body.nama : null;
    const outlet = typeof body?.outlet === "string" ? body.outlet : null;

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Kode lisensi wajib diisi." },
        { status: 400 }
      );
    }

    const now = new Date();
    const supabase = getSupabaseAdmin();

    // ---------- Mode prototype (Supabase belum dikonfigurasi) ----------
    if (!supabase) {
      if (!FALLBACK_DEMO_CODES.includes(code)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Kode lisensi tidak dikenali. (Mode demo. Gunakan salah satu kode contoh, atau hubungkan Supabase.)",
          },
          { status: 404 }
        );
      }
      const expiresAt = new Date(now.getTime() + FALLBACK_PERIOD_DAYS * 24 * 60 * 60 * 1000);
      return NextResponse.json({
        success: true,
        message: "Aktivasi berhasil (mode demo tanpa Supabase).",
        plan: "premium",
        expiresAt: expiresAt.toISOString(),
        mode: "demo",
      });
    }

    // ---------- Mode Supabase ----------
    const { data, error } = await supabase
      .from("licenses")
      .select("id, code, status, duration_days, expires_at")
      .eq("code", code)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, message: "Gagal memeriksa lisensi ke database." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Kode lisensi tidak ditemukan." },
        { status: 404 }
      );
    }

    if (data.status === "revoked") {
      return NextResponse.json(
        { success: false, message: "Kode lisensi ini telah dicabut." },
        { status: 403 }
      );
    }

    // Sudah pernah diaktifkan -> cek masa aktifnya
    if (data.status === "active" && data.expires_at) {
      const existingExpiry = new Date(data.expires_at);
      if (existingExpiry.getTime() <= now.getTime()) {
        await supabase.from("licenses").update({ status: "expired" }).eq("id", data.id);
        return NextResponse.json(
          { success: false, message: "Kode lisensi sudah kedaluwarsa. Silakan perpanjang." },
          { status: 403 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Lisensi aktif. Selamat menikmati fitur Premium!",
        plan: "premium",
        expiresAt: existingExpiry.toISOString(),
        mode: "supabase",
      });
    }

    const durationDays =
      typeof data.duration_days === "number" && data.duration_days > 0 ? data.duration_days : 30;
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const { error: updateError } = await supabase
      .from("licenses")
      .update({
        status: "active",
        activated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        redeemed_by: redeemedBy,
        outlet,
      })
      .eq("id", data.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: "Gagal mengaktifkan lisensi." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Aktivasi berhasil. Fitur Premium telah terbuka!",
      plan: "premium",
      expiresAt: expiresAt.toISOString(),
      mode: "supabase",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat memproses lisensi." },
      { status: 500 }
    );
  }
}

import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'ShiftBro — Sistem Absensi & Operasional Shift Kafe',
  description: 'Sistem presensi mobile-first untuk Pegawai & Owner kafe, dilengkapi filter absensi realtime, maskot Bro, dan modul Payroll Premium.',
  openGraph: {
    title: 'ShiftBro — Sistem Absensi & Operasional Shift Kafe',
    description: 'Sistem presensi mobile-first untuk Pegawai & Owner kafe, dilengkapi filter absensi realtime, maskot Bro, dan modul Payroll Premium.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShiftBro — Sistem Absensi & Operasional Shift Kafe',
    description: 'Sistem presensi mobile-first untuk Pegawai & Owner kafe, dilengkapi filter absensi realtime, maskot Bro, dan modul Payroll Premium.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

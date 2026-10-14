"use client";

import React from "react";
import { Role } from "@/types/auth";
import { UserCheck, ShieldCheck, Briefcase } from "lucide-react";

interface RoleSelectorProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
}

export default function RoleSelector({
  currentRole,
  onSelectRole,
}: RoleSelectorProps) {
  const roles = [
    {
      id: "pegawai" as Role,
      label: "Pegawai",
      sublabel: "Barista & Kasir",
      badge: "Quick PIN / WA",
      icon: UserCheck,
      color: "border-[#2C9B8A] text-[#0B6E5C]",
      activeBg: "bg-[#2C9B8A] text-white shadow-md",
      desc: "Login super cepat via PIN 4-digit atau OTP WhatsApp di ponsel.",
    },
    {
      id: "manager" as Role,
      label: "Manager",
      sublabel: "Supervisor Shift",
      badge: "ID & Passcode",
      icon: Briefcase,
      color: "border-[#1E3E5C] text-[#1E3E5C]",
      activeBg: "bg-[#1E3E5C] text-white shadow-md",
      desc: "Konsol operasional dengan ID Supervisor & otorisasi roster.",
    },
    {
      id: "owner" as Role,
      label: "Owner / HR",
      sublabel: "Direksi & Bisnis",
      badge: "SSO + 2FA",
      icon: ShieldCheck,
      color: "border-[#0F2A43] text-[#0F2A43]",
      activeBg: "bg-[#0F2A43] text-white shadow-md",
      desc: "Akses finansial & MRR berkeamanan tinggi dengan 2FA Authenticator.",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-[#0F2A43] uppercase tracking-wider">
          Pilih Sudut Pandang (POV Login):
        </label>
        <span className="text-[11px] text-[#6B7280]">
          3 Cara & Pengalaman Berbeda
        </span>
      </div>

      {/* Segmented Touch-friendly Grid */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#E4E1D6]/70 rounded-2xl border border-[#E4E1D6]">
        {roles.map((item) => {
          const isActive = currentRole === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectRole(item.id)}
              className={`touch-target touch-press rounded-xl px-2 py-2.5 text-center transition-all flex flex-col items-center justify-center gap-1 ${
                isActive
                  ? item.activeBg
                  : "bg-white/80 hover:bg-white text-[#0F2A43] border border-transparent shadow-xs"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-[#F2A33A]" : "text-[#2C6079]"}`} />
                <span className="text-xs font-bold whitespace-nowrap">
                  {item.label}
                </span>
              </div>
              <span
                className={`text-[10px] leading-tight ${
                  isActive ? "text-slate-200" : "text-[#6B7280]"
                }`}
              >
                {item.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Role Context Box */}
      <div className="mt-2.5 px-3 py-2 rounded-xl bg-white/90 border border-[#E4E1D6] text-[11px] text-[#6B7280] flex items-center justify-between">
        <span className="text-[#0F2A43] font-medium">
          {roles.find((r) => r.id === currentRole)?.desc}
        </span>
        <span className="font-mono text-[10px] bg-[#F4F2EA] px-2 py-0.5 rounded text-[#2C6079] font-bold shrink-0 ml-2">
          POV: {currentRole.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

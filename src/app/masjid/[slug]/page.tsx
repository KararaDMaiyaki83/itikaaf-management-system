'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  UserPlus, 
  QrCode, 
  Crown, 
  ShieldCheck, 
  Moon, 
  Phone, 
  Mail, 
  LayoutDashboard, 
  ScanLine, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  UserCheck,
  UserCog,
  Shield
} from 'lucide-react';
import { Masjid, MasjidAdminRole } from '../../../types/itikaaf';
import { getMasjidBySlug, setActiveMasjidId, getStoredMasaajid } from '../../../lib/storage';
import { INITIAL_MASAAJID, DAWABIT_RULES } from '../../../data/initialData';

const ROLE_DISPLAY: Record<MasjidAdminRole, { label: string; labelAr: string; color: string }> = {
  lead_admin: { label: 'Lead Mosque Admin', labelAr: 'مشرف عام', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  screening_officer: { label: 'Screening & Health Officer', labelAr: 'مسؤول التدقيق الصحي', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  logistics_officer: { label: 'Logistics & Dār Ameer', labelAr: 'مسؤول التسكين والإعاشة', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  finance_officer: { label: 'Financial Auditor', labelAr: 'المسؤول المالي', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  security_officer: { label: 'Gate & Headcount Monitor', labelAr: 'مسؤول الأمن والبوابة', color: 'bg-rose-100 text-rose-900 border-rose-300' },
};

export default function MasjidPortalHomePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [masjid, setMasjid] = useState<Masjid | null>(null);

  useEffect(() => {
    if (slug) {
      const found = getMasjidBySlug(slug);
      if (found) {
        setMasjid(found);
        setActiveMasjidId(found.id);
      } else {
        const fallback = getStoredMasaajid()[0] || INITIAL_MASAAJID[0];
        setMasjid(fallback);
      }
    }
  }, [slug]);

  if (!masjid) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Moon className="w-10 h-10 text-emerald-800 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-stone-600">Loading Mosque Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* TOP MASJID HERO BANNER */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-400/40 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30 uppercase tracking-widest">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{masjid.lga} LGA • {masjid.area}, Kaduna State</span>
              </div>
              
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex flex-col sm:flex-row sm:items-baseline gap-2">
                <span>{masjid.name}</span>
                <span className="text-xs font-mono bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded font-extrabold uppercase inline-block w-fit">
                  CODE: {masjid.codePrefix}
                </span>
              </h1>
              
              <p className="text-base sm:text-lg font-arabic text-amber-200">
                {masjid.nameAr}
              </p>

              <p className="text-xs sm:text-sm text-emerald-200 max-w-2xl pt-1">
                Official I’tikāf registration, Dār allocation, and attendance management portal for Ramadan 1447 AH. Supervised by the Local Mosque Committee under Chairman <strong>{masjid.chairmanName}</strong>.
              </p>
            </div>

            {/* Quick stats badge */}
            <div className="bg-emerald-900/80 p-4 rounded-2xl border border-emerald-700/80 text-center flex-shrink-0">
              <span className="text-[11px] font-bold uppercase text-emerald-300 block">
                Total Musalla Capacity
              </span>
              <div className="text-3xl font-black text-amber-300 font-mono my-0.5">
                {masjid.totalFloorCapacity}
              </div>
              <span className="text-[10px] font-bold text-stone-300 bg-emerald-950/80 px-2 py-0.5 rounded-full inline-block">
                Floor Spots Only (No Beds)
              </span>
            </div>
          </div>
        </div>

        {/* 4 CORE PORTAL MODULES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href={`/masjid/${masjid.slug}/register`}
            className="bg-white rounded-2xl p-5 shadow-sm border-2 border-stone-200 hover:border-emerald-700 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center mb-3 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-900">
                Public Registration
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Register for I’tikāf at {masjid.name}. Includes 5-step screening & returning mutakif fast-track.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-800 group-hover:underline">
              <span>Open Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href={`/masjid/${masjid.slug}/pass`}
            className="bg-white rounded-2xl p-5 shadow-sm border-2 border-stone-200 hover:border-emerald-700 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-900">
                Gate Pass Badge
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Verify admission, view your designated Musalla spot, and print your Code 128 ID badge.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:underline">
              <span>View Pass</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href={`/masjid/${masjid.slug}/admin/dashboard`}
            className="bg-white rounded-2xl p-5 shadow-sm border-2 border-stone-200 hover:border-emerald-700 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center mb-3 group-hover:bg-blue-800 group-hover:text-white transition-colors">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 group-hover:text-blue-900">
                Committee Dashboard
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                For {masjid.name} screening officers: review applicants, assign spots, and manage capacity.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-800 group-hover:underline">
              <span>Open Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href={`/masjid/${masjid.slug}/admin/headcount`}
            className="bg-white rounded-2xl p-5 shadow-sm border-2 border-stone-200 hover:border-emerald-700 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center mb-3 group-hover:bg-purple-800 group-hover:text-white transition-colors">
                <ScanLine className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 group-hover:text-purple-900">
                Headcount Scanner
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Scan attendee barcodes for Suhur, Iftar, Tahajjud, and gate entry per Dār.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-800 group-hover:underline">
              <span>Open Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>

        {/* 4 DĀRS STRUCTURE FOR THIS MOSQUE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-emerald-800" />
                <span>The 4 Dārs of {masjid.name}</span>
              </h2>
              <p className="text-xs text-stone-500">
                All mutakifin at {masjid.name} are distributed across the 4 supervised houses
              </p>
            </div>
            <Link
              href={`/masjid/${masjid.slug}/admin/daars`}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              Manage Ameers →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-800 text-white">
                {masjid.codePrefix}-ABK
              </span>
              <h4 className="text-sm font-bold text-emerald-950 mt-2">Dār Abubakar</h4>
              <p className="text-[11px] text-stone-500 font-arabic">دار أبي بكر الصديق</p>
              <p className="text-xs text-stone-600 mt-2">
                Focus: Tahajjud, Qibla Forward Musalla, and medical assistance liaisons.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/50">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-800 text-white">
                {masjid.codePrefix}-UMR
              </span>
              <h4 className="text-sm font-bold text-blue-950 mt-2">Dār Umar</h4>
              <p className="text-[11px] text-stone-500 font-arabic">دار عمر بن الخطاب</p>
              <p className="text-xs text-stone-600 mt-2">
                Focus: Suhur and Iftar meal distribution & central musalla logistics.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/50">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-800 text-white">
                {masjid.codePrefix}-USM
              </span>
              <h4 className="text-sm font-bold text-amber-950 mt-2">Dār Usman</h4>
              <p className="text-[11px] text-stone-500 font-arabic">دار عثمان بن عفان</p>
              <p className="text-xs text-stone-600 mt-2">
                Focus: Qur’an revision circles, halaqat, and courtyard accommodations.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-purple-300 bg-purple-50/50">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-800 text-white">
                {masjid.codePrefix}-ALY
              </span>
              <h4 className="text-sm font-bold text-purple-950 mt-2">Dār Aliyu</h4>
              <p className="text-[11px] text-stone-500 font-arabic">دار علي بن أبي طالب</p>
              <p className="text-xs text-stone-600 mt-2">
                Focus: Quiet hours enforcement, youth mentorship, and security liaisons.
              </p>
            </div>
          </div>
        </div>

        {/* ASSIGNED MOSQUE ADMINISTRATIVE COMMITTEE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-800" />
                <span>Assigned Mosque Administration Committee (هيئة الإشراف وإدارة الاعتكاف)</span>
              </h2>
              <p className="text-xs text-stone-500">
                Official officers assigned to supervise screening, health evaluations, Dār floor spots, and logistics for {masjid.name}
              </p>
            </div>
            <Link
              href="/super-admin"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 hover:underline"
            >
              <UserCog className="w-3.5 h-3.5" />
              <span>Super Admin Management →</span>
            </Link>
          </div>

          {masjid.admins && masjid.admins.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {masjid.admins.map((adm) => {
                const meta = ROLE_DISPLAY[adm.role] || { label: adm.role, labelAr: '', color: 'bg-stone-100 text-stone-800 border-stone-200' };
                return (
                  <div
                    key={adm.id}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:border-emerald-500 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-sm">{adm.fullName}</h4>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border inline-block mt-1 ${meta.color}`}>
                          {meta.label}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {adm.status}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 space-y-1 font-mono pt-1">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{adm.phone}</span>
                      </div>
                      {adm.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-stone-400" />
                          <span className="truncate max-w-[200px]">{adm.email}</span>
                        </div>
                      )}
                    </div>

                    {adm.notes && (
                      <p className="text-[11px] text-stone-500 italic pt-1 border-t border-stone-200/60">
                        “{adm.notes}”
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300">
              <UserCheck className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-stone-700">No specific administrative officers assigned yet.</p>
              <p className="text-[11px] text-stone-500 mt-0.5">Contact the Super Admin to provision officers for this mosque.</p>
            </div>
          )}
        </div>

        {/* MOSQUE CONTACT & LOCATION FOOTER */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <h4 className="font-bold text-stone-900 text-sm">{masjid.name} Local Committee</h4>
            <p className="text-stone-500 mt-0.5">{masjid.address}</p>
            <p className="text-emerald-800 font-semibold mt-1">
              Chairman: {masjid.chairmanName} • Contact: {masjid.contactPhone}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="inline-flex items-center gap-1.5 bg-stone-900 text-stone-300 px-3 py-1.5 rounded-full text-[11px] font-medium border border-stone-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Powered by <strong className="text-white">GetoCore Digital Innovation</strong></span>
            </div>
            <Link
              href="/super-admin"
              className="text-xs font-bold text-stone-600 hover:text-emerald-900 border border-stone-300 px-3 py-1.5 rounded-lg text-center"
            >
              Kaduna Super Admin →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

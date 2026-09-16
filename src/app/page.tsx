import React from 'react';
import Link from 'next/link';
import { 
  Moon, 
  Calendar, 
  Users, 
  ShieldCheck, 
  QrCode, 
  UserPlus, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  HeartHandshake, 
  Stethoscope, 
  Clock, 
  AlertTriangle,
  Building2,
  Info
} from 'lucide-react';
import { DAWABIT_RULES } from '../data/initialData';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      
      {/* Hero Section with Islamic Architectural Gradient */}
      <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white relative overflow-hidden py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-400">
        
        {/* Subtle decorative glow circles */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-emerald-700/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-600/40 text-amber-300 px-4 py-1.5 rounded-full text-xs font-semibold shadow-inner">
            <Moon className="w-4 h-4 text-amber-300" />
            <span>شهر رمضان المبارك ١٤٤٧ هـ • The Blessed Last 10 Nights</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight sm:leading-tight">
            Central Masjid I’tikāf Portal
            <span className="block text-xl sm:text-2xl font-normal text-emerald-200 mt-2 font-arabic">
              نظام تسجيل وإدارة المعتكفين وتخصيص المساحات
            </span>
          </h1>

          <p className="text-stone-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Welcome to the official portal for the annual Ramadan I’tikāf seclusion. Streamlined registration, screening, numbered floor space allocation, and instant digital gate passes.
          </p>

          {/* CRITICAL POLICY BADGE: SPACES ONLY - NO BEDS */}
          <div className="inline-block max-w-xl mx-auto bg-amber-400/20 border border-amber-300/40 backdrop-blur-sm rounded-xl p-3 text-xs text-amber-100 text-center">
            <div className="flex items-center justify-center gap-2 font-bold text-amber-300 mb-0.5">
              <Info className="w-4 h-4" />
              <span>SPACE ALLOCATION NOTICE (تخصيص المساحات فقط)</span>
            </div>
            <span>
              The Masjid provides designated numbered <strong>Floor Spaces / Spots</strong> (no beds or cots). Mutakifin must bring personal prayer mats and bedding.
            </span>
          </div>

          {/* Dual Primary Call-to-Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all group text-sm"
            >
              <UserPlus className="w-5 h-5 text-emerald-950" />
              <span>Register for I’tikāf Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/pass"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-800/90 hover:bg-emerald-700/90 text-white font-bold px-7 py-3.5 rounded-xl border border-emerald-600 shadow-md transition-all text-sm"
            >
              <QrCode className="w-5 h-5 text-amber-300" />
              <span>Verify & Download Gate Pass</span>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="bg-emerald-900/50 border border-emerald-700/50 p-3.5 rounded-xl">
              <span className="text-[11px] text-emerald-300 block font-medium">Program Dates</span>
              <span className="text-sm font-bold text-white">20th–30th Ramadan</span>
            </div>
            <div className="bg-emerald-900/50 border border-emerald-700/50 p-3.5 rounded-xl">
              <span className="text-[11px] text-emerald-300 block font-medium">Space Capacity</span>
              <span className="text-sm font-bold text-white">350 Spots Total</span>
            </div>
            <div className="bg-emerald-900/50 border border-emerald-700/50 p-3.5 rounded-xl">
              <span className="text-[11px] text-emerald-300 block font-medium">Accommodations</span>
              <span className="text-sm font-bold text-white">Separate Wings</span>
            </div>
            <div className="bg-emerald-900/50 border border-emerald-700/50 p-3.5 rounded-xl">
              <span className="text-[11px] text-emerald-300 block font-medium">Gate Verification</span>
              <span className="text-sm font-bold text-white">Digital QR Badge</span>
            </div>
          </div>

        </div>
      </section>

      {/* Program Highlights & Features */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Dedicated Services for the Guests of the Masjid
          </h2>
          <p className="text-stone-600 text-sm mt-1">
            خدمات ومرافق مجهزة لتوفير بيئة روحانية هادئة للتفرغ للعبادة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Separate Musalla Wings</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Designated spaces in the Hall of Omar (Brothers Ground Floor) and Hall of Aisha (Sisters Mezzanine). Individual marked floor zones to prevent crowding.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">24/7 First-Aid & Screening</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Medical volunteers conduct initial health reviews, allocate accessible ground-floor spots for mobility or diabetic participants, and monitor well-being nightly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Digital Gate Pass & Security</h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Instant verification QR badge, physical lanyard tags, and registered emergency contacts to ensure security and quiet hours across all prayer halls.
            </p>
          </div>

        </div>

      </section>

      {/* Rules & Regulations (Dawabit) Section */}
      <section className="bg-stone-100/70 border-t border-b border-stone-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>ضوابط الاعتكاف</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900">
              Core I’tikāf Guidelines & Dawabit
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Every participant agrees to these terms upon registration.
            </p>
          </div>

          <div className="space-y-3">
            {DAWABIT_RULES.map((rule, idx) => (
              <div
                key={rule.id}
                className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-start gap-3.5"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-stone-900">{rule.titleEn}</h4>
                    <span className="text-xs font-arabic text-emerald-800 font-semibold">{rule.titleAr}</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition-all"
            >
              <span>Accept Rules & Start Registration</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Verification / Gate Pass Quick Lookup Demo */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-stone-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Already Registered?</span>
            <h3 className="text-xl sm:text-2xl font-bold">Track Your Admission & Print Pass</h3>
            <p className="text-xs text-stone-300 max-w-md">
              Enter your tracking reference code (e.g. <code className="bg-white/10 px-1.5 py-0.5 rounded text-amber-300 font-mono">ITK-2026-0101</code>) to view your assigned Space Number and printable QR Gate Pass.
            </p>
          </div>
          <Link
            href="/pass"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-xs flex-shrink-0"
          >
            <QrCode className="w-4 h-4 text-emerald-950" />
            <span>Open Gate Pass Terminal</span>
          </Link>
        </div>
      </section>

    </div>
  );
}

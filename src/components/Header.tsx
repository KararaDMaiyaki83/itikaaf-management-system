'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, 
  UserPlus, 
  QrCode, 
  ShieldCheck, 
  Moon, 
  RotateCcw,
  Crown,
  LayoutDashboard,
  ScanLine,
  MapPin,
  ChevronDown,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';
import { 
  resetToDefaultData, 
  getStoredMasaajid, 
  getActiveMasjid, 
  setActiveMasjidId,
  getStoredAuthSession,
  clearAuthSession,
  AuthUserSession
} from '../lib/storage';
import { Masjid, KadunaLGA } from '../types/itikaaf';
import { INITIAL_MASAAJID } from '../data/initialData';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [masaajid, setMasaajid] = useState<Masjid[]>(INITIAL_MASAAJID);
  const [activeMasjid, setActiveMasjidState] = useState<Masjid>(INITIAL_MASAAJID[0]);
  const [authSession, setAuthSession] = useState<AuthUserSession | null>(null);

  const loadHeaderData = () => {
    const list = getStoredMasaajid();
    setMasaajid(list);
    setActiveMasjidState(getActiveMasjid());
    setAuthSession(getStoredAuthSession());
  };

  useEffect(() => {
    loadHeaderData();
    const handler = () => loadHeaderData();
    window.addEventListener('itikaaf_active_masjid_changed', handler);
    window.addEventListener('itikaaf_masaajid_changed', handler);
    window.addEventListener('itikaaf_data_changed', handler);
    window.addEventListener('itikaaf_auth_changed', handler);
    return () => {
      window.removeEventListener('itikaaf_active_masjid_changed', handler);
      window.removeEventListener('itikaaf_masaajid_changed', handler);
      window.removeEventListener('itikaaf_data_changed', handler);
      window.removeEventListener('itikaaf_auth_changed', handler);
    };
  }, []);

  const handleResetData = () => {
    if (confirm('Reset demo dataset across Nigeria to initial state?')) {
      resetToDefaultData();
      alert('Nationwide Masaajid sample dataset refreshed!');
    }
  };

  const handleMasjidChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'super-admin') {
      router.push('/super-admin');
      return;
    }
    setActiveMasjidId(val);
    const target = masaajid.find(m => m.id === val);
    if (target) {
      setActiveMasjidState(target);
      // Navigate to that mosque's portal
      router.push(`/masjid/${target.slug}`);
    }
  };

  const isSuperAdminPage = pathname?.startsWith('/super-admin');

  const navItems = [
    { href: '/', label: 'Overview', icon: Building2 },
    { href: '/register', label: 'Register', icon: UserPlus },
    { href: '/pass', label: 'Gate Pass', icon: QrCode },
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/daars', label: '4 Dārs & Ameers', icon: Crown },
    { href: '/admin/headcount', label: 'Headcount Scan', icon: ScanLine },
  ];

  // Group Masaajid by Nigerian State for the selector dropdown
  const states = Array.from(new Set(masaajid.map(m => m.state)));

  return (
    <header className="no-print bg-emerald-950 text-white border-b border-emerald-800/80 sticky top-0 z-40 shadow-md">
      {/* Top micro banner with Hijri date, Nigeria National context, and Active Mosque Indicator */}
      <div className="bg-emerald-900/90 text-emerald-200 text-xs px-4 py-1.5 border-b border-emerald-800/50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Moon className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium tracking-wide">
              شهر رمضان المبارك ١٤٤٧ هـ • Federal Republic of Nigeria Unified National I’tikāf Platform
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded text-[10px] text-emerald-200 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Powered by <strong>GetoCore Digital Innovation</strong></span>
            </span>
            <span className="bg-emerald-800/80 px-2.5 py-0.5 rounded text-[11px] text-amber-300 font-mono flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>
                {isSuperAdminPage ? 'Nigeria National Oversight' : `${activeMasjid.name} (${activeMasjid.lga} LGA, ${activeMasjid.state})`}
              </span>
            </span>
            <span className="bg-emerald-800/80 px-2.5 py-0.5 rounded text-[11px] text-amber-300 font-mono">
              Floor Spaces Only (No Beds)
            </span>
            <button
              onClick={handleResetData}
              title="Reset sample data"
              className="flex items-center gap-1 text-[11px] text-emerald-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset Demo
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation with State/Masjid Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Active Masjid identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-inner border border-emerald-500/30 group-hover:scale-105 transition-transform">
            <Moon className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-white tracking-tight">I’tikāf Portal</span>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 font-arabic px-2 py-0.2 rounded-full border border-amber-500/30">
                جمهورية نيجيريا الاتحادية
              </span>
            </div>
            <p className="text-[11px] text-emerald-300">
              {isSuperAdminPage ? 'National Command Center' : `${activeMasjid.name} • ${activeMasjid.state}`}
            </p>
          </div>
        </Link>

        {/* STATE & MASJID MULTI-TENANT SWITCHER */}
        <div className="flex items-center gap-2 bg-emerald-900/60 p-1 rounded-xl border border-emerald-700/80">
          <MapPin className="w-4 h-4 text-amber-400 ml-2 flex-shrink-0" />
          <select
            value={isSuperAdminPage ? 'super-admin' : activeMasjid.id}
            onChange={handleMasjidChange}
            className="bg-emerald-950 text-amber-300 text-xs font-bold py-1 px-2 rounded-lg border border-emerald-700 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            <option value="super-admin" className="bg-stone-900 text-amber-400 font-bold">
              👑 Nigeria Super Admin (All 36 States + FCT)
            </option>
            {states.map((st) => (
              <optgroup key={st} label={`── ${st} ──`} className="bg-stone-900 text-amber-300 font-bold">
                {masaajid.filter(m => m.state === st).map(m => (
                  <option key={m.id} value={m.id} className="bg-stone-900 text-white font-normal">
                    {m.name} ({m.lga} LGA)
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          <Link
            href="/super-admin"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isSuperAdminPage
                ? 'bg-amber-400 text-emerald-950 shadow-md ring-2 ring-amber-300'
                : 'bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-emerald-950 border border-amber-400/40'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </Link>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href && !isSuperAdminPage;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-800 text-amber-300 shadow-sm border border-emerald-700'
                    : 'text-emerald-100 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-emerald-300'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Unified Login / Active Session */}
          {authSession ? (
            <div className="flex items-center gap-1.5 bg-emerald-900/90 border border-emerald-700/80 px-2.5 py-1 rounded-lg text-xs">
              <UserCheck className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
              <div className="flex flex-col text-[11px] leading-tight max-w-[100px] truncate">
                <span className="text-white font-bold truncate">{authSession.name}</span>
                <span className="text-emerald-300/80 text-[9px] truncate">
                  {authSession.role === 'participant' ? 'Mutakif' : authSession.role === 'super_admin' ? 'Super Admin' : 'Staff'}
                </span>
              </div>
              <button
                onClick={() => {
                  clearAuthSession();
                  router.push('/');
                }}
                title="Sign Out"
                className="text-emerald-300 hover:text-rose-300 ml-1 p-0.5 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                pathname === '/login'
                  ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500 shadow-sm'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              <span>Sign In</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

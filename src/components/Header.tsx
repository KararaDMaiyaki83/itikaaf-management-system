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
  UserCheck,
  Menu,
  X
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
import { Masjid } from '../types/itikaaf';
import { INITIAL_MASAAJID } from '../data/initialData';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [masaajid, setMasaajid] = useState<Masjid[]>(INITIAL_MASAAJID);
  const [activeMasjid, setActiveMasjidState] = useState<Masjid>(INITIAL_MASAAJID[0]);
  const [authSession, setAuthSession] = useState<AuthUserSession | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
      setIsMobileMenuOpen(false);
      return;
    }
    setActiveMasjidId(val);
    const target = masaajid.find(m => m.id === val);
    if (target) {
      setActiveMasjidState(target);
      router.push(`/masjid/${target.slug}`);
      setIsMobileMenuOpen(false);
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
      <div className="bg-emerald-900/95 text-emerald-200 text-xs px-3 sm:px-4 py-1.5 border-b border-emerald-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Mobile view: Compact 1-line banner */}
          <div className="flex sm:hidden items-center justify-between w-full text-[11px]">
            <div className="flex items-center gap-1.5 font-medium truncate">
              <Moon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">رمضان ١٤٤٧ هـ • GetoCore Tech</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="bg-emerald-950 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-700/60">
                Floor Spots Only
              </span>
              <button
                onClick={handleResetData}
                title="Reset sample data"
                className="text-[10px] text-emerald-300 hover:text-white flex items-center gap-0.5"
              >
                <RotateCcw className="w-2.5 h-2.5" /> Reset
              </button>
            </div>
          </div>

          {/* Tablet/Desktop view: Full rich info */}
          <div className="hidden sm:flex items-center gap-2">
            <Moon className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium tracking-wide">
              شهر رمضان المبارك ١٤٤٧ هـ • Federal Republic of Nigeria Unified National I’tikāf Platform
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2.5">
            <span className="bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded text-[10px] text-emerald-200 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Powered by <strong>GetoCore Digital Innovation</strong></span>
            </span>
            <span className="bg-emerald-800/80 px-2.5 py-0.5 rounded text-[11px] text-amber-300 font-mono flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span className="max-w-[220px] truncate">
                {isSuperAdminPage ? 'Nigeria National Oversight' : `${activeMasjid.name} (${activeMasjid.lga} LGA)`}
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

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-inner border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-sm sm:text-lg text-white tracking-tight">I’tikāf Portal</span>
                <span className="text-[10px] sm:text-[11px] bg-amber-500/20 text-amber-300 font-arabic px-1.5 sm:px-2 py-0.2 rounded-full border border-amber-500/30">
                  جمهورية نيجيريا
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-300 max-w-[180px] sm:max-w-xs truncate">
                {isSuperAdminPage ? 'National Command Center' : `${activeMasjid.name} • ${activeMasjid.state}`}
              </p>
            </div>
          </Link>

          {/* STATE & MASJID MULTI-TENANT SWITCHER (Desktop inline) */}
          <div className="hidden md:flex items-center gap-1.5 bg-emerald-900/60 p-1 rounded-xl border border-emerald-700/80 max-w-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-400 ml-1.5 flex-shrink-0" />
            <select
              value={isSuperAdminPage ? 'super-admin' : activeMasjid.id}
              onChange={handleMasjidChange}
              className="bg-emerald-950 text-amber-300 text-xs font-bold py-1 px-2 rounded-lg border border-emerald-700 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer max-w-[240px] truncate"
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

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-wrap">
            <Link
              href="/super-admin"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

            {/* Unified Login / Active Session on Desktop */}
            {authSession ? (
              <div className="flex items-center gap-1.5 bg-emerald-900/90 border border-emerald-700/80 px-2.5 py-1 rounded-lg text-xs ml-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                <div className="flex flex-col text-[11px] leading-tight max-w-[90px] truncate">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ml-1 ${
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

          {/* Right Action Controls for Mobile / Tablet */}
          <div className="flex items-center gap-2 lg:hidden">
            {authSession ? (
              <div className="flex items-center gap-1 bg-emerald-900/90 border border-emerald-700 px-2 py-1 rounded-lg text-xs">
                <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-white font-bold text-[11px] max-w-[70px] truncate">{authSession.name.split(' ')[0]}</span>
                <button
                  onClick={() => {
                    clearAuthSession();
                    router.push('/');
                  }}
                  title="Sign Out"
                  className="text-emerald-300 hover:text-rose-300 ml-0.5 p-0.5"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-400 text-emerald-950"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-300" /> : <Menu className="w-5 h-5 text-amber-300" />}
            </button>
          </div>

        </div>

        {/* Mobile Dedicated Mosque Switcher (Clean, Full-Width, Non-overflowing) */}
        <div className="mt-2 md:hidden">
          <div className="flex items-center gap-1.5 bg-emerald-900/70 p-1 rounded-xl border border-emerald-700/80 w-full">
            <MapPin className="w-3.5 h-3.5 text-amber-400 ml-1.5 flex-shrink-0" />
            <select
              value={isSuperAdminPage ? 'super-admin' : activeMasjid.id}
              onChange={handleMasjidChange}
              className="bg-emerald-950 text-amber-300 text-xs font-bold py-1.5 px-2 rounded-lg border border-emerald-700 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer w-full truncate"
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
        </div>

      </div>

      {/* ================= MOBILE COLLAPSIBLE DRAWER MENU ================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950 border-t border-emerald-800 px-4 py-4 space-y-3 shadow-2xl animate-fade-in">
          
          {/* Active Mosque Badge in Mobile Menu */}
          <div className="bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-700/70 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div className="truncate">
                <span className="text-white font-bold block truncate">{activeMasjid.name}</span>
                <span className="text-[10px] text-emerald-300 truncate">{activeMasjid.lga} LGA, {activeMasjid.state} State</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-amber-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700 flex-shrink-0">
              {activeMasjid.totalFloorCapacity} spots
            </span>
          </div>

          {/* Super Admin Quick Link */}
          <Link
            href="/super-admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
              isSuperAdminPage
                ? 'bg-amber-400 text-emerald-950 shadow-md ring-2 ring-amber-300'
                : 'bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-emerald-950 border border-amber-400/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Crown className="w-4 h-4" />
              <span>Nigeria National Super Admin (All 36 States + FCT)</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
          </Link>

          {/* Nav Items List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href && !isSuperAdminPage;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-800 text-amber-300 border border-emerald-700 shadow-sm'
                      : 'bg-emerald-900/50 text-emerald-100 hover:bg-emerald-900 hover:text-white border border-emerald-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-emerald-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="text-[10px] bg-amber-400 text-emerald-950 px-2 py-0.5 rounded font-extrabold">
                      ACTIVE
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Login / User Profile Card */}
          <div className="pt-2 border-t border-emerald-800/70">
            {authSession ? (
              <div className="bg-emerald-900/80 p-3 rounded-xl border border-emerald-700 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-5 h-5 text-amber-300" />
                  <div>
                    <span className="text-xs font-bold text-white block">{authSession.name}</span>
                    <span className="text-[10px] text-emerald-300">
                      {authSession.role === 'participant' ? 'Mutakif' : authSession.role === 'super_admin' ? 'Super Admin' : 'Staff'} • {authSession.masjidName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    clearAuthSession();
                    setIsMobileMenuOpen(false);
                    router.push('/');
                  }}
                  className="text-xs font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs border border-emerald-500 shadow-sm"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>Sign In to Unified Portal</span>
              </Link>
            )}
          </div>

          {/* Mobile Demo Reset and Attribution */}
          <div className="pt-2 border-t border-emerald-800/50 flex items-center justify-between text-[11px] text-emerald-300">
            <span>Powered by <strong>GetoCore</strong></span>
            <button
              onClick={() => {
                handleResetData();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-1 text-emerald-300 hover:text-white"
            >
              <RotateCcw className="w-3 h-3" /> Reset Demo Dataset
            </button>
          </div>

        </div>
      )}

    </header>
  );
}

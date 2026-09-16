'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Building2, 
  UserCheck, 
  Shield, 
  Crown, 
  QrCode, 
  KeyRound, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ScanLine, 
  Stethoscope, 
  Phone, 
  FileText, 
  Lock, 
  Sparkles,
  Search
} from 'lucide-react';
import { 
  getStoredMasaajid, 
  getStoredParticipants, 
  setActiveMasjidId, 
  saveAuthSession,
  getStoredAuthSession,
  clearAuthSession,
  findParticipantByBarcode,
  AuthUserSession
} from '@/lib/storage';
import { Masjid, NigerianState } from '@/types/itikaaf';
import { INITIAL_MASAAJID } from '@/data/initialData';

type LoginRoleTab = 'participant' | 'coordinator' | 'community' | 'super_admin';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab') as LoginRoleTab | null;

  const [activeTab, setActiveTab] = useState<LoginRoleTab>(
    requestedTab && ['participant', 'coordinator', 'community', 'super_admin'].includes(requestedTab)
      ? requestedTab
      : 'participant'
  );

  const [masaajid, setMasaajid] = useState<Masjid[]>(INITIAL_MASAAJID);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [currentSession, setCurrentSession] = useState<AuthUserSession | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Form States - Participant
  const [participantRef, setParticipantRef] = useState<string>('');
  const [participantPhone, setParticipantPhone] = useState<string>('');

  // Form States - Mosque Coordinator
  const [coordMasjidId, setCoordMasjidId] = useState<string>('sultan-bello');
  const [coordRole, setCoordRole] = useState<string>('lead_admin');
  const [coordEmail, setCoordEmail] = useState<string>('');
  const [coordPin, setCoordPin] = useState<string>('1234');

  // Form States - Community / Volunteer
  const [commMasjidId, setCommMasjidId] = useState<string>('sultan-bello');
  const [commDuty, setCommDuty] = useState<'gate' | 'headcount' | 'daars' | 'medical'>('headcount');
  const [commBadgeId, setCommBadgeId] = useState<string>('VOL-01');
  const [commPin, setCommPin] = useState<string>('1234');

  // Form States - Super Admin
  const [superEmail, setSuperEmail] = useState<string>('admin@getocore.com');
  const [superPin, setSuperPin] = useState<string>('9999');

  useEffect(() => {
    const list = getStoredMasaajid();
    setMasaajid(list);
    setCurrentSession(getStoredAuthSession());

    const onAuthChange = () => setCurrentSession(getStoredAuthSession());
    window.addEventListener('itikaaf_auth_changed', onAuthChange);
    return () => window.removeEventListener('itikaaf_auth_changed', onAuthChange);
  }, []);

  const nigerianStates = ['All', ...Array.from(new Set(masaajid.map(m => m.state)))];

  const filteredMasaajid = selectedState === 'All' 
    ? masaajid 
    : masaajid.filter(m => m.state === selectedState);

  // Clear messages when switching tabs
  const handleTabChange = (tab: LoginRoleTab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // 1. PARTICIPANT LOGIN HANDLER
  const handleParticipantLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const query = participantRef.trim() || participantPhone.trim();
    if (!query) {
      setErrorMsg('Please enter your Tracking Reference Code (e.g., ITK-2026-0101) or registered Phone Number.');
      return;
    }

    const participant = findParticipantByBarcode(query);
    if (!participant) {
      setErrorMsg(`No participant record found matching "${query}". Please check your code or register if you have not done so.`);
      return;
    }

    const assignedMasjid = masaajid.find(m => m.id === participant.masjidId) || masaajid[0];
    setActiveMasjidId(assignedMasjid.id);

    const session: AuthUserSession = {
      role: 'participant',
      name: participant.fullName,
      emailOrPhone: participant.phone,
      masjidId: assignedMasjid.id,
      masjidName: assignedMasjid.name,
      masjidState: assignedMasjid.state,
      masjidLga: assignedMasjid.lga,
      trackingCode: participant.refCode,
      darId: participant.darId,
      darMemberId: participant.darMemberId,
      loggedInAt: new Date().toISOString()
    };

    saveAuthSession(session);
    setSuccessMsg(`Welcome, ${participant.fullName}! Redirecting to your personal gate pass...`);
    setTimeout(() => {
      router.push(`/pass?ref=${participant.refCode}`);
    }, 800);
  };

  // 2. MOSQUE COORDINATOR LOGIN HANDLER
  const handleCoordinatorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetMasjid = masaajid.find(m => m.id === coordMasjidId);
    if (!targetMasjid) {
      setErrorMsg('Selected Masjid could not be located.');
      return;
    }

    if (coordPin.trim() !== '1234') {
      const match = targetMasjid.admins?.find(a => a.accessPin === coordPin.trim());
      if (!match) {
        setErrorMsg('Invalid Security PIN. For demo access, use PIN: 1234');
        return;
      }
    }

    setActiveMasjidId(targetMasjid.id);

    const roleName = coordRole === 'lead_admin' ? 'Lead Administrator'
      : coordRole === 'screening_officer' ? 'Screening & Health Officer'
      : coordRole === 'logistics_officer' ? 'Logistics & Accommodation Officer'
      : 'Financial Auditor';

    const session: AuthUserSession = {
      role: 'masjid_coordinator',
      name: targetMasjid.chairmanName || `${targetMasjid.name} Coordinator`,
      emailOrPhone: coordEmail || targetMasjid.contactPhone,
      masjidId: targetMasjid.id,
      masjidName: targetMasjid.name,
      masjidState: targetMasjid.state,
      masjidLga: targetMasjid.lga,
      adminRole: roleName,
      loggedInAt: new Date().toISOString()
    };

    saveAuthSession(session);
    setSuccessMsg(`Authenticated as ${roleName} for ${targetMasjid.name}. Accessing Command Dashboard...`);
    setTimeout(() => {
      router.push(`/admin/dashboard?masjidId=${targetMasjid.id}`);
    }, 800);
  };

  // 3. COMMUNITY & COMMITTEE VOLUNTEER LOGIN HANDLER
  const handleCommunityLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetMasjid = masaajid.find(m => m.id === commMasjidId);
    if (!targetMasjid) {
      setErrorMsg('Selected Masjid could not be located.');
      return;
    }

    if (commPin.trim() !== '1234') {
      setErrorMsg('Invalid Duty PIN. For volunteer demo access, use PIN: 1234');
      return;
    }

    setActiveMasjidId(targetMasjid.id);

    const dutyTitles = {
      gate: 'Gate Security & Verification Officer',
      headcount: 'Daily Roll Call & Headcount Volunteer',
      daars: 'Dār Ameer & Hall Monitor',
      medical: 'Medical & Emergency Officer'
    };

    const dutyName = dutyTitles[commDuty];

    const session: AuthUserSession = {
      role: 'community_volunteer',
      name: `Volunteer (${commBadgeId})`,
      masjidId: targetMasjid.id,
      masjidName: targetMasjid.name,
      masjidState: targetMasjid.state,
      masjidLga: targetMasjid.lga,
      volunteerDuty: dutyName,
      loggedInAt: new Date().toISOString()
    };

    saveAuthSession(session);
    setSuccessMsg(`Welcome, ${dutyName}! Loading duty terminal...`);

    setTimeout(() => {
      if (commDuty === 'headcount') {
        router.push(`/admin/headcount?masjidId=${targetMasjid.id}`);
      } else if (commDuty === 'gate') {
        router.push(`/pass?masjidId=${targetMasjid.id}`);
      } else if (commDuty === 'daars') {
        router.push(`/admin/daars?masjidId=${targetMasjid.id}`);
      } else {
        router.push(`/admin/dashboard?masjidId=${targetMasjid.id}&view=medical`);
      }
    }, 800);
  };

  // 4. SUPER ADMIN LOGIN HANDLER
  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (superPin.trim() !== '9999' && superPin.trim() !== 'admin') {
      setErrorMsg('Invalid Super Admin Security Key. For demo access, use Master PIN: 9999');
      return;
    }

    const session: AuthUserSession = {
      role: 'super_admin',
      name: 'GetoCore National Director',
      emailOrPhone: superEmail,
      adminRole: 'National Platform Controller',
      loggedInAt: new Date().toISOString()
    };

    saveAuthSession(session);
    setSuccessMsg('Master Authentication Approved. Redirecting to National Super Admin Command Center...');
    setTimeout(() => {
      router.push('/super-admin');
    }, 800);
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentSession(null);
    setSuccessMsg('You have successfully signed out.');
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-between selection:bg-amber-500 selection:text-stone-950">
      
      {/* Background Ambience / Islamic Geometric Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-3.5 sm:p-6 lg:p-8 py-6 sm:py-10">
        <div className="w-full max-w-2xl bg-stone-950 border border-stone-800 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 p-6 sm:p-8 border-b border-stone-800 text-center relative">
            <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-300 border border-amber-400/20 px-3 py-1 rounded-full text-xs font-mono font-semibold mb-3">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Unified Access Terminal • بوابة الدخول الموحدة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In to Your I’tikāf Portal
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-lg mx-auto">
              Universal authentication for Mutakifin, Mosque Leadership, Volunteer Committees, and National Super Administrators.
            </p>

            {/* Active Session Notification (if logged in) */}
            {currentSession && (
              <div className="mt-4 bg-emerald-900/40 border border-emerald-700/60 rounded-2xl p-3 flex items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-700/60 flex items-center justify-center text-emerald-200">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-200">
                      Currently Signed In: <span className="text-white">{currentSession.name}</span>
                    </div>
                    <div className="text-[11px] text-emerald-300/80">
                      {currentSession.adminRole || currentSession.volunteerDuty || `Mutakif (${currentSession.trackingCode})`}
                      {currentSession.masjidName ? ` • ${currentSession.masjidName}` : ''}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold bg-stone-900 hover:bg-rose-950 text-stone-300 hover:text-rose-300 border border-stone-700 hover:border-rose-800 px-3 py-1.5 rounded-lg transition-all"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Role Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 bg-stone-900/90 border-b border-stone-800 p-1.5 gap-1.5">
            <button
              onClick={() => handleTabChange('participant')}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'participant'
                  ? 'bg-emerald-800 text-white shadow-md border border-emerald-600'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-300" />
              <span>Mutakif</span>
            </button>

            <button
              onClick={() => handleTabChange('coordinator')}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'coordinator'
                  ? 'bg-emerald-800 text-white shadow-md border border-emerald-600'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Mosque Admin</span>
            </button>

            <button
              onClick={() => handleTabChange('community')}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'community'
                  ? 'bg-emerald-800 text-white shadow-md border border-emerald-600'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-300" />
              <span>Committee</span>
            </button>

            <button
              onClick={() => handleTabChange('super_admin')}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'super_admin'
                  ? 'bg-amber-600 text-stone-950 shadow-md font-black border border-amber-400'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Super Admin</span>
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="m-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="m-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-700/80 text-emerald-200 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* Tab 1: MUTAKIF / PARTICIPANT FORM */}
          {activeTab === 'participant' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Mutakif Self-Service Terminal</span>
                  <span className="text-[10px] bg-stone-800 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                    Floor Spots Only (No Beds)
                  </span>
                </h3>
                <p className="text-xs text-stone-400">
                  Access your admission status, printable QR/Barcode Gate Pass, Dār allocation, and verified payment receipt.
                </p>
              </div>

              <form onSubmit={handleParticipantLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Tracking Reference Code <span className="text-amber-400 font-mono">(Primary)</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. ITK-2026-0101 or SBM-ABK-1447-0101"
                      value={participantRef}
                      onChange={e => setParticipantRef(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 text-white font-mono text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all uppercase placeholder:normal-case placeholder:font-sans"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Provided upon registration or sent via SMS/Email receipt.
                  </p>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-stone-800"></div>
                  <span className="flex-shrink mx-3 text-stone-500 text-[11px] font-bold uppercase tracking-wider">
                    Or Login with Registered Phone
                  </span>
                  <div className="flex-grow border-t border-stone-800"></div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      placeholder="e.g. 0803 123 4567"
                      value={participantPhone}
                      onChange={e => setParticipantPhone(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all group"
                >
                  <QrCode className="w-4 h-4 text-amber-300" />
                  <span>Access Gate Pass &amp; Space Details</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Demo Quick Fills */}
              <div className="pt-4 border-t border-stone-800/80">
                <div className="text-[11px] font-bold text-stone-400 mb-2">⚡ Instant One-Click Demo Participants:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setParticipantRef('ITK-2026-0101');
                      setParticipantPhone('');
                    }}
                    className="text-left bg-stone-900 hover:bg-stone-800 p-2.5 rounded-xl border border-stone-800 transition-all"
                  >
                    <div className="text-xs font-bold text-emerald-300">Al-Amin Danladi</div>
                    <div className="text-[11px] text-stone-400 font-mono">ITK-2026-0101 • Sultan Bello (Kaduna)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setParticipantRef('ITK-2026-0109');
                      setParticipantPhone('');
                    }}
                    className="text-left bg-stone-900 hover:bg-stone-800 p-2.5 rounded-xl border border-stone-800 transition-all"
                  >
                    <div className="text-xs font-bold text-emerald-300">Ibrahim Bello</div>
                    <div className="text-[11px] text-stone-400 font-mono">ITK-2026-0109 • Abuja National Mosque (FCT)</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: MOSQUE COORDINATOR FORM */}
          {activeTab === 'coordinator' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Mosque Leadership &amp; Coordinator Portal</span>
                  <span className="text-[10px] bg-stone-800 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                    Management
                  </span>
                </h3>
                <p className="text-xs text-stone-400">
                  Access your designated mosque's applicant screenings, Dār allocations, roll calls, and financial remittance.
                </p>
              </div>

              <form onSubmit={handleCoordinatorLogin} className="space-y-4">
                {/* Nigerian State Filter */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">Filter by State</label>
                    <select
                      value={selectedState}
                      onChange={e => setSelectedState(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
                    >
                      {nigerianStates.map(st => (
                        <option key={st} value={st}>{st === 'All' ? 'All Nigerian States' : st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">Select Subscribing Mosque</label>
                    <select
                      value={coordMasjidId}
                      onChange={e => setCoordMasjidId(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 text-amber-300 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
                    >
                      {filteredMasaajid.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.lga} LGA, {m.state})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Coordinator Role */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">Official Administrative Role</label>
                  <select
                    value={coordRole}
                    onChange={e => setCoordRole(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
                  >
                    <option value="lead_admin">Lead Administrator (المشرف العام)</option>
                    <option value="screening_officer">Screening &amp; Health Verification Officer (مسؤول التدقيق الصحي)</option>
                    <option value="logistics_officer">Logistics &amp; Dar Ameer Coordinator (مسؤول التسكين)</option>
                    <option value="finance_officer">Financial &amp; Revenue Auditor (المسؤول المالي)</option>
                  </select>
                </div>

                {/* Credentials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">Official Email / Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. admin@sultanbello.ng"
                      value={coordEmail}
                      onChange={e => setCoordEmail(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      4-Digit Security PIN <span className="text-amber-400 font-mono">(Demo: 1234)</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="••••"
                        value={coordPin}
                        onChange={e => setCoordPin(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 text-white font-mono text-center text-sm rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-amber-400 tracking-widest"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all group"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>Enter Mosque Management Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Demo Quick Fills */}
              <div className="pt-4 border-t border-stone-800/80">
                <div className="text-[11px] font-bold text-stone-400 mb-2">⚡ Quick-Fill Mosque Leadership:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCoordMasjidId('sultan-bello');
                      setCoordRole('lead_admin');
                      setCoordEmail('tahir@sultanbello.ng');
                      setCoordPin('1234');
                    }}
                    className="text-left bg-stone-900 hover:bg-stone-800 p-2 rounded-xl border border-stone-800 text-[11px]"
                  >
                    <div className="font-bold text-emerald-300">Sultan Bello (Kaduna)</div>
                    <div className="text-stone-400">Dr. Tahir • Lead Admin</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCoordMasjidId('abuja-national');
                      setCoordRole('lead_admin');
                      setCoordEmail('admin@abujanationalmosque.org');
                      setCoordPin('1234');
                    }}
                    className="text-left bg-stone-900 hover:bg-stone-800 p-2 rounded-xl border border-stone-800 text-[11px]"
                  >
                    <div className="font-bold text-emerald-300">Abuja National (FCT)</div>
                    <div className="text-stone-400">Prof. Oloyede • Admin</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCoordMasjidId('lagos-central');
                      setCoordRole('finance_officer');
                      setCoordEmail('finance@lagoscentralmosque.ng');
                      setCoordPin('1234');
                    }}
                    className="text-left bg-stone-900 hover:bg-stone-800 p-2 rounded-xl border border-stone-800 text-[11px]"
                  >
                    <div className="font-bold text-emerald-300">Lagos Central (Lagos)</div>
                    <div className="text-stone-400">Lateef • Finance Officer</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: COMMUNITY & COMMITTEE VOLUNTEER FORM */}
          {activeTab === 'community' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Community &amp; Operational Committee</span>
                  <span className="text-[10px] bg-stone-800 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                    Operations
                  </span>
                </h3>
                <p className="text-xs text-stone-400">
                  Fast access for ground-level volunteers, security officers at the gate, medical staff, and Dār Ameers.
                </p>
              </div>

              <form onSubmit={handleCommunityLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">Select Duty Mosque</label>
                  <select
                    value={commMasjidId}
                    onChange={e => setCommMasjidId(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 text-amber-300 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:border-amber-400"
                  >
                    {masaajid.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.lga} LGA, {m.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">Operational Duty Station</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCommDuty('headcount')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        commDuty === 'headcount'
                          ? 'bg-emerald-900/60 border-emerald-500 text-white'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <ScanLine className="w-4 h-4 text-amber-300 mb-1" />
                      <div className="text-xs font-bold">Daily Roll Call Volunteer</div>
                      <div className="text-[10px] text-stone-400">Barcode headcount scan</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCommDuty('gate')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        commDuty === 'gate'
                          ? 'bg-emerald-900/60 border-emerald-500 text-white'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-amber-300 mb-1" />
                      <div className="text-xs font-bold">Gate Security Officer</div>
                      <div className="text-[10px] text-stone-400">Badge verification pass</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCommDuty('daars')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        commDuty === 'daars'
                          ? 'bg-emerald-900/60 border-emerald-500 text-white'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <Crown className="w-4 h-4 text-amber-300 mb-1" />
                      <div className="text-xs font-bold">Dār Ameer &amp; Monitor</div>
                      <div className="text-[10px] text-stone-400">Hall floor spot audit</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCommDuty('medical')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        commDuty === 'medical'
                          ? 'bg-emerald-900/60 border-emerald-500 text-white'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4 text-amber-300 mb-1" />
                      <div className="text-xs font-bold">Medical Attendant</div>
                      <div className="text-[10px] text-stone-400">Emergency &amp; health roster</div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">Badge Number / Name</label>
                    <input
                      type="text"
                      placeholder="e.g. VOL-KAD-01"
                      value={commBadgeId}
                      onChange={e => setCommBadgeId(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">
                      Duty PIN <span className="text-amber-400 font-mono">(Demo: 1234)</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="••••"
                        value={commPin}
                        onChange={e => setCommPin(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 text-white font-mono text-center text-sm rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-amber-400 tracking-widest"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all group"
                >
                  <ScanLine className="w-4 h-4 text-amber-300" />
                  <span>Launch Volunteer Duty Terminal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          )}

          {/* Tab 4: NATIONAL SUPER ADMIN FORM */}
          {activeTab === 'super_admin' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>National Super Admin Command Center</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                    Institutional Authority
                  </span>
                </h3>
                <p className="text-xs text-stone-400">
                  Operated by GetoCore Digital Innovation. Controls nationwide mosque onboarding, financial split settings, and platform commission rates.
                </p>
              </div>

              <form onSubmit={handleSuperAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">Super Admin Identifier</label>
                  <input
                    type="text"
                    value={superEmail}
                    onChange={e => setSuperEmail(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    Master Security Key <span className="text-amber-400 font-mono">(Demo: 9999)</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      maxLength={8}
                      placeholder="••••"
                      value={superPin}
                      onChange={e => setSuperPin(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 text-amber-300 font-mono text-center text-sm rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-amber-400 tracking-widest font-bold"
                    />
                  </div>
                </div>

                <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 text-[11px] text-amber-300/80 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>GetoCore Institutional Privileges</span>
                  </div>
                  <p>
                    Full access across all 36 States + FCT Abuja, 774 LGAs, Jaiz Bank platform settlement account configuration, and live revenue percentage adjustments.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black py-3 px-4 rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all group"
                >
                  <Crown className="w-4 h-4 text-stone-950" />
                  <span>Access National Command Center</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          )}

          {/* Footer Assistance */}
          <div className="bg-stone-900/60 p-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
            <div>
              Need assistance? Contact support at{' '}
              <a href="mailto:support@getocore.com" className="text-amber-400 hover:underline">
                support@getocore.com
              </a>
            </div>
            <div className="font-mono text-[11px] text-stone-500">
              Security: AES256 • Powered by GetoCore Digital Innovation
            </div>
          </div>
        </div>
      </div>

      {/* Micro Footer */}
      <div className="relative z-10 text-center py-4 text-xs text-stone-500 border-t border-stone-800/50">
        © 1447 AH / 2026 CE • Federal Republic of Nigeria Unified I’tikāf Management Platform • Powered by GetoCore Digital Innovation
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-amber-400">
        <div className="text-xs font-bold animate-pulse">Loading Unified Login Terminal...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

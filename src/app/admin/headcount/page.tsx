'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ScanLine, 
  Barcode, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Clock, 
  Users, 
  Utensils, 
  Moon, 
  Crown, 
  HeartHandshake, 
  Stethoscope, 
  Search, 
  ArrowRight, 
  Filter,
  Check,
  RotateCcw,
  Sparkles,
  Building,
  Printer,
  BookOpen
} from 'lucide-react';
import { Participant, Dar, DarId, HeadcountSession, HeadcountRecord } from '../../../types/itikaaf';
import { 
  getStoredParticipants, 
  getStoredDars, 
  findParticipantByBarcode, 
  recordHeadcountScan, 
  getStoredHeadcountRecords,
  getDarUniqueMemberId,
  saveHeadcountRecords
} from '../../../lib/storage';
import { INITIAL_DARS } from '../../../data/initialData';
import { generateBarcodeSvg } from '../../../lib/barcode';

export default function HeadcountPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [dars, setDars] = useState<Dar[]>(INITIAL_DARS);
  const [headcountRecords, setHeadcountRecords] = useState<HeadcountRecord[]>([]);
  
  // Active session and scanner input state
  const [selectedSession, setSelectedSession] = useState<HeadcountSession>('suhur');
  const [selectedDarFilter, setSelectedDarFilter] = useState<string>('all');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Last scan feedback
  const [lastScannedParticipant, setLastScannedParticipant] = useState<Participant | null>(null);
  const [lastScanResult, setLastScanResult] = useState<{
    success: boolean;
    alreadyRecorded?: boolean;
    message: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load data on mount & register listeners
  const loadData = () => {
    setParticipants(getStoredParticipants());
    setDars(getStoredDars());
    setHeadcountRecords(getStoredHeadcountRecords());
  };

  useEffect(() => {
    loadData();

    const handleDataChange = () => loadData();
    window.addEventListener('itikaaf_data_changed', handleDataChange);
    window.addEventListener('itikaaf_headcount_changed', handleDataChange);

    return () => {
      window.removeEventListener('itikaaf_data_changed', handleDataChange);
      window.removeEventListener('itikaaf_headcount_changed', handleDataChange);
    };
  }, []);

  // Keep input focused for physical barcode scanner guns
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedSession]);

  // Web Audio synthesizer for scanner beeps
  const playBeep = (freq: number, durationMs: number, type: OscillatorType = 'sine') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio not permitted without user gesture or unsupported
    }
  };

  const playSuccessSound = () => {
    playBeep(920, 80);
    setTimeout(() => playBeep(1480, 120), 90);
  };

  const playWarningSound = () => {
    playBeep(320, 220, 'sawtooth');
  };

  // Perform Headcount Scan
  const handleScanSubmit = (codeToScan?: string) => {
    const rawCode = (codeToScan || barcodeInput).trim();
    if (!rawCode) return;

    const matchedParticipant = findParticipantByBarcode(rawCode);

    if (!matchedParticipant) {
      playWarningSound();
      setLastScannedParticipant(null);
      setLastScanResult({
        success: false,
        alreadyRecorded: false,
        message: `No participant found matching barcode/ID: "${rawCode}". Please check spelling or verify badge.`,
      });
      setBarcodeInput('');
      return;
    }

    // Ensure member has darMemberId
    if (!matchedParticipant.darMemberId && matchedParticipant.darId) {
      matchedParticipant.darMemberId = getDarUniqueMemberId(matchedParticipant, matchedParticipant.darId);
    }

    const assignedDar = dars.find(d => d.id === matchedParticipant.darId);
    const ameerTitle = assignedDar ? assignedDar.ameerName : 'Assigned Ameer';

    const res = recordHeadcountScan(matchedParticipant, selectedSession, ameerTitle);

    setLastScannedParticipant(matchedParticipant);
    setLastScanResult({
      success: res.success,
      alreadyRecorded: res.alreadyRecorded,
      message: res.message,
    });

    if (res.alreadyRecorded) {
      playWarningSound();
    } else {
      playSuccessSound();
    }

    setBarcodeInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScanSubmit();
    }
  };

  const handleClearRecordsForSession = () => {
    const today = new Date().toISOString().split('T')[0];
    if (confirm(`Reset all ${selectedSession.toUpperCase()} headcount scans for today (${today})?`)) {
      const filtered = headcountRecords.filter(
        r => !(r.session === selectedSession && r.dateKey === today)
      );
      saveHeadcountRecords(filtered);
      setLastScanResult(null);
      setLastScannedParticipant(null);
    }
  };

  // Session metadata
  const sessionConfig: Record<HeadcountSession, { label: string; arabic: string; time: string; icon: React.ComponentType<{ className?: string }> }> = {
    suhur: { label: 'Suhur Roster', arabic: 'سحور', time: '03:30 AM – 04:45 AM', icon: Utensils },
    iftar: { label: 'Iftar Distribution', arabic: 'إفطار', time: '06:15 PM – 07:15 PM', icon: Utensils },
    tahajjud: { label: 'Tahajjud Qiyam', arabic: 'تهجد', time: '01:30 AM – 03:00 AM', icon: Moon },
    halqah: { label: 'Tafseer & Halqah', arabic: 'حلقات العلم', time: '09:30 AM – 11:00 AM', icon: BookOpen },
    gate: { label: 'Gate Entry / Arrival', arabic: 'الدخول للمسجد', time: 'Asr Night 21 Onwards', icon: ScanLine },
  };

  const today = new Date().toISOString().split('T')[0];

  // Headcount metrics per Dār for current session & day
  const todaySessionRecords = headcountRecords.filter(
    r => r.session === selectedSession && r.dateKey === today
  );

  const darMetrics = dars.map(dar => {
    const assignedParticipants = participants.filter(
      p => p.darId === dar.id && p.status === 'approved'
    );
    const presentRecords = todaySessionRecords.filter(r => r.darId === dar.id);
    const presentCount = presentRecords.length;
    const totalCount = assignedParticipants.length;
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    // Special dietary counts for meals
    const diabeticCount = assignedParticipants.filter(
      p => p.healthMedical.hasChronicCondition && 
      p.healthMedical.conditions.some(c => c.toLowerCase().includes('diabet'))
    ).length;

    const hypertensiveCount = assignedParticipants.filter(
      p => p.healthMedical.hasChronicCondition && 
      p.healthMedical.conditions.some(c => c.toLowerCase().includes('hypertens') || c.toLowerCase().includes('blood pressure'))
    ).length;

    return {
      dar,
      assignedParticipants,
      presentRecords,
      presentCount,
      totalCount,
      percentage,
      diabeticCount,
      hypertensiveCount,
    };
  });

  // Filtered log of scans
  const displayedRecords = todaySessionRecords.filter(r => {
    if (selectedDarFilter === 'all') return true;
    return r.darId === selectedDarFilter;
  });

  const getDarBadgeColor = (id?: string) => {
    switch (id) {
      case 'abubakar': return 'bg-emerald-800 text-emerald-100 border-emerald-700';
      case 'umar': return 'bg-blue-800 text-blue-100 border-blue-700';
      case 'usman': return 'bg-amber-800 text-amber-100 border-amber-700';
      case 'aliyu': return 'bg-purple-800 text-purple-100 border-purple-700';
      default: return 'bg-stone-700 text-stone-200 border-stone-600';
    }
  };

  // Sample quick test scans for each Dār
  const testSampleMembers = [
    { code: 'ABK-1447-0101', name: 'Dr. Zayd Sulaiman', darName: 'Dār Abubakar', spot: 'SPA-A-R2-08', tagBg: 'bg-emerald-900 text-emerald-200' },
    { code: 'UMR-1447-0204', name: 'Ustadh Bilal Haroon', darName: 'Dār Umar', spot: 'SPA-U-R1-04', tagBg: 'bg-blue-900 text-blue-200' },
    { code: 'USM-1447-0315', name: 'Muhammad Salisu', darName: 'Dār Usman', spot: 'SPA-O-R3-12', tagBg: 'bg-amber-900 text-amber-200' },
    { code: 'ALY-1447-0863', name: 'Imam Khalid Yahya', darName: 'Dār Aliyu', spot: 'SPA-L-R2-03', tagBg: 'bg-purple-900 text-purple-200' },
  ];

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP HEADER BANNER */}
        <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-800/80">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-1">
                <ScanLine className="w-4 h-4 text-amber-400" />
                <span>Real-Time Barcode & Unique Dār ID Terminal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <span>Dār Headcount Scanner</span>
                <span className="text-amber-400 font-arabic text-xl font-normal">نظام حصر وتسجيل المعتكفين</span>
              </h1>
              <p className="text-sm text-emerald-200 mt-1 max-w-2xl">
                Scan attendee ID badges via laser barcode scanner gun or camera. Automatically records headcounts per Dār for Suhur, Iftar, Tahajjud halaqat, and Gate verification.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  soundEnabled 
                    ? 'bg-emerald-800 text-amber-300 border border-emerald-700 hover:bg-emerald-700' 
                    : 'bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700'
                }`}
                title="Toggle Scanner Sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{soundEnabled ? 'Beeper ON' : 'Muted'}</span>
              </button>

              <button
                onClick={handleClearRecordsForSession}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-900/80 hover:bg-red-950 hover:text-red-300 text-stone-300 border border-emerald-800 transition-colors"
                title="Reset this session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Today</span>
              </button>
            </div>
          </div>

          {/* SESSION SELECTOR TABS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-6 pt-5 border-t border-emerald-800/60">
            {(['suhur', 'iftar', 'tahajjud', 'halqah', 'gate'] as HeadcountSession[]).map(sKey => {
              const s = sessionConfig[sKey];
              const Icon = s.icon;
              const isSelected = selectedSession === sKey;
              return (
                <button
                  key={sKey}
                  onClick={() => setSelectedSession(sKey)}
                  className={`flex flex-col p-3 rounded-xl text-left transition-all relative overflow-hidden border ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-800 to-emerald-900 border-amber-400 text-white shadow-lg ring-2 ring-amber-400/40'
                      : 'bg-emerald-900/40 border-emerald-800/80 text-emerald-200 hover:bg-emerald-900/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs sm:text-sm">{s.label}</span>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-emerald-400'}`} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-emerald-300/90 font-mono">
                    <span>{s.time}</span>
                    <span className="font-arabic text-amber-300">{s.arabic}</span>
                  </div>
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SCANNER INPUT & QUICK TEST CONSOLE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <div className="max-w-3xl mx-auto space-y-4">
            
            {/* Main Barcode Scanner Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Scan Badge Barcode / Enter Unique Dār ID (e.g. ABK-1447-0101)
              </label>
              <div className="relative flex items-center shadow-sm rounded-xl overflow-hidden border-2 border-emerald-800 focus-within:ring-4 focus-within:ring-emerald-500/20">
                <div className="pl-4 pr-2 text-emerald-800">
                  <Barcode className="w-6 h-6 animate-pulse" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Focus here & scan badge with barcode gun, or type ID..."
                  className="w-full py-3.5 px-2 text-stone-900 text-base sm:text-lg font-mono font-bold tracking-wider placeholder:text-stone-400 placeholder:font-sans focus:outline-none"
                />
                <button
                  onClick={() => handleScanSubmit()}
                  disabled={!barcodeInput.trim()}
                  className="h-full px-6 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white font-bold text-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Scan</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5 flex items-center justify-between">
                <span>Supports handheld laser scanners (Auto-Enter) & smartphone QR string pastes.</span>
                <span className="font-mono text-emerald-800 font-bold">Session: {selectedSession.toUpperCase()}</span>
              </p>
            </div>

            {/* Quick 1-Click Simulation Buttons for testing each Dār */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                1-Click Quick Test Barcode Badges (One per Dār):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {testSampleMembers.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => handleScanSubmit(item.code)}
                    className="p-2.5 rounded-xl border border-stone-200 hover:border-emerald-700 bg-stone-50 hover:bg-emerald-50/50 text-left transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900 group-hover:text-emerald-900">
                          {item.name}
                        </span>
                        <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-stone-200 text-stone-800">
                          {item.spot}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">{item.darName}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] font-mono font-extrabold text-emerald-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                        {item.code}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold group-hover:underline flex items-center gap-0.5">
                        Test Scan →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SCAN RESULT NOTIFICATION BANNER */}
            {lastScanResult && (
              <div
                className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                  lastScanResult.success && !lastScanResult.alreadyRecorded
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                    : lastScanResult.alreadyRecorded
                    ? 'bg-amber-50 border-amber-400 text-amber-900'
                    : 'bg-red-50 border-red-400 text-red-900'
                }`}
              >
                {lastScanResult.success && !lastScanResult.alreadyRecorded ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : lastScanResult.alreadyRecorded ? (
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-bold">{lastScanResult.message}</p>
                  {lastScannedParticipant && (
                    <div className="mt-2 pt-2 border-t border-black/10 flex flex-wrap items-center gap-3 text-xs">
                      <span>Unique ID: <strong className="font-mono">{lastScannedParticipant.darMemberId}</strong></span>
                      <span>Dār: <strong>{dars.find(d => d.id === lastScannedParticipant.darId)?.nameEn}</strong></span>
                      <span>Musalla Space: <strong className="font-mono bg-white px-1 rounded border">{lastScannedParticipant.allocatedSpace?.spaceTag || 'Unassigned'}</strong></span>
                      {lastScannedParticipant.healthMedical.hasChronicCondition && (
                        <span className="text-red-700 font-semibold">
                          ⚠️ Diet: {lastScannedParticipant.healthMedical.conditions.join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* 4 DĀRS LIVE HEADCOUNT METRICS CARDS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Crown className="w-4 h-4 text-emerald-800" />
              <span>Headcount by Dār • {sessionConfig[selectedSession].label} ({today})</span>
            </h2>
            <span className="text-xs font-semibold text-stone-500">
              Total Present: {todaySessionRecords.length} / {participants.filter(p => p.status === 'approved').length} Mutakifin
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {darMetrics.map(({ dar, presentCount, totalCount, percentage, diabeticCount, hypertensiveCount }) => {
              const isSelected = selectedDarFilter === dar.id;
              return (
                <div 
                  key={dar.id}
                  onClick={() => setSelectedDarFilter(isSelected ? 'all' : dar.id)}
                  className={`bg-white rounded-2xl p-5 shadow-sm border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-emerald-800 shadow-md ring-2 ring-emerald-600/30' : 'border-stone-200 hover:border-emerald-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getDarBadgeColor(dar.id)}`}>
                        {dar.codePrefix} • DĀR #{dar.codePrefix}
                      </span>
                      <h3 className="text-base font-bold text-stone-900 mt-1">{dar.nameEn}</h3>
                      <p className="text-[11px] text-stone-500 font-arabic">{dar.nameAr}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-950 font-mono">
                        {presentCount}<span className="text-xs text-stone-400 font-normal">/{totalCount}</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700">{percentage}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-stone-100 rounded-full h-2.5 overflow-hidden border border-stone-200">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        dar.id === 'abubakar' ? 'bg-emerald-600' :
                        dar.id === 'umar' ? 'bg-blue-600' :
                        dar.id === 'usman' ? 'bg-amber-600' : 'bg-purple-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Ameer info & Special Dietary Count */}
                  <div className="mt-3 pt-3 border-t border-stone-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-stone-600">
                      <span>Ameer:</span>
                      <span className="font-semibold text-stone-900 truncate max-w-[130px]">{dar.ameerName}</span>
                    </div>
                    {(diabeticCount > 0 || hypertensiveCount > 0) && (
                      <div className="flex items-center gap-1.5 text-[10px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        <Stethoscope className="w-3 h-3 text-amber-600 flex-shrink-0" />
                        <span>Special: {diabeticCount} Diabetic • {hypertensiveCount} BP</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SCAN HISTORY & LIVE FEED */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-800" />
                <span>Real-Time Headcount Scan Activity</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  {displayedRecords.length} Scanned
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                Sorted by most recent scan first for {sessionConfig[selectedSession].label}
              </p>
            </div>

            {/* Dār Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-stone-500 font-semibold mr-1">Filter:</span>
              <button
                onClick={() => setSelectedDarFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  selectedDarFilter === 'all' 
                    ? 'bg-emerald-950 text-white' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All Dārs
              </button>
              {dars.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDarFilter(d.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    selectedDarFilter === d.id 
                      ? 'bg-emerald-900 text-amber-300' 
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {d.codePrefix}
                </button>
              ))}
            </div>
          </div>

          {displayedRecords.length === 0 ? (
            <div className="p-12 text-center">
              <ScanLine className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-stone-700">No headcounts recorded yet for this session</h4>
              <p className="text-xs text-stone-500 mt-1">
                Scan an ID badge or click one of the quick test buttons above to start taking headcount.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Unique Dār ID</th>
                    <th className="py-3 px-4">Participant Name</th>
                    <th className="py-3 px-4">Dār</th>
                    <th className="py-3 px-4">Floor Spot</th>
                    <th className="py-3 px-4">Supervisor</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {displayedRecords.map((record) => {
                    const participant = participants.find(p => p.id === record.participantId);
                    const dar = dars.find(d => d.id === record.darId);
                    return (
                      <tr key={record.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-stone-500">
                          {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-950">
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-extrabold">
                            {record.darMemberId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{record.participantName}</div>
                          {participant?.healthMedical.hasChronicCondition && (
                            <span className="text-[10px] text-amber-700 font-semibold block">
                              ⚠️ {participant.healthMedical.conditions.join(', ')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getDarBadgeColor(dar?.id)}`}>
                            {dar ? dar.nameEn : record.darId}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-stone-800">
                          {record.spaceTag ? (
                            <span className="bg-emerald-50 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-200">
                              {record.spaceTag}
                            </span>
                          ) : (
                            <span className="text-stone-400">N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-600">
                          {record.scannedBy}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            Confirmed
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

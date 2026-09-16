'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  QrCode, 
  Phone, 
  AlertCircle, 
  UserPlus, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { Participant } from '../../types/itikaaf';
import { 
  getStoredParticipants, 
  getParticipantByRef, 
  getParticipantByPhone 
} from '../../lib/storage';
import VerificationGatePass from '../../components/VerificationGatePass';

function PassContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlRef = searchParams.get('ref') || '';

  const [searchQuery, setSearchQuery] = useState(urlRef);
  const [activeParticipant, setActiveParticipant] = useState<Participant | null>(null);
  const [searchError, setSearchError] = useState('');
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);

  // Load participants and auto-search if ref is present in URL
  useEffect(() => {
    const list = getStoredParticipants();
    setAllParticipants(list);

    if (urlRef) {
      const match = list.find(p => p.refCode.toUpperCase() === urlRef.trim().toUpperCase());
      if (match) {
        setActiveParticipant(match);
        setSearchQuery(urlRef);
      } else {
        setSearchError(`No participant found with reference code "${urlRef}".`);
      }
    } else {
      // Default to the first approved participant so user immediately sees a live Gate Pass
      const defaultApproved = list.find(p => p.status === 'approved');
      if (defaultApproved) {
        setActiveParticipant(defaultApproved);
        setSearchQuery(defaultApproved.refCode);
      }
    }

    const handleDataChange = () => {
      const refreshed = getStoredParticipants();
      setAllParticipants(refreshed);
      if (activeParticipant) {
        const found = refreshed.find(p => p.id === activeParticipant.id);
        if (found) setActiveParticipant(found);
      }
    };

    window.addEventListener('itikaaf_data_changed', handleDataChange);
    return () => window.removeEventListener('itikaaf_data_changed', handleDataChange);
  }, [urlRef]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    if (!searchQuery.trim()) {
      setSearchError('Please enter your Reference Code (e.g. ITK-2026-0101) or Phone Number.');
      return;
    }

    const query = searchQuery.trim();
    // Try Ref code first
    let match = getParticipantByRef(query);
    if (!match) {
      // Try Phone number
      match = getParticipantByPhone(query);
    }

    if (match) {
      setActiveParticipant(match);
      setSearchError('');
      router.push(`/pass?ref=${match.refCode}`);
    } else {
      setActiveParticipant(null);
      setSearchError(`No application record found for "${query}". Please check your code or phone number.`);
    }
  };

  const selectParticipant = (p: Participant) => {
    setActiveParticipant(p);
    setSearchQuery(p.refCode);
    setSearchError('');
    router.push(`/pass?ref=${p.refCode}`);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page Title Header (Hidden during print) */}
        <div className="no-print text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-2 border border-emerald-200">
            <QrCode className="w-3.5 h-3.5 text-emerald-700" />
            <span>Digital Gate Pass & Verification Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            I’tikāf Verification & Gate Pass
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            البحث عن تصريح الدخول وبطاقة المعتكف بالرقم المرجعي أو رقم الهاتف
          </p>
        </div>

        {/* Search Box (Hidden during print) */}
        <div className="no-print bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Reference Code (e.g. ITK-2026-0101) or Phone..."
                className="w-full text-sm pl-11 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-sm transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Verify & Lookup</span>
            </button>
          </form>

          {searchError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Quick Demo Selector Chips */}
          <div className="mt-4 pt-3 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
              Quick Test Profiles (اضغط للتجربة الفورية):
            </span>
            <div className="flex flex-wrap gap-2">
              {allParticipants.slice(0, 5).map((p) => {
                const isSelected = activeParticipant?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => selectParticipant(p)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-900 text-amber-300 border-emerald-950 font-bold shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 font-medium'
                    }`}
                  >
                    <span className="font-mono text-[11px]">{p.refCode}</span>
                    <span className="text-stone-400">|</span>
                    <span>{p.fullName.split(' ')[0]}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      p.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : p.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {p.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Display Gate Pass Card or Empty State */}
        {activeParticipant ? (
          <VerificationGatePass
            participant={activeParticipant}
            onParticipantUpdated={(updated) => setActiveParticipant(updated)}
          />
        ) : (
          <div className="no-print bg-white rounded-2xl border border-stone-200 p-8 text-center">
            <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-800">No Gate Pass Selected</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Please enter your application reference code above or submit a new registration if you haven't applied yet.
            </p>
            <div className="mt-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-800 text-white px-4 py-2 rounded-lg hover:bg-emerald-900 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register for I’tikāf</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function PassPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-xs text-emerald-800 font-semibold animate-pulse">Loading Gate Pass Terminal...</div>
      </div>
    }>
      <PassContent />
    </Suspense>
  );
}

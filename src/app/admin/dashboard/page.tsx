'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  QrCode, 
  Printer, 
  ShieldCheck, 
  Stethoscope, 
  HeartHandshake, 
  Phone, 
  UserCheck, 
  Edit3, 
  Building, 
  Building2,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Crown,
  Eye,
  X,
  Save,
  Check,
  MapPin,
  Calendar,
  History,
  Archive,
  CreditCard,
  Coins,
  Percent
} from 'lucide-react';
import { Participant, ApplicationStatus, DarId, SpaceAllocation, Masjid } from '../../../types/itikaaf';
import { 
  getStoredParticipants, 
  getStoredDars, 
  updateParticipantStatus, 
  assignParticipantSpace, 
  assignParticipantDar, 
  checkInParticipant, 
  checkOutParticipant,
  CURRENT_RAMADAN_YEAR,
  getStoredMasaajid,
  getActiveMasjid
} from '../../../lib/storage';
import { INITIAL_MASAAJID } from '../../../data/initialData';
import { useSearchParams } from 'next/navigation';

function DashboardContent() {
  const searchParams = useSearchParams();
  const paramMasjid = searchParams?.get('masjid');

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [dars, setDars] = useState(getStoredDars());
  const [masaajid, setMasaajid] = useState<Masjid[]>(INITIAL_MASAAJID);
  const [selectedMasjidFilter, setSelectedMasjidFilter] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('1447');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [darFilter, setDarFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');

  // Modal State for Participant Inspection & Space Allocation
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit Modal Form State
  const [modalStatus, setModalStatus] = useState<ApplicationStatus>('pending');
  const [modalStatusNotes, setModalStatusNotes] = useState('');
  const [modalDarId, setModalDarId] = useState<DarId | 'none'>('none');
  const [modalHall, setModalHall] = useState('Hall of Omar (Brothers Ground Musalla)');
  const [modalSection, setModalSection] = useState('Section A (Qibla Forward)');
  const [modalRow, setModalRow] = useState(1);
  const [modalSpotNumber, setModalSpotNumber] = useState(1);

  // Quick Check-in modal state
  const [checkInParticipantId, setCheckInParticipantId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const loadData = () => {
    setParticipants(getStoredParticipants());
    setDars(getStoredDars());
    const mList = getStoredMasaajid();
    setMasaajid(mList);
    if (paramMasjid && mList.some(m => m.id === paramMasjid || m.slug === paramMasjid)) {
      setSelectedMasjidFilter(paramMasjid);
    }
  };

  useEffect(() => {
    loadData();
    const handleDataChange = () => loadData();
    window.addEventListener('itikaaf_data_changed', handleDataChange);
    window.addEventListener('itikaaf_masaajid_changed', handleDataChange);
    return () => {
      window.removeEventListener('itikaaf_data_changed', handleDataChange);
      window.removeEventListener('itikaaf_masaajid_changed', handleDataChange);
    };
  }, [paramMasjid]);

  // Filter by year first
  const yearFilteredParticipants = participants.filter(p => {
    if (selectedYear === 'all') return true;
    return (p.ramadanYear || '1447') === selectedYear;
  });

  // Active Mosque context
  const currentFilteredMasjid = masaajid.find(m => m.id === selectedMasjidFilter);
  const totalCapacity = currentFilteredMasjid ? currentFilteredMasjid.totalFloorCapacity : 350;

  // Summary Analytics for selected year and mosque
  const applicantsByMasjid = yearFilteredParticipants.filter(p => {
    if (selectedMasjidFilter === 'all') return true;
    return p.masjidId === selectedMasjidFilter || (!p.masjidId && selectedMasjidFilter === 'sultan-bello');
  });

  const totalApplicants = applicantsByMasjid.length;
  const approvedCount = applicantsByMasjid.filter(p => p.status === 'approved').length;
  const pendingCount = applicantsByMasjid.filter(p => p.status === 'pending').length;
  const waitlistedCount = applicantsByMasjid.filter(p => p.status === 'waitlisted').length;
  const checkedInCount = applicantsByMasjid.filter(p => p.attendance.checkedIn).length;
  const returningCount = applicantsByMasjid.filter(p => p.isReturning).length;
  const remainingCapacity = Math.max(0, totalCapacity - approvedCount);

  // Mosque Financial Breakdown & Platform Deductions
  const paidApplicants = applicantsByMasjid.filter(p => p.payment?.status === 'paid');
  const totalMosqueGrossNgn = paidApplicants.reduce((sum, p) => sum + (p.payment?.amountNgn || 0), 0);
  const mosquePlatformCutPct = currentFilteredMasjid?.paymentConfig?.platformFeePercentage ?? 10;
  const totalMosquePlatformFeeNgn = paidApplicants.reduce((sum, p) => {
    if (p.payment?.platformFeeNgn !== undefined) return sum + p.payment.platformFeeNgn;
    return sum + Math.round(((p.payment?.amountNgn || 0) * mosquePlatformCutPct) / 100);
  }, 0);
  const totalMosqueNetDisbursedNgn = totalMosqueGrossNgn - totalMosquePlatformFeeNgn;

  // Filtering Logic
  const filteredParticipants = applicantsByMasjid.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      p.fullName.toLowerCase().includes(q) ||
      p.refCode.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.allocatedSpace?.spaceTag.toLowerCase().includes(q) ?? false);

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'checked_in' ? p.attendance.checkedIn : p.status === statusFilter);

    const matchesDar = 
      darFilter === 'all' ||
      (darFilter === 'unassigned' ? !p.darId : p.darId === darFilter);

    const matchesGender = 
      genderFilter === 'all' || p.gender === genderFilter;

    return matchesSearch && matchesStatus && matchesDar && matchesGender;
  });

  const openReviewModal = (p: Participant) => {
    setSelectedParticipant(p);
    setModalStatus(p.status);
    setModalStatusNotes(p.statusNotes || '');
    setModalDarId(p.darId || 'none');
    if (p.allocatedSpace) {
      setModalHall(p.allocatedSpace.hallName);
      setModalSection(p.allocatedSpace.section);
      setModalRow(p.allocatedSpace.row);
      setModalSpotNumber(p.allocatedSpace.spaceNumber);
    } else {
      setModalHall(p.gender === 'male' ? 'Hall of Omar (Brothers Ground Musalla)' : 'Hall of Aisha (Sisters Upper Mezzanine)');
      setModalSection('Section A');
      setModalRow(1);
      setModalSpotNumber(Math.floor(1 + Math.random() * 20));
    }
    setIsModalOpen(true);
  };

  const saveParticipantReview = () => {
    if (!selectedParticipant) return;

    updateParticipantStatus(selectedParticipant.id, modalStatus, modalStatusNotes);

    assignParticipantDar(
      selectedParticipant.id, 
      modalDarId === 'none' ? undefined : modalDarId
    );

    if (modalStatus === 'approved') {
      const sectionLetter = modalSection.includes('B') ? 'B' : modalSection.includes('C') ? 'C' : 'A';
      const wingPrefix = selectedParticipant.gender === 'male' ? 'M' : 'F';
      const spaceTag = `SPA-${wingPrefix}-${sectionLetter}-R${modalRow}-${String(modalSpotNumber).padStart(2, '0')}`;

      const newSpace: SpaceAllocation = {
        hallId: modalHall.includes('Aisha') ? 'hall-aisha' : 'hall-omar',
        hallName: modalHall,
        section: modalSection,
        row: Number(modalRow),
        spaceNumber: Number(modalSpotNumber),
        spaceTag,
        notes: `Assigned on ${new Date().toLocaleDateString()}`,
      };
      assignParticipantSpace(selectedParticipant.id, newSpace);
    }

    setIsModalOpen(false);
    setSelectedParticipant(null);
  };

  const handleQuickCheckIn = (p: Participant) => {
    if (p.attendance.checkedIn) {
      if (confirm(`Log checkout for ${p.fullName}?`)) {
        checkOutParticipant(p.id);
      }
    } else {
      setCheckInParticipantId(p.id);
      setTagInput(`TAG-${p.gender === 'male' ? 'M' : 'F'}-${p.allocatedSpace?.spaceNumber || '01'}`);
    }
  };

  const confirmQuickCheckIn = () => {
    if (checkInParticipantId) {
      checkInParticipant(checkInParticipantId, tagInput.trim() || 'TAG-01', 'Admin Officer');
      setCheckInParticipantId(null);
    }
  };

  const getDarObj = (darId?: DarId) => {
    return dars.find(d => d.id === darId);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Dashboard Title & Multi-Year Selector */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-xs font-semibold mb-1 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Multi-Year Central Committee Administration</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>I’tikāf Committee Dashboard</span>
            </h1>
            <p className="text-xs text-stone-600 mt-0.5">
              Annual program records, veteran participant profiles, Dār balancing, and Musalla floor spaces.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            {/* Mosque Selector Dropdown (LGA by LGA) */}
            <div className="flex items-center gap-1.5 bg-white border-2 border-emerald-700 rounded-xl px-2.5 py-1.5 shadow-sm max-w-full flex-1 sm:flex-initial">
              <Building2 className="w-4 h-4 text-emerald-800 flex-shrink-0" />
              <span className="text-[11px] font-bold text-stone-700 uppercase flex-shrink-0">Mosque:</span>
              <select
                value={selectedMasjidFilter}
                onChange={(e) => setSelectedMasjidFilter(e.target.value)}
                className="text-xs font-bold text-emerald-950 bg-transparent focus:outline-none cursor-pointer w-full max-w-[180px] sm:max-w-[200px] truncate"
              >
                <option value="all">All Kaduna Mosques</option>
                {Array.from(new Set(masaajid.map(m => m.lga))).map((lga) => (
                  <optgroup key={lga} label={`── ${lga} LGA ──`}>
                    {masaajid.filter(m => m.lga === lga).map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.area})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Multi-Year Archives Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border-2 border-emerald-700 rounded-xl px-2.5 py-1.5 shadow-sm flex-shrink-0">
              <Calendar className="w-4 h-4 text-emerald-800 flex-shrink-0" />
              <span className="text-[11px] font-bold text-stone-700 uppercase flex-shrink-0">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs font-bold text-emerald-950 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="1447">1447 AH [Active]</option>
                <option value="1446">1446 AH [Archived]</option>
                <option value="all">All Records</option>
              </select>
            </div>

            <Link
              href="/admin/daars"
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-900 hover:bg-emerald-950 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all border border-emerald-700 flex-1 sm:flex-initial"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>4 Dārs</span>
            </Link>

            <Link
              href="/pass"
              className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-stone-100 text-stone-800 px-3 py-2 rounded-xl text-xs font-semibold border border-stone-300 shadow-sm transition-colors flex-1 sm:flex-initial"
            >
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>Gate</span>
            </Link>
          </div>
        </div>

        {/* ================= SUMMARY ANALYTICS CARDS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider block">
              {selectedYear === 'all' ? 'All Records' : `${selectedYear} AH Applicants`}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-stone-900">{totalApplicants}</span>
            </div>
            <span className="text-[10px] text-stone-400">Registered in cycle</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/30">
            <span className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider block">
              Approved
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-900">{approvedCount}</span>
            </div>
            <span className="text-[10px] text-emerald-700">Space allocated</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-amber-50/30">
            <span className="text-[11px] uppercase font-bold text-amber-800 tracking-wider block">
              Returning Veterans
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-900">{returningCount}</span>
            </div>
            <span className="text-[10px] text-amber-700">Attended past years</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/30">
            <span className="text-[11px] uppercase font-bold text-blue-800 tracking-wider block">
              Gate Checked-In
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-blue-900">{checkedInCount}</span>
            </div>
            <span className="text-[10px] text-blue-700">Present in Musalla</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider block">
              Pending Review
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-stone-800">{pendingCount}</span>
            </div>
            <span className="text-[10px] text-stone-400">Screening queue</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[11px] uppercase font-bold text-stone-500 tracking-wider block">
              Remaining Spots
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-stone-900">{remainingCapacity}</span>
            </div>
            <span className="text-[10px] text-stone-400">Out of {totalCapacity} cap</span>
          </div>

        </div>

        {/* MOSQUE FINANCIAL OVERVIEW & REVENUE DISBURSAL CARD */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 text-white rounded-2xl p-5 shadow-lg border border-amber-400/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800 pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Mosque Treasury & Gateway Disbursals
                </span>
                <span className="text-xs text-emerald-300 font-semibold">
                  • {currentFilteredMasjid?.name || 'All Mosques Overview'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Revenue & Gateway Settlement Overview</span>
              </h3>
            </div>

            {currentFilteredMasjid?.paymentConfig && (
              <div className="text-xs font-mono bg-stone-900/90 border border-stone-700 px-3 py-1.5 rounded-xl text-stone-300">
                <span className="text-stone-400">Receiving Bank: </span>
                <strong className="text-white">{currentFilteredMasjid.paymentConfig.bankName}</strong> ({currentFilteredMasjid.paymentConfig.accountNumber})
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[11px] font-bold uppercase">Total Gross Collections</span>
              <div className="text-xl font-black text-white mt-1 font-mono">
                ₦{totalMosqueGrossNgn.toLocaleString()}
              </div>
              <span className="text-[10px] text-stone-400 font-medium">
                {paidApplicants.length} Paid Mutakifin
              </span>
            </div>

            <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/30">
              <span className="text-amber-300 block text-[11px] font-bold uppercase">Platform Fee ({mosquePlatformCutPct}%)</span>
              <div className="text-xl font-black text-amber-300 mt-1 font-mono">
                -₦{totalMosquePlatformFeeNgn.toLocaleString()}
              </div>
              <span className="text-[10px] text-amber-200/80 font-medium">
                Retained by GetoCore Tech
              </span>
            </div>

            <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-500/40">
              <span className="text-emerald-300 block text-[11px] font-bold uppercase">Net Mosque Disbursal</span>
              <div className="text-xl font-black text-emerald-300 mt-1 font-mono">
                ₦{totalMosqueNetDisbursedNgn.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">
                Direct to Mosque Account
              </span>
            </div>

            <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[11px] font-bold uppercase">Payment Status</span>
              <div className="text-xl font-black text-white mt-1 font-mono">
                {paidApplicants.length} <span className="text-xs font-normal text-stone-400">/ {applicantsByMasjid.length}</span>
              </div>
              <span className="text-[10px] text-stone-400 font-medium">
                {applicantsByMasjid.filter(p => p.payment?.status === 'pending_payment').length} Pending payment
              </span>
            </div>
          </div>
        </div>

        {/* DĀRS BREAKDOWN PILLS */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>Dār Headcounts ({selectedYear} AH)</span>
            </span>
            <Link href="/admin/daars" className="text-xs text-emerald-700 hover:underline font-semibold">
              Manage Dārs & Ameers →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {dars.map((dar) => {
              const count = yearFilteredParticipants.filter(p => p.darId === dar.id && p.status === 'approved').length;
              const checkedIn = yearFilteredParticipants.filter(p => p.darId === dar.id && p.attendance.checkedIn).length;

              return (
                <div 
                  key={dar.id} 
                  className="p-3 rounded-lg border border-stone-200 bg-stone-50/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-stone-900">{dar.nameEn}</span>
                      <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-stone-200 text-emerald-950 font-mono">
                        {count} mutakifin
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 font-medium mt-1">
                      Ameer: {dar.ameerName}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-stone-200/60 text-[10px] text-stone-500 flex justify-between">
                    <span>Gate In: {checkedIn}</span>
                    <span>Target: {dar.capacityTarget}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= FILTER & SEARCH TOOLBAR ================= */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by participant name, code (ITK-...), phone, space, or ID..."
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="w-full md:w-48">
              <select
                value={darFilter}
                onChange={(e) => setDarFilter(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">All 4 Dārs</option>
                <option value="abubakar">Dār Abubakar</option>
                <option value="umar">Dār Umar</option>
                <option value="usman">Dār Usman</option>
                <option value="aliyu">Dār Aliyu</option>
                <option value="unassigned">Unassigned Dār</option>
              </select>
            </div>

            <div className="w-full md:w-36">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">All Wings</option>
                <option value="male">Brothers</option>
                <option value="female">Sisters</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-stone-100">
            {[
              { id: 'all', label: `All (${yearFilteredParticipants.length})` },
              { id: 'pending', label: `Pending Review (${pendingCount})` },
              { id: 'approved', label: `Approved (${approvedCount})` },
              { id: 'checked_in', label: `Checked-In Gate (${checkedInCount})` },
              { id: 'waitlisted', label: `Waitlisted (${waitlistedCount})` },
              { id: 'rejected', label: `Declined (${yearFilteredParticipants.filter(p => p.status === 'rejected').length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* ================= PARTICIPANTS TABLE ================= */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Participant</th>
                  <th className="px-4 py-3">Year & Code</th>
                  <th className="px-4 py-3">Assigned Dār</th>
                  <th className="px-4 py-3">Musalla Floor Space</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Gate In</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-stone-500">
                      No participants match the selected year and filters.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => {
                    const darObj = getDarObj(p.darId);
                    return (
                      <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                        
                        {/* Name & Photo */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-11 rounded border border-stone-300 bg-stone-100 overflow-hidden flex-shrink-0">
                              {p.passportPhoto ? (
                                <img src={p.passportPhoto} alt={p.fullName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-stone-400">
                                  {p.fullName.slice(0, 2)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-stone-900">{p.fullName}</span>
                                {p.isAmeer && (
                                  <span className="bg-amber-400 text-emerald-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                                    AMEER
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-stone-500">
                                {p.age} yrs • {p.gender === 'male' ? 'Brothers' : 'Sisters'} • {p.phone}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Year & Code */}
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-stone-900 block">{p.refCode}</span>
                          <span className="text-[10px] text-stone-400 font-mono">{p.ramadanYear || '1447'} AH</span>
                        </td>

                        {/* Dār */}
                        <td className="px-4 py-3">
                          {darObj ? (
                            <div>
                              <span className="inline-block bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
                                {darObj.nameEn}
                              </span>
                              <span className="block text-[10px] text-stone-500">
                                Ameer: {darObj.ameerName.split(' ')[1] || darObj.ameerName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-stone-400 italic text-[11px]">Unassigned</span>
                          )}
                        </td>

                        {/* Floor Space Allocation */}
                        <td className="px-4 py-3">
                          {p.allocatedSpace ? (
                            <div>
                              <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {p.allocatedSpace.spaceTag}
                              </span>
                              <span className="block text-[10px] text-stone-500 mt-0.5 truncate max-w-[140px]">
                                {p.allocatedSpace.section} • Spot #{p.allocatedSpace.spaceNumber}
                              </span>
                            </div>
                          ) : (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold">
                              Pending Space
                            </span>
                          )}
                        </td>

                        {/* Returning Veteran Experience */}
                        <td className="px-4 py-3">
                          {p.isReturning ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                              <Crown className="w-3 h-3 text-amber-600" />
                              Veteran ({p.yearsAttendedCount || 2} Yrs)
                            </span>
                          ) : (
                            <span className="text-stone-400 text-[11px]">1st Year</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {p.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Approved
                            </span>
                          ) : p.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending
                            </span>
                          ) : p.status === 'waitlisted' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3 text-yellow-600" />
                              Waitlist
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded">
                              <XCircle className="w-3 h-3 text-red-600" />
                              Declined
                            </span>
                          )}
                        </td>

                        {/* Gate Attendance */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleQuickCheckIn(p)}
                            disabled={p.status !== 'approved'}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                              p.attendance.checkedIn
                                ? 'bg-emerald-800 text-white hover:bg-red-700'
                                : p.status === 'approved'
                                ? 'bg-stone-200 text-stone-700 hover:bg-amber-400 hover:text-emerald-950'
                                : 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400'
                            }`}
                            title={p.attendance.checkedIn ? 'Click to checkout' : 'Click to check in'}
                          >
                            {p.attendance.checkedIn ? 'In Gate' : 'Out'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => openReviewModal(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 transition-colors border border-stone-300"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                            <span>Review</span>
                          </button>

                          <Link
                            href={`/pass?ref=${p.refCode}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors border border-emerald-300"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Pass</span>
                          </Link>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= PARTICIPANT REVIEW & SPACE ALLOCATION MODAL ================= */}
        {isModalOpen && selectedParticipant && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-fade-in">
              
              {/* Modal Header */}
              <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b-2 border-amber-400">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                      {selectedParticipant.ramadanYear || '1447'} AH Committee Review & Space
                    </span>
                    {selectedParticipant.isReturning && (
                      <span className="bg-amber-400 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        ★ Returning Veteran
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {selectedParticipant.fullName}
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
                
                {/* Dossier Header: Photo & Bio */}
                <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="w-20 h-24 rounded-lg border border-stone-300 bg-white overflow-hidden flex-shrink-0 shadow-sm">
                    {selectedParticipant.passportPhoto ? (
                      <img
                        src={selectedParticipant.passportPhoto}
                        alt="Passport"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        No Photo
                      </div>
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-stone-500 font-medium block">Tracking Code:</span>
                      <span className="font-mono font-bold text-stone-900">{selectedParticipant.refCode}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 font-medium block">Phone / WhatsApp:</span>
                      <span className="font-semibold text-stone-900">{selectedParticipant.phone}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 font-medium block">National ID / Document:</span>
                      <span className="font-mono font-bold text-stone-800">{selectedParticipant.idVerification.idNumber}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 font-medium block">Age & Wing:</span>
                      <span className="font-semibold text-stone-900">
                        {selectedParticipant.age} yrs • {selectedParticipant.gender === 'male' ? 'Brothers' : 'Sisters'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PREVIOUS YEARS HISTORICAL PARTICIPATION TRACK RECORD */}
                {selectedParticipant.pastRecords && selectedParticipant.pastRecords.length > 0 && (
                  <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50/50 space-y-2">
                    <span className="font-bold text-amber-950 uppercase text-[10px] flex items-center gap-1.5">
                      <History className="w-4 h-4 text-amber-700" />
                      <span>Historical I’tikāf Participation Record (سجل المشاركات السابقة)</span>
                    </span>
                    <div className="space-y-1.5 pt-1">
                      {selectedParticipant.pastRecords.map((rec, i) => (
                        <div key={i} className="p-2 bg-white rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-stone-900">{rec.year}</span>
                            <span className="text-stone-500 ml-2">Ref: {rec.refCode}</span>
                            <span className="text-emerald-800 font-semibold ml-2">• {rec.darName}</span>
                            {rec.spaceTag && <span className="text-stone-500 ml-2">({rec.spaceTag})</span>}
                          </div>
                          <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                            {rec.attended ? 'Completed' : 'Registered'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergency Contact & Medical Inspection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
                    <span className="font-bold text-stone-800 uppercase text-[10px] flex items-center gap-1 mb-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-red-500" />
                      Emergency Next of Kin
                    </span>
                    <p className="font-semibold text-stone-900">
                      {selectedParticipant.emergencyContact.name} ({selectedParticipant.emergencyContact.relationship})
                    </p>
                    <p className="font-mono text-stone-600 mt-0.5">{selectedParticipant.emergencyContact.phone}</p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
                    <span className="font-bold text-stone-800 uppercase text-[10px] flex items-center gap-1 mb-1">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
                      Medical Profile
                    </span>
                    <p className="font-semibold text-stone-900">
                      {selectedParticipant.healthMedical.hasChronicCondition
                        ? selectedParticipant.healthMedical.conditions.join(', ')
                        : 'No chronic conditions declared'}
                    </p>
                    {selectedParticipant.healthMedical.currentMedications && (
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Meds: {selectedParticipant.healthMedical.currentMedications}
                      </p>
                    )}
                    {selectedParticipant.healthMedical.mobilityAssistanceNeeded && (
                      <p className="text-[10px] text-blue-700 font-bold mt-1">
                        ♿ Mobility Request: Ground floor space near washroom
                      </p>
                    )}
                  </div>
                </div>

                {/* DĀR GROUP SELECTION */}
                <div className="p-4 rounded-xl border-2 border-emerald-100 bg-emerald-50/40 space-y-2">
                  <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span>Assign to Dār Group (توزيع على الدور الأربعة)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {dars.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setModalDarId(d.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          modalDarId === d.id
                            ? 'bg-emerald-900 text-white border-emerald-950 shadow-sm font-bold ring-2 ring-emerald-500'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        <span className="block text-xs">{d.nameEn}</span>
                        <span className="block text-[10px] opacity-75 mt-0.5">Ameer: {d.ameerName.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* FLOOR SPACE ALLOCATION (NO BEDS - FLOOR SPOTS ONLY) */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 uppercase text-xs flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-emerald-700" />
                      <span>Musalla Floor Space Allocation (تخصيص المساحة)</span>
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded font-mono">
                      No Beds Policy
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">Hall / Musalla</label>
                      <select
                        value={modalHall}
                        onChange={(e) => setModalHall(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                      >
                        <option value="Hall of Omar (Brothers Ground Musalla)">Hall of Omar (Brothers Ground)</option>
                        <option value="Hall of Aisha (Sisters Upper Mezzanine)">Hall of Aisha (Sisters Mezzanine)</option>
                        <option value="Courtyard Marquee (Annex)">Courtyard Marquee (Annex)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">Section</label>
                      <select
                        value={modalSection}
                        onChange={(e) => setModalSection(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                      >
                        <option value="Section A (Qibla Forward)">Section A (Qibla Forward)</option>
                        <option value="Section B (Central Aisle)">Section B (Central Aisle)</option>
                        <option value="Section C (West Wing)">Section C (West Wing)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">Row & Spot #</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={modalRow}
                          onChange={(e) => setModalRow(Number(e.target.value))}
                          placeholder="Row"
                          className="w-1/2 text-xs p-2 rounded-lg border border-stone-300 bg-white text-center font-mono"
                          title="Row number"
                        />
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={modalSpotNumber}
                          onChange={(e) => setModalSpotNumber(Number(e.target.value))}
                          placeholder="Spot"
                          className="w-1/2 text-xs p-2 rounded-lg border border-stone-300 bg-white text-center font-mono font-bold"
                          title="Spot number"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ADMISSION STATUS MODIFICATION */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-2">
                    Modify Admission Status:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'approved', label: 'Approve', color: 'emerald' },
                      { id: 'pending', label: 'Pending Review', color: 'amber' },
                      { id: 'waitlisted', label: 'Waitlist', color: 'yellow' },
                      { id: 'rejected', label: 'Decline', color: 'red' },
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setModalStatus(st.id as ApplicationStatus)}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                          modalStatus === st.id
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Committee Screening Notes / Remarks:
                    </label>
                    <input
                      type="text"
                      value={modalStatusNotes}
                      onChange={(e) => setModalStatusNotes(e.target.value)}
                      placeholder="e.g. Vetted & approved. Veteran participant."
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveParticipantReview}
                  className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Apply Allocation</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* QUICK CHECK-IN LANYARD MODAL */}
        {checkInParticipantId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-stone-300 space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-700" />
                <span>Assign Physical Gate Lanyard Tag</span>
              </h3>
              <p className="text-xs text-stone-600">
                Confirm entry for Night 21 and enter the physical tag number handed to the mutakif.
              </p>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. TAG-M-08"
                className="w-full text-sm font-mono font-bold p-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCheckInParticipantId(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmQuickCheckIn}
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-800 text-white rounded-lg hover:bg-emerald-900"
                >
                  Confirm Check-In
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-xs text-emerald-800 font-semibold animate-pulse">Loading committee dashboard...</div>
      </div>
    }>
      <DashboardContent />
    </React.Suspense>
  );
}

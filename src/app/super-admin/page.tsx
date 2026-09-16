'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Plus, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Moon, 
  Crown, 
  Phone, 
  Mail, 
  X, 
  Filter, 
  ArrowUpRight, 
  Layers, 
  Sparkles,
  Barcode,
  Check,
  Building,
  CreditCard,
  Wallet,
  Coins,
  Percent,
  TrendingUp,
  Copy,
  UserCheck,
  Shield,
  Key,
  Trash2,
  UserCog,
  UserX,
  UserPlus,
  Save
} from 'lucide-react';
import { 
  Masjid, 
  NigerianState,
  KadunaLGA, 
  MasjidSubscription, 
  PaymentGatewayProvider, 
  PaymentTiming,
  MasjidAdmin,
  MasjidAdminRole
} from '../../types/itikaaf';
import { 
  getStoredMasaajid, 
  saveMasaajid, 
  addMasjid, 
  updateMasjidSubscription,
  updateMasjidPaymentConfig,
  setActiveMasjidId,
  getStoredParticipants,
  assignMasjidAdmin,
  removeMasjidAdmin,
  updateMasjidAdminStatus,
  getMasjidAdmins
} from '../../lib/storage';
import { INITIAL_MASAAJID, ALL_NIGERIAN_STATES, NIGERIAN_STATE_LGAS } from '../../data/initialData';

const ADMIN_ROLE_LABELS: Record<MasjidAdminRole, { label: string; labelAr: string; color: string }> = {
  lead_admin: { label: 'Lead Mosque Admin', labelAr: 'مشرف عام', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  screening_officer: { label: 'Screening Officer', labelAr: 'مسؤول التدقيق الصحي', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  logistics_officer: { label: 'Logistics / Dār Ameer', labelAr: 'مسؤول التسكين والإعاشة', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  finance_officer: { label: 'Financial Auditor', labelAr: 'المسؤول المالي', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  security_officer: { label: 'Gate & Headcount Monitor', labelAr: 'مسؤول الأمن والبوابة', color: 'bg-rose-100 text-rose-900 border-rose-300' },
};

const NIGERIAN_BANKS = [
  'Jaiz Bank',
  'Taj Bank',
  'Lotus Bank',
  'Stanbic IBTC Bank',
  'First Bank of Nigeria',
  'Zenith Bank',
  'Guaranty Trust Bank (GTBank)',
  'United Bank for Africa (UBA)',
  'Access Bank',
  'Fidelity Bank',
  'FCMB',
  'Polaris Bank',
  'Union Bank',
  'Wema Bank',
  'Sterling Bank',
];

export default function SuperAdminPage() {
  const router = useRouter();
  const [masaajid, setMasaajid] = useState<Masjid[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');
  const [selectedLgaFilter, setSelectedLgaFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'expired'>('all');
  
  // Mosque Admin Management Modal State
  const [selectedMasjidForAdmins, setSelectedMasjidForAdmins] = useState<Masjid | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminAssignForm, setAdminAssignForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'screening_officer' as MasjidAdminRole,
    accessPin: '',
    notes: '',
  });
  const [adminFormMsg, setAdminFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Masjid Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMasjidForm, setNewMasjidForm] = useState({
    name: '',
    nameAr: '',
    state: 'FCT - Abuja' as NigerianState,
    lga: 'Abuja Municipal (AMAC)',
    area: '',
    address: '',
    codePrefix: '',
    chairmanName: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    totalFloorCapacity: 200,
    planTier: 'standard' as 'standard' | 'premium' | 'unlimited',
    // Mosque Payment Gateway & Banking Config
    paymentTiming: 'pay_after_screening' as PaymentTiming,
    gatewayProvider: 'bank_transfer' as PaymentGatewayProvider,
    bankName: 'Jaiz Bank',
    accountNumber: '',
    accountName: '',
    registrationFeeNgn: 0,
    instructions: '',
    platformFeePercentage: 10, // Default 10% platform share for GetoCore Digital Innovation
    // Initial Mosque Admin Assignment
    initialAdminName: '',
    initialAdminPhone: '',
    initialAdminEmail: '',
    initialAdminRole: 'lead_admin' as MasjidAdminRole,
    initialAdminPin: '',
  });
  const [formError, setFormError] = useState('');

  // Mosque Commission Rate Management Modal State
  const [selectedMasjidForCommission, setSelectedMasjidForCommission] = useState<Masjid | null>(null);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionRateEdit, setCommissionRateEdit] = useState<number>(10);
  const [commissionUpdateMsg, setCommissionUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSettlementAcc, setCopiedSettlementAcc] = useState(false);

  const loadData = () => {
    setMasaajid(getStoredMasaajid());
    setParticipants(getStoredParticipants());
  };

  useEffect(() => {
    loadData();
    const handleDataChange = () => loadData();
    window.addEventListener('itikaaf_masaajid_changed', handleDataChange);
    window.addEventListener('itikaaf_data_changed', handleDataChange);
    return () => {
      window.removeEventListener('itikaaf_masaajid_changed', handleDataChange);
      window.removeEventListener('itikaaf_data_changed', handleDataChange);
    };
  }, []);

  // Filtered Masaajid
  const filteredMasaajid = masaajid.filter((m) => {
    // LGA filter
    if (selectedLgaFilter !== 'all' && m.lga !== selectedLgaFilter) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'all' && m.subscription.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchArea = m.area.toLowerCase().includes(q);
      const matchLga = m.lga.toLowerCase().includes(q);
      const matchChairman = m.chairmanName.toLowerCase().includes(q);
      const matchCode = m.codePrefix.toLowerCase().includes(q);
      if (!matchName && !matchArea && !matchLga && !matchChairman && !matchCode) {
        return false;
      }
    }
    return true;
  });



  const handleAccessMasjid = (masjid: Masjid) => {
    setActiveMasjidId(masjid.id);
    router.push(`/masjid/${masjid.slug}/admin/dashboard`);
  };

  const handleToggleSubscription = (masjidId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'trial' : currentStatus === 'trial' ? 'expired' : 'active';
    updateMasjidSubscription(masjidId, { status: nextStatus as any });
  };

  const handleCreateMasjidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newMasjidForm.name.trim() || !newMasjidForm.area.trim() || !newMasjidForm.codePrefix.trim()) {
      setFormError('Please fill in the Mosque Name, Area, and Code Prefix.');
      return;
    }

    const cleanSlug = newMasjidForm.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const cleanCode = newMasjidForm.codePrefix.toUpperCase().slice(0, 4);

    const exists = masaajid.some((m) => m.slug === cleanSlug || m.codePrefix === cleanCode);
    if (exists) {
      setFormError(`A Mosque with slug "${cleanSlug}" or code "${cleanCode}" already exists.`);
      return;
    }

    // Provision initial administrator if name is provided
    const initialAdmins: MasjidAdmin[] = [];
    if (newMasjidForm.initialAdminName.trim()) {
      initialAdmins.push({
        id: `adm-${cleanCode.toLowerCase()}-01`,
        masjidId: cleanSlug,
        fullName: newMasjidForm.initialAdminName.trim(),
        email: newMasjidForm.initialAdminEmail.trim() || `${cleanSlug}.admin@kaduna.ng`,
        phone: newMasjidForm.initialAdminPhone.trim() || newMasjidForm.contactPhone.trim(),
        role: newMasjidForm.initialAdminRole,
        accessPin: newMasjidForm.initialAdminPin.trim() || Math.floor(1000 + Math.random() * 9000).toString(),
        status: 'active',
        assignedAt: new Date().toISOString(),
        notes: 'Initial administrator assigned during mosque subscription',
      });
    }

    const newMasjid: Masjid = {
      id: cleanSlug,
      slug: cleanSlug,
      name: newMasjidForm.name.trim(),
      nameAr: newMasjidForm.nameAr.trim() || newMasjidForm.name.trim(),
      state: newMasjidForm.state,
      lga: newMasjidForm.lga,
      area: newMasjidForm.area.trim(),
      address: newMasjidForm.address.trim() || `${newMasjidForm.area}, ${newMasjidForm.lga} LGA, ${newMasjidForm.state} State`,
      codePrefix: cleanCode,
      chairmanName: newMasjidForm.chairmanName.trim() || 'Mosque Committee Chairman',
      contactPerson: newMasjidForm.contactPerson.trim() || newMasjidForm.chairmanName.trim(),
      contactPhone: newMasjidForm.contactPhone.trim() || '+234 800 000 0000',
      contactEmail: newMasjidForm.contactEmail.trim() || `${cleanSlug}.itikaaf@national.ng`,
      totalFloorCapacity: Number(newMasjidForm.totalFloorCapacity) || 100,
      subscription: {
        status: 'active',
        planTier: newMasjidForm.planTier,
        validUntilYear: '1447',
        annualFeePaid: true,
        subscribedAt: new Date().toISOString(),
      },
      paymentConfig: {
        bankName: newMasjidForm.bankName.trim() || 'Jaiz Bank',
        accountNumber: newMasjidForm.accountNumber.trim(),
        accountName: newMasjidForm.accountName.trim() || newMasjidForm.name.trim(),
        gatewayProvider: newMasjidForm.gatewayProvider,
        paymentTiming: newMasjidForm.paymentTiming,
        registrationFeeNgn: Number(newMasjidForm.registrationFeeNgn) || 0,
        currency: 'NGN',
        instructions: newMasjidForm.instructions.trim() || `Official payment to ${newMasjidForm.name.trim()} account.`,
        platformFeePercentage: Number(newMasjidForm.platformFeePercentage) || 10,
        platformSettlementBank: 'Jaiz Bank',
        platformSettlementAccount: '0010998822',
        platformSettlementAccountName: 'GetoCore Digital Innovation Ltd - Platform Settlement',
      },
      admins: initialAdmins,
      createdAt: new Date().toISOString(),
      notes: `Subscribed via Nigeria National Super Admin Portal in ${newMasjidForm.state} State.`,
    };

    try {
      addMasjid(newMasjid);
      setShowAddModal(false);
      setNewMasjidForm({
        name: '',
        nameAr: '',
        state: 'FCT - Abuja',
        lga: 'Abuja Municipal (AMAC)',
        area: '',
        address: '',
        codePrefix: '',
        chairmanName: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        totalFloorCapacity: 200,
        planTier: 'standard',
        paymentTiming: 'pay_after_screening',
        gatewayProvider: 'bank_transfer',
        bankName: 'Jaiz Bank',
        accountNumber: '',
        accountName: '',
        registrationFeeNgn: 0,
        instructions: '',
        platformFeePercentage: 10,
        initialAdminName: '',
        initialAdminPhone: '',
        initialAdminEmail: '',
        initialAdminRole: 'lead_admin',
        initialAdminPin: '',
      });
      alert(`✓ ${newMasjid.name} successfully registered and subscribed in ${newMasjid.state} State (${newMasjid.lga} LGA)!`);
    } catch (err: any) {
      setFormError(err.message || 'Error adding mosque.');
    }
  };

  // Mosque Commission Rate Modal Actions
  const handleOpenCommissionModal = (masjid: Masjid) => {
    setSelectedMasjidForCommission(masjid);
    setCommissionRateEdit(masjid.paymentConfig?.platformFeePercentage ?? 10);
    setCommissionUpdateMsg(null);
    setShowCommissionModal(true);
  };

  const handleSaveCommissionRate = () => {
    if (!selectedMasjidForCommission) return;
    const currentConfig = selectedMasjidForCommission.paymentConfig || {
      bankName: 'Jaiz Bank',
      accountNumber: '',
      accountName: selectedMasjidForCommission.name,
      gatewayProvider: 'bank_transfer' as const,
      paymentTiming: 'pay_after_screening' as const,
      registrationFeeNgn: 0,
      currency: 'NGN' as const,
      platformFeePercentage: 10,
    };
    const updatedConfig = {
      ...currentConfig,
      platformFeePercentage: Number(commissionRateEdit) || 10,
      platformSettlementBank: currentConfig.platformSettlementBank || 'Jaiz Bank',
      platformSettlementAccount: currentConfig.platformSettlementAccount || '0010998822',
      platformSettlementAccountName: currentConfig.platformSettlementAccountName || 'GetoCore Digital Innovation Ltd - Platform Settlement',
    };
    try {
      updateMasjidPaymentConfig(selectedMasjidForCommission.id, updatedConfig);
      setCommissionUpdateMsg({
        type: 'success',
        text: `✓ Successfully updated GetoCore platform share to ${commissionRateEdit}% for ${selectedMasjidForCommission.name}!`,
      });
      loadData();
      setTimeout(() => {
        setShowCommissionModal(false);
      }, 1500);
    } catch (err: any) {
      setCommissionUpdateMsg({
        type: 'error',
        text: err.message || 'Failed to update commission rate.',
      });
    }
  };

  const copySettlementAccount = () => {
    navigator.clipboard.writeText('0010998822');
    setCopiedSettlementAcc(true);
    setTimeout(() => setCopiedSettlementAcc(false), 2500);
  };

  // Mosque Admin Modal Actions
  const handleOpenAdminModal = (masjid: Masjid) => {
    setSelectedMasjidForAdmins(masjid);
    setAdminFormMsg(null);
    setAdminAssignForm({
      fullName: '',
      email: '',
      phone: '',
      role: 'screening_officer',
      accessPin: '',
      notes: '',
    });
    setShowAdminModal(true);
  };

  const handleAssignAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMasjidForAdmins) return;
    setAdminFormMsg(null);

    if (!adminAssignForm.fullName.trim() || !adminAssignForm.phone.trim()) {
      setAdminFormMsg({ type: 'error', text: 'Please provide administrator Full Name and Phone number.' });
      return;
    }

    try {
      const assigned = assignMasjidAdmin(selectedMasjidForAdmins.id, {
        fullName: adminAssignForm.fullName.trim(),
        email: adminAssignForm.email.trim() || `${selectedMasjidForAdmins.slug}.${adminAssignForm.role}@kaduna.ng`,
        phone: adminAssignForm.phone.trim(),
        role: adminAssignForm.role,
        accessPin: adminAssignForm.accessPin.trim() || Math.floor(1000 + Math.random() * 9000).toString(),
        status: 'active',
        notes: adminAssignForm.notes.trim() || undefined,
      });

      loadData();
      const updatedMasjid = getStoredMasaajid().find(m => m.id === selectedMasjidForAdmins.id) || null;
      setSelectedMasjidForAdmins(updatedMasjid);
      setAdminAssignForm({
        fullName: '',
        email: '',
        phone: '',
        role: 'screening_officer',
        accessPin: '',
        notes: '',
      });
      setAdminFormMsg({ 
        type: 'success', 
        text: `✓ ${assigned.fullName} has been assigned as ${ADMIN_ROLE_LABELS[assigned.role]?.label} for ${selectedMasjidForAdmins.name}!` 
      });
    } catch (err: any) {
      setAdminFormMsg({ type: 'error', text: err.message || 'Failed to assign administrator.' });
    }
  };

  const handleRemoveAdmin = (masjidId: string, adminId: string, adminName: string) => {
    if (confirm(`Remove administrator "${adminName}" from this Mosque?`)) {
      removeMasjidAdmin(masjidId, adminId);
      loadData();
      const updatedMasjid = getStoredMasaajid().find(m => m.id === masjidId) || null;
      setSelectedMasjidForAdmins(updatedMasjid);
    }
  };

  const handleToggleAdminStatus = (masjidId: string, adminId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    updateMasjidAdminStatus(masjidId, adminId, nextStatus);
    loadData();
    const updatedMasjid = getStoredMasaajid().find(m => m.id === masjidId) || null;
    setSelectedMasjidForAdmins(updatedMasjid);
  };

  // Grouping for State & LGA stats
  const stateCounts: { [state: string]: { count: number; capacity: number } } = {};
  masaajid.forEach((m) => {
    if (!stateCounts[m.state]) {
      stateCounts[m.state] = { count: 0, capacity: 0 };
    }
    stateCounts[m.state].count += 1;
    stateCounts[m.state].capacity += m.totalFloorCapacity;
  });

  const availableLgasForFilter = selectedStateFilter === 'all'
    ? Array.from(new Set(masaajid.map(m => m.lga)))
    : (NIGERIAN_STATE_LGAS[selectedStateFilter as NigerianState] || Array.from(new Set(masaajid.filter(m => m.state === selectedStateFilter).map(m => m.lga))));

  const lgaCounts: { [lga: string]: { count: number; capacity: number } } = {};
  masaajid
    .filter(m => selectedStateFilter === 'all' || m.state === selectedStateFilter)
    .forEach((m) => {
      if (!lgaCounts[m.lga]) {
        lgaCounts[m.lga] = { count: 0, capacity: 0 };
      }
      lgaCounts[m.lga].count += 1;
      lgaCounts[m.lga].capacity += m.totalFloorCapacity;
    });

  const totalFloorSpots = masaajid.reduce((sum, m) => sum + m.totalFloorCapacity, 0);
  const totalSubscribed = masaajid.length;
  const activeMasaajidCount = masaajid.filter((m) => m.subscription.status === 'active').length;
  const coveredStates = Array.from(new Set(masaajid.map((m) => m.state)));
  const coveredLgas = Array.from(new Set(masaajid.map((m) => m.lga)));
  const totalRegisteredMutakifin = participants.filter((p) => p.status === 'approved').length;
  const totalAssignedAdmins = masaajid.reduce((sum, m) => sum + (m.admins?.length || 0), 0);

  // Platform Financial & Revenue Sharing Analytics (Powered by GetoCore Digital Innovation)
  const paidParticipants = participants.filter((p) => p.payment?.status === 'paid');
  const totalGrossRevenueNgn = paidParticipants.reduce((sum, p) => sum + (p.payment?.amountNgn || 0), 0);
  const totalPlatformEarningsNgn = paidParticipants.reduce((sum, p) => {
    if (p.payment?.platformFeeNgn !== undefined) {
      return sum + p.payment.platformFeeNgn;
    }
    const pct = p.payment?.platformFeePercentage ?? 10;
    return sum + Math.round(((p.payment?.amountNgn || 0) * pct) / 100);
  }, 0);
  const totalMosqueDisbursalsNgn = totalGrossRevenueNgn - totalPlatformEarningsNgn;
  const averageCommissionRate = masaajid.length > 0
    ? (masaajid.reduce((sum, m) => sum + (m.paymentConfig?.platformFeePercentage ?? 10), 0) / masaajid.length).toFixed(1)
    : '10.0';

  return (
    <div className="min-h-screen bg-stone-100 py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP NATIONWIDE COMMAND BANNER */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-2xl p-4 sm:p-8 shadow-xl border-2 border-amber-400/40 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30 uppercase tracking-widest">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Federal Republic of Nigeria • National Council of Masaajid & I’tikāf Affairs</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-stone-950/80 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/30 shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Powered by <strong className="text-white">GetoCore Digital Innovation</strong></span>
                </div>
              </div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
                <span>Nigeria National Super Admin</span>
                <span className="text-amber-400 font-arabic text-2xl font-normal hidden sm:inline">مجلس الإشراف الوطني العام</span>
              </h1>
              <p className="text-sm sm:text-base text-emerald-200 mt-2 max-w-3xl leading-relaxed">
                Central nationwide multi-tenant oversight authority for all subscribing Masaajid across Nigeria (36 States + FCT Abuja & 774 LGAs). Monitor floor allocations (strict no-beds), assign unique Dār codes, configure mosque accounts & screening workflows, and manage mosque administrators State by State and LGA by LGA.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 px-4 py-2.5 rounded-xl font-extrabold text-sm shadow-lg transition-transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Subscribe New Masjid</span>
              </button>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-5 pointer-events-none">
            <Building2 className="w-96 h-96 text-white" />
          </div>
        </div>

        {/* NATIONWIDE KPIS (5 METRICS) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-stone-500">Subscribed Masaajid</span>
              <Building2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="text-3xl font-black text-stone-900 mt-2 font-mono">
              {totalSubscribed}
            </div>
            <p className="text-xs text-emerald-700 mt-1 font-semibold">
              {activeMasaajidCount} Active in Ramadan 1447 AH
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-stone-500">National Floor Capacity</span>
              <Layers className="w-5 h-5 text-blue-700" />
            </div>
            <div className="text-3xl font-black text-stone-900 mt-2 font-mono">
              {totalFloorSpots}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Floor spots only • <strong className="text-amber-800">Strict No Beds</strong>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-stone-500">Registered Mutakifin</span>
              <Users className="w-5 h-5 text-purple-700" />
            </div>
            <div className="text-3xl font-black text-stone-900 mt-2 font-mono">
              {totalRegisteredMutakifin}
            </div>
            <p className="text-xs text-purple-700 mt-1 font-semibold">
              Across Participating States
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-stone-500">Assigned Mosque Admins</span>
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-950 mt-2 font-mono">
              {totalAssignedAdmins}
            </div>
            <p className="text-xs text-emerald-700 mt-1 font-semibold">
              Assigned across all Masaajid
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-stone-500">Geographic Coverage</span>
              <MapPin className="w-5 h-5 text-amber-700" />
            </div>
            <div className="text-3xl font-black text-stone-900 mt-2 font-mono">
              {coveredStates.length} <span className="text-sm font-normal text-stone-400">States</span>
            </div>
            <p className="text-xs text-stone-500 mt-1 truncate">
              {coveredLgas.length} LGAs across Nigeria
            </p>
          </div>
        </div>

        {/* NATIONAL FINANCIAL & COMMISSION CENTER (GETOCORE REVENUE SHARE) */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border-2 border-amber-400/40 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-amber-400 text-stone-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Monetization & Commission Engine</span>
                </span>
                <span className="text-xs text-amber-300/80 font-medium">
                  • Powered by <strong className="text-white">GetoCore Digital Innovation</strong>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>National Gateway Revenue-Sharing & Financial Center</span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl mt-1">
                Automated platform commission splits on every participant registration and form purchase conducted through direct bank transfer and online payment gateways nationwide.
              </p>
            </div>

            {/* Platform Settlement Bank Account Card */}
            <div className="bg-stone-900/90 border border-amber-400/40 rounded-xl p-3.5 flex-shrink-0 text-xs space-y-1.5 shadow-md">
              <div className="flex items-center justify-between gap-3 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                <span>GetoCore Platform Settlement</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">AUTOMATED SPLIT</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-stone-400">Designated Bank:</span>
                <span className="font-bold text-white">Jaiz Bank PLC</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-stone-400">Settlement NUBAN:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-amber-300 text-sm">0010998822</span>
                  <button
                    onClick={copySettlementAccount}
                    className="p-1 hover:bg-stone-800 text-amber-300 rounded transition-colors"
                    title="Copy GetoCore Settlement NUBAN"
                  >
                    {copiedSettlementAcc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-stone-400 truncate max-w-[250px]">
                Beneficiary: GetoCore Digital Innovation Ltd
              </div>
            </div>
          </div>

          {/* FINANCIAL STAT CARDS (4 COLUMNS) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase">
                <span>Gross Volume Processed</span>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">
                ₦{totalGrossRevenueNgn.toLocaleString()}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                From <strong className="text-white">{paidParticipants.length}</strong> paid Mutakifin nationwide
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-950/50 to-stone-900 border-2 border-amber-400/60 rounded-xl p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-amber-300 text-xs font-bold uppercase">
                <span>GetoCore Revenue (Our Share)</span>
                <Percent className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1.5 font-mono">
                ₦{totalPlatformEarningsNgn.toLocaleString()}
              </div>
              <p className="text-[11px] text-amber-200/80 mt-1 font-medium">
                Retained platform technology fee
              </p>
            </div>

            <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase">
                <span>Net Mosque Disbursals</span>
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">
                ₦{totalMosqueDisbursalsNgn.toLocaleString()}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Net funds to mosque accounts
              </p>
            </div>

            <div className="bg-stone-900/70 border border-stone-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase">
                <span>Average Platform Cut</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">
                {averageCommissionRate}%
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Configurable per Masjid (5% - 15%)
              </p>
            </div>
          </div>
        </div>

        {/* 2-TIER STATE & LGA DIRECTORY EXPLORER */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-800" />
                <span>National Masaajid Directory (State by State & LGA by LGA)</span>
              </h2>
              <p className="text-xs text-stone-500">
                Filter subscribing mosques across the 36 Nigerian States + FCT Abuja and respective Local Government Areas
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mosque, state, LGA, area, code..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              />
            </div>
          </div>

          {/* TIER 1: STATE SELECTION TABS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Select Nigerian State:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-stone-400">Full State List:</span>
                <select
                  value={selectedStateFilter}
                  onChange={(e) => {
                    setSelectedStateFilter(e.target.value);
                    setSelectedLgaFilter('all');
                  }}
                  className="text-xs font-bold py-1 px-2 rounded-lg border border-stone-300 bg-white text-emerald-950 focus:outline-none"
                >
                  <option value="all">All Nigeria (36 States + FCT)</option>
                  {ALL_NIGERIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => {
                  setSelectedStateFilter('all');
                  setSelectedLgaFilter('all');
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex-shrink-0 flex items-center gap-1.5 ${
                  selectedStateFilter === 'all'
                    ? 'bg-emerald-950 text-amber-300 shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>All Nigeria</span>
                <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                  {masaajid.length}
                </span>
              </button>

              {ALL_NIGERIAN_STATES.filter((st) => stateCounts[st]).map((st) => {
                const count = stateCounts[st]?.count || 0;
                const isSelected = selectedStateFilter === st;
                return (
                  <button
                    key={st}
                    onClick={() => {
                      setSelectedStateFilter(st);
                      setSelectedLgaFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex-shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-600/50'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <MapPin className={`w-3 h-3 ${isSelected ? 'text-amber-300' : 'text-stone-400'}`} />
                    <span>{st}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-amber-400 text-emerald-950 font-bold' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TIER 2: LGA SUB-FILTER PILLS */}
          <div className="pt-2 border-t border-stone-100 space-y-1.5">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Filter by LGA {selectedStateFilter !== 'all' ? `in ${selectedStateFilter}` : 'across Nigeria'}:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedLgaFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                  selectedLgaFilter === 'all'
                    ? 'bg-emerald-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All LGAs ({selectedStateFilter === 'all' ? masaajid.length : (stateCounts[selectedStateFilter]?.count || 0)})
              </button>

              {availableLgasForFilter.filter(lga => lgaCounts[lga]).map((lga) => {
                const count = lgaCounts[lga]?.count || 0;
                const isSelected = selectedLgaFilter === lga;
                return (
                  <button
                    key={lga}
                    onClick={() => setSelectedLgaFilter(lga)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span>{lga}</span>
                    <span className={`text-[10px] px-1 py-0.1 rounded-full ${
                      isSelected ? 'bg-amber-300 text-emerald-950 font-bold' : 'bg-stone-200 text-stone-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MASAAJID LISTINGS (STATE & LGA) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
              {selectedStateFilter === 'all' && selectedLgaFilter === 'all' 
                ? 'All Subscribing Masaajid across Nigeria' 
                : selectedStateFilter !== 'all' && selectedLgaFilter === 'all'
                ? `Masaajid in ${selectedStateFilter} State`
                : `Masaajid in ${selectedLgaFilter} LGA (${selectedStateFilter})`} ({filteredMasaajid.length})
            </h3>
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-white border border-stone-300 rounded px-2 py-1 text-xs text-stone-800 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="trial">Trial</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMasaajid.map((masjid) => {
              const masjidParticipants = participants.filter((p) => p.masjidId === masjid.id);
              const approvedCount = masjidParticipants.filter((p) => p.status === 'approved').length;
              const occupancyPct = Math.round((approvedCount / masjid.totalFloorCapacity) * 100);
              const masjidPaidParticipants = masjidParticipants.filter((p) => p.payment?.status === 'paid');
              const masjidGrossNgn = masjidPaidParticipants.reduce((sum, p) => sum + (p.payment?.amountNgn || 0), 0);
              const masjidPlatformCutPct = masjid.paymentConfig?.platformFeePercentage ?? 10;
              const masjidPlatformEarningsNgn = masjidPaidParticipants.reduce((sum, p) => {
                if (p.payment?.platformFeeNgn !== undefined) return sum + p.payment.platformFeeNgn;
                return sum + Math.round(((p.payment?.amountNgn || 0) * masjidPlatformCutPct) / 100);
              }, 0);
              const masjidNetPayoutNgn = masjidGrossNgn - masjidPlatformEarningsNgn;

              return (
                <div
                  key={masjid.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border-2 border-stone-200 hover:border-emerald-700 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: State, LGA & Status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-950 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border border-emerald-300">
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        {masjid.state} • {masjid.lga} LGA • {masjid.area}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        masjid.subscription.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : masjid.subscription.status === 'trial'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {masjid.subscription.status}
                      </span>
                    </div>

                    {/* Mosque Name */}
                    <div className="mt-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-extrabold text-stone-900 group-hover:text-emerald-900 transition-colors">
                          {masjid.name}
                        </h4>
                        <span className="text-xs font-mono font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          {masjid.codePrefix}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 font-arabic mt-0.5">{masjid.nameAr}</p>
                    </div>

                    {/* Committee & Contact */}
                    <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Chairman:</span>
                        <span className="font-semibold text-stone-900">{masjid.chairmanName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Phone:</span>
                        <span className="font-mono text-stone-800">{masjid.contactPhone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Address:</span>
                        <span className="text-[11px] text-stone-700 truncate max-w-[200px]" title={masjid.address}>
                          {masjid.address}
                        </span>
                      </div>
                    </div>

                    {/* Floor Capacity Meter */}
                    <div className="mt-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-stone-600">Floor Space (No Beds):</span>
                        <span className="font-mono font-bold text-emerald-900">
                          {approvedCount} / {masjid.totalFloorCapacity} spots ({occupancyPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, occupancyPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Mosque Bank Account & Payment Config Badge */}
                    <div className="mt-3 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                          <span>{masjid.paymentConfig?.bankName || 'Bank Transfer'}</span>
                        </span>
                        <span className="font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                          {masjid.paymentConfig?.registrationFeeNgn ? `₦${masjid.paymentConfig.registrationFeeNgn.toLocaleString()}` : 'Free / Waqf'}
                        </span>
                      </div>
                      {masjid.paymentConfig?.accountNumber && (
                        <div className="flex items-center justify-between mt-1 text-[10px] text-stone-600 font-mono">
                          <span>{masjid.paymentConfig.accountNumber}</span>
                          <span className="font-sans font-semibold text-amber-900">
                            {masjid.paymentConfig.paymentTiming === 'pay_after_screening' ? '🛡️ Screening First' : masjid.paymentConfig.paymentTiming === 'pay_with_registration' ? '⚡ Upfront' : '🎁 Free'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* REVENUE-SHARING & PLATFORM COMMISSION SPLIT */}
                    <div className="mt-2 bg-gradient-to-r from-stone-900 to-emerald-950 text-white p-2.5 rounded-xl border border-amber-400/40 text-xs space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[11px] font-bold text-amber-300">
                            GetoCore Share: <strong className="text-white font-mono">{masjidPlatformCutPct}%</strong>
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenCommissionModal(masjid)}
                          className="bg-amber-400 hover:bg-amber-300 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded transition-transform hover:scale-105"
                          title="Configure platform commission rate for this mosque"
                        >
                          Adjust %
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-1 pt-1 border-t border-stone-800 text-[10px]">
                        <div className="bg-stone-900/80 p-1 rounded text-center">
                          <span className="text-stone-400 block text-[9px]">Gross Vol</span>
                          <span className="font-mono font-bold text-white">₦{masjidGrossNgn.toLocaleString()}</span>
                        </div>
                        <div className="bg-amber-950/40 border border-amber-500/30 p-1 rounded text-center">
                          <span className="text-amber-300 block text-[9px]">Our {masjidPlatformCutPct}%</span>
                          <span className="font-mono font-bold text-amber-300">₦{masjidPlatformEarningsNgn.toLocaleString()}</span>
                        </div>
                        <div className="bg-emerald-950/60 p-1 rounded text-center">
                          <span className="text-emerald-300 block text-[9px]">Mosque Net</span>
                          <span className="font-mono font-bold text-emerald-300">₦{masjidNetPayoutNgn.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* ASSIGNED MOSQUE ADMINISTRATORS BADGE */}
                    <div className="mt-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-stone-800 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Assigned Admins:</span>
                        </span>
                        <button
                          onClick={() => handleOpenAdminModal(masjid)}
                          className="font-bold text-[11px] text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1"
                        >
                          <UserCog className="w-3 h-3 text-emerald-700" />
                          <span>Manage ({masjid.admins?.length || 0})</span>
                        </button>
                      </div>

                      {masjid.admins && masjid.admins.length > 0 ? (
                        <div className="space-y-1">
                          {masjid.admins.slice(0, 2).map((adm) => {
                            const meta = ADMIN_ROLE_LABELS[adm.role] || { label: adm.role, color: 'bg-stone-100 text-stone-800 border-stone-200' };
                            return (
                              <div key={adm.id} className="flex items-center justify-between text-[11px] bg-white p-1 rounded border border-stone-100">
                                <span className="font-semibold text-stone-900 truncate max-w-[140px]" title={adm.fullName}>
                                  {adm.fullName}
                                </span>
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${meta.color}`}>
                                  {meta.label}
                                </span>
                              </div>
                            );
                          })}
                          {masjid.admins.length > 2 && (
                            <p className="text-[10px] text-stone-500 font-medium text-right pt-0.5">
                              +{masjid.admins.length - 2} more administrators
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[11px] text-stone-500 italic">
                          <span>No admins assigned yet</span>
                          <button
                            onClick={() => handleOpenAdminModal(masjid)}
                            className="text-emerald-800 font-bold not-italic hover:underline"
                          >
                            + Assign Admin
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => handleOpenAdminModal(masjid)}
                      className="inline-flex items-center gap-1 bg-amber-100/90 hover:bg-amber-200 text-amber-950 border border-amber-300/80 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors"
                      title="Assign and manage administrative officers for this mosque"
                    >
                      <UserCog className="w-3.5 h-3.5 text-amber-800" />
                      <span>Admins ({masjid.admins?.length || 0})</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSubscription(masjid.id, masjid.subscription.status)}
                        className="text-[11px] font-semibold text-stone-500 hover:text-stone-900 hover:underline"
                      >
                        Status: {masjid.subscription.status === 'active' ? 'Active' : 'Renew'}
                      </button>

                      <button
                        onClick={() => handleAccessMasjid(masjid)}
                        className="inline-flex items-center gap-1.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition-colors"
                      >
                        <span>Manage</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMasaajid.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
              <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-stone-700">No Masaajid found matching this criteria</h4>
              <p className="text-xs text-stone-500 mt-1">
                Try selecting a different Kaduna LGA or click "Subscribe New Masjid" to onboard one.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ONBOARD NEW MASJID MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-800" />
                <h3 className="text-lg font-bold text-stone-900">
                  Onboard & Subscribe New Mosque in Kaduna
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMasjidSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Mosque Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sultan Bello Mosque"
                    value={newMasjidForm.name}
                    onChange={(e) => setNewMasjidForm({ ...newMasjidForm, name: e.target.value })}
                    className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Mosque Name (Arabic Calligraphy)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. مسجد السلطان بيلو"
                    value={newMasjidForm.nameAr}
                    onChange={(e) => setNewMasjidForm({ ...newMasjidForm, nameAr: e.target.value })}
                    className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-right font-arabic"
                  />
                </div>
              </div>

              {/* STATE, LGA AND AREA (CASCADING NATIONWIDE SELECTOR) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                <div>
                  <label className="block font-bold text-emerald-950 mb-1">
                    Nigerian State *
                  </label>
                  <select
                    value={newMasjidForm.state}
                    onChange={(e) => {
                      const newState = e.target.value as NigerianState;
                      const stateLgas = NIGERIAN_STATE_LGAS[newState] || ['Central'];
                      setNewMasjidForm({
                        ...newMasjidForm,
                        state: newState,
                        lga: stateLgas[0] || 'Central',
                      });
                    }}
                    className="w-full p-2 rounded-lg border border-emerald-300 bg-white font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                  >
                    {ALL_NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-emerald-950 mb-1">
                    Local Government Area (LGA) *
                  </label>
                  <select
                    value={newMasjidForm.lga}
                    onChange={(e) => setNewMasjidForm({ ...newMasjidForm, lga: e.target.value })}
                    className="w-full p-2 rounded-lg border border-emerald-300 bg-white font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                  >
                    {(NIGERIAN_STATE_LGAS[newMasjidForm.state] || []).map((lga) => (
                      <option key={lga} value={lga}>{lga} LGA</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Area / District / Ward *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Business District, Unguwan Dosa, Victoria Island, Fagge"
                  value={newMasjidForm.area}
                  onChange={(e) => setNewMasjidForm({ ...newMasjidForm, area: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Unique Code Prefix (3-4 Letters) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="e.g. SBM, ASD, SJD, SGK"
                    value={newMasjidForm.codePrefix}
                    onChange={(e) => setNewMasjidForm({ ...newMasjidForm, codePrefix: e.target.value.toUpperCase() })}
                    className="w-full p-2 rounded-lg border border-stone-300 font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none uppercase"
                  />
                  <span className="text-[10px] text-stone-500">Used in ID Barcode: [CODE]-ABK-1447-0101</span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Musalla Floor Spots (Strict No Beds) *
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={1000}
                    value={newMasjidForm.totalFloorCapacity}
                    onChange={(e) => setNewMasjidForm({ ...newMasjidForm, totalFloorCapacity: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-stone-300 font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Chairman / Leader Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Muhammad Tahir"
                    value={newMasjidForm.chairmanName}
                    onChange={(e) => setNewMasjidForm({ ...newMasjidForm, chairmanName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+234 803 000 0000"
                    value={newMasjidForm.contactPhone}
                    onChange={(e) => setNewMasjidForm({ ...newMasjidForm, contactPhone: e.target.value })}
                    className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Physical Street Address
                </label>
                <input
                  type="text"
                  placeholder="Street / Landmark in Kaduna"
                  value={newMasjidForm.address}
                  onChange={(e) => setNewMasjidForm({ ...newMasjidForm, address: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* PAYMENT GATEWAY & BANK ACCOUNT CONFIGURATION */}
              <div className="bg-amber-50/70 border-2 border-amber-300/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                  <CreditCard className="w-4 h-4 text-amber-900" />
                  <span className="font-extrabold text-amber-950 text-xs uppercase tracking-wide">
                    Mosque Payment Gateway & Bank Account Provider
                  </span>
                </div>

                {/* Screening vs Payment Timing Policy */}
                <div>
                  <label className="block font-bold text-amber-950 mb-1">
                    Screening & Payment Timing Workflow *
                  </label>
                  <select
                    value={newMasjidForm.paymentTiming}
                    onChange={(e) => setNewMasjidForm({ ...newMasjidForm, paymentTiming: e.target.value as PaymentTiming })}
                    className="w-full p-2 rounded-lg border border-amber-300 bg-white font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="pay_after_screening">
                      🛡️ Screening First (Recommended) — Screen applicant first; payment unlocks ONLY upon committee approval
                    </option>
                    <option value="pay_with_registration">
                      ⚡ Pay Upfront — Collect form fee immediately upon submitting registration
                    </option>
                    <option value="free_waqf">
                      🎁 Free / Waqf Sponsored — ₦0 registration fee (Voluntary Sadaqah only)
                    </option>
                  </select>
                  <p className="text-[10px] text-amber-900 mt-1">
                    {newMasjidForm.paymentTiming === 'pay_after_screening' && '• Screening First: Applicants register for free. When the mosque committee verifies and approves them, the checkout gateway unlocks for them to pay and receive their pass.'}
                    {newMasjidForm.paymentTiming === 'pay_with_registration' && '• Pay Upfront: Applicant is directed to pay the form fee immediately after submitting the application.'}
                    {newMasjidForm.paymentTiming === 'free_waqf' && '• Free: No fee is required. The mosque runs 100% on community Waqf endowment.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Gateway Provider *
                    </label>
                    <select
                      value={newMasjidForm.gatewayProvider}
                      onChange={(e) => setNewMasjidForm({ ...newMasjidForm, gatewayProvider: e.target.value as PaymentGatewayProvider })}
                      className="w-full p-2 rounded-lg border border-stone-300 bg-white font-medium text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="bank_transfer">Direct Bank Transfer / USSD (Instant Reference)</option>
                      <option value="paystack">Paystack Gateway (Card, Transfer, USSD)</option>
                      <option value="flutterwave">Flutterwave Gateway (Card, Bank, Barter)</option>
                      <option value="free_waqf">Free / Waqf Sponsored</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Registration / Form Fee (NGN) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-stone-500 font-bold">₦</span>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        placeholder="0 for free"
                        value={newMasjidForm.registrationFeeNgn}
                        onChange={(e) => setNewMasjidForm({ ...newMasjidForm, registrationFeeNgn: Number(e.target.value) })}
                        className="w-full pl-7 pr-2 py-2 rounded-lg border border-stone-300 font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500">0 for free, or feeding/form fee (e.g. 5,000)</span>
                  </div>
                </div>

                {newMasjidForm.gatewayProvider !== 'free_waqf' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-800 mb-1">
                          Designated Bank Name *
                        </label>
                        <select
                          value={newMasjidForm.bankName}
                          onChange={(e) => setNewMasjidForm({ ...newMasjidForm, bankName: e.target.value })}
                          className="w-full p-2 rounded-lg border border-stone-300 bg-white font-medium text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        >
                          {NIGERIAN_BANKS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-800 mb-1">
                          Account Number (10-digit NUBAN) *
                        </label>
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="0001234567"
                          value={newMasjidForm.accountNumber}
                          onChange={(e) => setNewMasjidForm({ ...newMasjidForm, accountNumber: e.target.value.replace(/[^0-9]/g, '') })}
                          className="w-full p-2 rounded-lg border border-stone-300 font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Account Name / Beneficiary *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sultan Bello Mosque I’tikāf Committee"
                        value={newMasjidForm.accountName}
                        onChange={(e) => setNewMasjidForm({ ...newMasjidForm, accountName: e.target.value })}
                        className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {/* PLATFORM REVENUE-SHARING & COMMISSION AGREEMENT */}
                <div className="mt-3 pt-3 border-t border-amber-300 space-y-3 bg-amber-100/60 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="block font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-amber-800" />
                      <span>GetoCore Platform Share / Commission Rate (%) *</span>
                    </label>
                    <span className="text-[11px] font-mono font-black text-emerald-950 bg-emerald-200 px-2.5 py-0.5 rounded border border-emerald-400">
                      {newMasjidForm.platformFeePercentage}% Commission
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Select the agreed platform fee percentage that GetoCore Digital Innovation retains from each participant registration/form payment for this mosque.
                  </p>

                  {/* Preset commission rate chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {[5, 7.5, 10, 12.5, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setNewMasjidForm({ ...newMasjidForm, platformFeePercentage: pct })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                          newMasjidForm.platformFeePercentage === pct
                            ? 'bg-emerald-900 text-amber-300 border-emerald-900 shadow-sm'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {pct}% {pct === 10 ? '(Standard)' : pct === 5 ? '(Promo)' : ''}
                      </button>
                    ))}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        step={0.5}
                        placeholder="Custom %"
                        value={newMasjidForm.platformFeePercentage}
                        onChange={(e) => setNewMasjidForm({ ...newMasjidForm, platformFeePercentage: Number(e.target.value) })}
                        className="w-20 p-1 rounded-lg border border-stone-300 font-mono text-xs font-bold text-center bg-white"
                      />
                      <span className="text-xs font-bold text-stone-600">%</span>
                    </div>
                  </div>

                  {/* Live Split Calculation Box */}
                  {newMasjidForm.registrationFeeNgn > 0 && (
                    <div className="bg-white p-3 rounded-lg border border-amber-300 text-xs space-y-1.5 shadow-inner">
                      <div className="text-[11px] font-bold text-stone-800 uppercase tracking-wide">
                        Live Revenue Split for ₦{newMasjidForm.registrationFeeNgn.toLocaleString()} Form Fee:
                      </div>
                      <div className="flex items-center justify-between text-stone-800">
                        <span>Mosque Receives ({100 - newMasjidForm.platformFeePercentage}%):</span>
                        <strong className="font-mono text-emerald-900">
                          ₦{Math.round(newMasjidForm.registrationFeeNgn * (100 - newMasjidForm.platformFeePercentage) / 100).toLocaleString()}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-stone-800">
                        <span>GetoCore Platform Share ({newMasjidForm.platformFeePercentage}%):</span>
                        <strong className="font-mono text-amber-700">
                          ₦{Math.round(newMasjidForm.registrationFeeNgn * newMasjidForm.platformFeePercentage / 100).toLocaleString()}
                        </strong>
                      </div>
                      <p className="text-[10px] text-stone-500 pt-1 border-t border-stone-100 font-medium">
                        Platform cuts automatically remit to Jaiz Bank • 0010998822 (GetoCore Digital Innovation Ltd).
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: ASSIGN INITIAL MOSQUE ADMINISTRATOR */}
              <div className="bg-blue-50/70 border-2 border-blue-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-2 border-b border-blue-200 pb-2">
                  <Shield className="w-4 h-4 text-blue-900" />
                  <span className="font-extrabold text-blue-950 text-xs uppercase tracking-wide">
                    3. Assign Initial Mosque Administrator (تعيين مشرف المسجد)
                  </span>
                </div>
                <p className="text-[11px] text-blue-800">
                  Assign the primary officer who will lead applicant screening, spot assignments (strictly floor spots, no beds), and gate verification for this mosque.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Admin Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ustadh Sanusi / Mallam Bello"
                      value={newMasjidForm.initialAdminName}
                      onChange={(e) => setNewMasjidForm({ ...newMasjidForm, initialAdminName: e.target.value })}
                      className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Administrative Role
                    </label>
                    <select
                      value={newMasjidForm.initialAdminRole}
                      onChange={(e) => setNewMasjidForm({ ...newMasjidForm, initialAdminRole: e.target.value as MasjidAdminRole })}
                      className="w-full p-2 rounded-lg border border-stone-300 bg-white font-medium text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="lead_admin">Lead Mosque Administrator (مشرف عام)</option>
                      <option value="screening_officer">Screening & Medical Verification Officer (مسؤول التدقيق)</option>
                      <option value="logistics_officer">Logistics & Dār Ameer Coordinator (مسؤول التسكين)</option>
                      <option value="finance_officer">Financial Auditor (المسؤول المالي)</option>
                      <option value="security_officer">Gate Security & Headcount Monitor (مسؤول الأمن)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Admin Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={newMasjidForm.initialAdminPhone}
                      onChange={(e) => setNewMasjidForm({ ...newMasjidForm, initialAdminPhone: e.target.value })}
                      className="w-full p-2 rounded-lg border border-stone-300 font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Admin Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="admin@kaduna.ng"
                      value={newMasjidForm.initialAdminEmail}
                      onChange={(e) => setNewMasjidForm({ ...newMasjidForm, initialAdminEmail: e.target.value })}
                      className="w-full p-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Security PIN / Passcode
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="4471 (Auto-gen if empty)"
                      value={newMasjidForm.initialAdminPin}
                      onChange={(e) => setNewMasjidForm({ ...newMasjidForm, initialAdminPin: e.target.value.replace(/[^0-9]/g, '') })}
                      className="w-full p-2 rounded-lg border border-stone-300 font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-bold shadow-md"
                >
                  Confirm & Provision Mosque Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOSQUE ADMIN ASSIGNMENT & MANAGEMENT MODAL */}
      {showAdminModal && selectedMasjidForAdmins && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-emerald-800">
            {/* Modal Header */}
            <div className="sticky top-0 bg-emerald-950 text-white p-6 border-b border-emerald-800 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-mono font-extrabold bg-amber-400 text-emerald-950 px-2 py-0.5 rounded">
                    CODE: {selectedMasjidForAdmins.codePrefix}
                  </span>
                  <span className="text-xs text-emerald-200">
                    {selectedMasjidForAdmins.lga} LGA • {selectedMasjidForAdmins.area}
                  </span>
                </div>
                <h3 className="text-xl font-black flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-amber-400" />
                  <span>Mosque Administrators for {selectedMasjidForAdmins.name}</span>
                </h3>
                <p className="text-xs text-emerald-300 mt-0.5">
                  Assign & manage screening officers, logistics leads, financial auditors, and security monitors for this mosque
                </p>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {adminFormMsg && (
                <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                  adminFormMsg.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  <span>{adminFormMsg.text}</span>
                  <button onClick={() => setAdminFormMsg(null)} className="text-xs underline font-bold">Dismiss</button>
                </div>
              )}

              {/* CURRENTLY ASSIGNED ADMINS LIST */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Currently Assigned Administrative Personnel ({selectedMasjidForAdmins.admins?.length || 0})</span>
                  </h4>
                  <span className="text-xs font-mono text-stone-500">
                    Capacity: {selectedMasjidForAdmins.totalFloorCapacity} Floor Spots
                  </span>
                </div>

                {selectedMasjidForAdmins.admins && selectedMasjidForAdmins.admins.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedMasjidForAdmins.admins.map((adm) => {
                      const meta = ADMIN_ROLE_LABELS[adm.role] || { label: adm.role, labelAr: '', color: 'bg-stone-100 text-stone-800 border-stone-300' };
                      return (
                        <div
                          key={adm.id}
                          className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-stone-900 text-sm">{adm.fullName}</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${meta.color}`}>
                                {meta.label} • {meta.labelAr}
                              </span>
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                                adm.status === 'active' ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                              }`}>
                                {adm.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-stone-600 font-mono">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-stone-400" />
                                {adm.phone}
                              </span>
                              {adm.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-stone-400" />
                                  {adm.email}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded font-mono font-bold text-[10px]">
                                <Key className="w-2.5 h-2.5" /> PIN: {adm.accessPin}
                              </span>
                            </div>
                            {adm.notes && (
                              <p className="text-[11px] text-stone-500 italic">“{adm.notes}”</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleToggleAdminStatus(selectedMasjidForAdmins.id, adm.id, adm.status)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                                adm.status === 'active'
                                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                              }`}
                            >
                              {adm.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleRemoveAdmin(selectedMasjidForAdmins.id, adm.id, adm.fullName)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
                              title="Remove administrator"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 text-center">
                    <UserX className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-stone-600">No administrators currently assigned to {selectedMasjidForAdmins.name}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">Use the form below to assign the first administrative officer.</p>
                  </div>
                )}
              </div>

              {/* FORM TO ASSIGN NEW ADMIN TO THIS MOSQUE */}
              <div className="bg-emerald-50/70 p-5 rounded-2xl border-2 border-emerald-300/80 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <h4 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-800" />
                    <span>Assign New Administrative Officer</span>
                  </h4>
                  <span className="text-[11px] text-emerald-800 font-semibold">
                    Direct Mosque Access & Oversight
                  </span>
                </div>

                <form onSubmit={handleAssignAdminSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ustadh Sanusi Al-Kadnawi"
                        value={adminAssignForm.fullName}
                        onChange={(e) => setAdminAssignForm({ ...adminAssignForm, fullName: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Administrative Role & Access Level *
                      </label>
                      <select
                        value={adminAssignForm.role}
                        onChange={(e) => setAdminAssignForm({ ...adminAssignForm, role: e.target.value as MasjidAdminRole })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      >
                        <option value="lead_admin">Lead Mosque Administrator (مشرف عام) — Full portal authority</option>
                        <option value="screening_officer">Screening & Medical Officer (مسؤول التدقيق) — Health review</option>
                        <option value="logistics_officer">Logistics & Dār Ameer (مسؤول التسكين) — Floor spot allocations</option>
                        <option value="finance_officer">Financial Auditor (المسؤول المالي) — Account verification</option>
                        <option value="security_officer">Gate & Headcount Monitor (مسؤول الأمن) — Barcode scanning</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+234 803 000 0000"
                        value={adminAssignForm.phone}
                        onChange={(e) => setAdminAssignForm({ ...adminAssignForm, phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="officer@kaduna.ng"
                        value={adminAssignForm.email}
                        onChange={(e) => setAdminAssignForm({ ...adminAssignForm, email: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Security PIN / Passcode
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="4471 (Auto-generated if empty)"
                        value={adminAssignForm.accessPin}
                        onChange={(e) => setAdminAssignForm({ ...adminAssignForm, accessPin: e.target.value.replace(/[^0-9]/g, '') })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 font-mono font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Role Responsibility Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lead evaluator for elderly applicants; coordinate with Dār Abubakar"
                      value={adminAssignForm.notes}
                      onChange={(e) => setAdminAssignForm({ ...adminAssignForm, notes: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-bold shadow-md flex items-center gap-2 transition-transform hover:scale-105"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Confirm & Assign Administrator to {selectedMasjidForAdmins.name}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-100 p-4 rounded-b-3xl border-t border-stone-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-stone-500 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Role permissions synced statewide across Kaduna State network</span>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOSQUE COMMISSION RATE MANAGEMENT MODAL */}
      {showCommissionModal && selectedMasjidForCommission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-amber-400 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-stone-900 to-emerald-950 text-white p-5 border-b border-amber-400/40 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-mono font-extrabold bg-amber-400 text-stone-950 px-2 py-0.5 rounded">
                    CODE: {selectedMasjidForCommission.codePrefix}
                  </span>
                  <span className="text-xs text-amber-200 font-semibold">
                    {selectedMasjidForCommission.state} State
                  </span>
                </div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Percent className="w-5 h-5 text-amber-400" />
                  <span>Configure Platform Commission Rate</span>
                </h3>
                <p className="text-xs text-emerald-200">
                  {selectedMasjidForCommission.name}
                </p>
              </div>
              <button
                onClick={() => setShowCommissionModal(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {commissionUpdateMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  commissionUpdateMsg.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  {commissionUpdateMsg.text}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-800">
                  GetoCore Platform Fee / Commission Share (%)
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[5, 7.5, 10, 12.5, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCommissionRateEdit(pct)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        commissionRateEdit === pct
                          ? 'bg-emerald-900 text-amber-300 border-emerald-900 shadow-sm'
                          : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {pct}% {pct === 10 ? '(Standard)' : pct === 5 ? '(Promo)' : ''}
                    </button>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={0.5}
                      value={commissionRateEdit}
                      onChange={(e) => setCommissionRateEdit(Number(e.target.value))}
                      className="w-20 p-1.5 rounded-lg border border-stone-300 font-mono text-xs font-bold text-center"
                    />
                    <span className="text-xs font-bold text-stone-600">%</span>
                  </div>
                </div>
              </div>

              {/* Live revenue split simulation for this mosque */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-2">
                <div className="font-bold text-stone-800 text-[11px] uppercase tracking-wide flex items-center justify-between">
                  <span>Simulated Split per Paid Registration:</span>
                  <span className="font-mono text-emerald-900">Fee: ₦{(selectedMasjidForCommission.paymentConfig?.registrationFeeNgn || 5000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-1 text-stone-600">
                  <span>Mosque Allocation ({100 - commissionRateEdit}%):</span>
                  <strong className="font-mono text-emerald-900">
                    ₦{Math.round(((selectedMasjidForCommission.paymentConfig?.registrationFeeNgn || 5000) * (100 - commissionRateEdit)) / 100).toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GetoCore Platform Share ({commissionRateEdit}%):</span>
                  <strong className="font-mono text-amber-800">
                    ₦{Math.round(((selectedMasjidForCommission.paymentConfig?.registrationFeeNgn || 5000) * commissionRateEdit) / 100).toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Settlement Account Notification */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-950 space-y-1">
                <span className="font-bold block">🏦 Platform Settlement Routing:</span>
                <p className="font-mono text-[10px] text-stone-700">
                  Jaiz Bank PLC • 0010998822 (GetoCore Digital Innovation Ltd)
                </p>
                <p className="text-[10px] text-stone-500">
                  All gateway payments for this mosque will automatically disburse our {commissionRateEdit}% cut into this account.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCommissionModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCommissionRate}
                  className="px-5 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-amber-300 text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Commission Rate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPER ADMIN GETOCORE BRANDED FOOTER */}
      <div className="pt-6 border-t border-stone-200 text-center space-y-2 text-xs text-stone-500">
        <p className="font-semibold text-stone-700">
          Federal Republic of Nigeria National Command Center • Multi-Tenant I’tikāf Operating System
        </p>
        <div className="inline-flex items-center gap-1.5 bg-stone-900 text-stone-300 px-3.5 py-1.5 rounded-full text-[11px] font-medium border border-stone-800 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Platform Engineered & Powered by <strong className="text-white">GetoCore Digital Innovation</strong></span>
        </div>
      </div>

    </div>
  );
}

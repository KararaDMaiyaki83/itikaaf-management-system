'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  HeartHandshake, 
  Stethoscope, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  QrCode, 
  Sparkles, 
  Moon, 
  Info,
  Clock,
  ArrowRight,
  UploadCloud,
  Check,
  Building,
  Building2,
  CreditCard,
  Wallet,
  Coins,
  Search,
  Camera, 
  X, 
  History, 
  RotateCcw, 
  Crown,
  CheckCircle
} from 'lucide-react';
import { DAWABIT_RULES, INITIAL_MASAAJID, ALL_NIGERIAN_STATES, NIGERIAN_STATE_LGAS } from '../../data/initialData';
import { Participant, Gender, StayType, IdType, PastParticipationRecord, Masjid, PaymentGatewayProvider, PaymentTiming, NigerianState } from '../../types/itikaaf';
import { addParticipant, findReturningMutakif, CURRENT_RAMADAN_YEAR, getStoredMasaajid, getActiveMasjidId, getDarUniqueMemberId, updateParticipantPayment } from '../../lib/storage';
import { useSearchParams } from 'next/navigation';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramMasjid = searchParams?.get('masjid');

  const [masaajid, setMasaajid] = useState<Masjid[]>(INITIAL_MASAAJID);
  const [selectedMasjidId, setSelectedMasjidId] = useState<string>('sultan-bello');

  useEffect(() => {
    const list = getStoredMasaajid();
    setMasaajid(list);
    if (paramMasjid && list.some(m => m.id === paramMasjid || m.slug === paramMasjid)) {
      setSelectedMasjidId(paramMasjid);
    } else {
      setSelectedMasjidId(getActiveMasjidId());
    }
  }, [paramMasjid]);

  // Wizard step: 1 (Mosque Selection), 2 (Rules), 3 (Personal/Bio & Photo), 4 (Emergency), 5 (Medical), 6 (Review/Schedule)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mosque Selection State (Step 1 - Nationwide 2-tier: State -> LGA)
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('All States');
  const [selectedLgaFilter, setSelectedLgaFilter] = useState<string>('All LGAs');
  const [mosqueSearchQuery, setMosqueSearchQuery] = useState<string>('');

  // Payment Gateway Checkout State (Post-Registration)
  const [createdParticipant, setCreatedParticipant] = useState<Participant | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedNarration, setCopiedNarration] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState<'transfer' | 'paystack'>('transfer');
  const [transferSenderName, setTransferSenderName] = useState('');
  const [transferBankUsed, setTransferBankUsed] = useState('Jaiz Bank');

  // Returning Mutakif fast-track state
  const [returningQuery, setReturningQuery] = useState('');
  const [returningAlert, setReturningAlert] = useState<{ type: 'success' | 'error'; message: string; name?: string } | null>(null);
  const [isReturning, setIsReturning] = useState(false);
  const [pastRecords, setPastRecords] = useState<PastParticipationRecord[]>([]);
  const [yearsAttendedCount, setYearsAttendedCount] = useState(1);

  // Form State
  const [rulesAccepted, setRulesAccepted] = useState(false);

  // Step 2: Personal & Passport Photo
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender>('male');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [residentialArea, setResidentialArea] = useState('');
  const [idType, setIdType] = useState<IdType>('national_id');
  const [idNumber, setIdNumber] = useState('');
  const [passportPhoto, setPassportPhoto] = useState<string | null>(null);

  // Step 3: Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Brother');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyAltPhone, setEmergencyAltPhone] = useState('');

  // Step 4: Health & Medical
  const [hasChronicCondition, setHasChronicCondition] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [conditionDetails, setConditionDetails] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(['None']);
  const [mobilityAssistanceNeeded, setMobilityAssistanceNeeded] = useState(false);
  const [emergencyMedicalNotes, setEmergencyMedicalNotes] = useState('');

  // Step 5: Stay & Schedule
  const [stayType, setStayType] = useState<StayType>('full_10_days');
  const [arrivalDate, setArrivalDate] = useState('20th Ramadan (Night of 21)');
  const [departureDate, setDepartureDate] = useState('Night of Eid-ul-Fitr');
  const [specificDaysNotes, setSpecificDaysNotes] = useState('');

  // Error validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const conditionOptions = [
    'Diabetes',
    'Hypertension',
    'Asthma',
    'Severe Allergies',
    'Cardiac History',
    'Mobility / Joint Issues',
  ];

  const dietaryOptions = [
    'None',
    'Diabetic Menu',
    'Low-Sodium',
    'Gluten-Free',
    'Lactose-Free',
    'Vegetarian',
  ];

  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter(c => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const toggleDietary = (diet: string) => {
    if (diet === 'None') {
      setDietaryRestrictions(['None']);
      return;
    }
    const filtered = dietaryRestrictions.filter(d => d !== 'None');
    if (filtered.includes(diet)) {
      const remaining = filtered.filter(d => d !== diet);
      setDietaryRestrictions(remaining.length === 0 ? ['None'] : remaining);
    } else {
      setDietaryRestrictions([...filtered, diet]);
    }
  };

  // RETURNING MUTAKIF FAST-TRACK INTEGRATION HANDLER
  const handleLookupReturning = (queryToUse?: string) => {
    const q = (queryToUse !== undefined ? queryToUse : returningQuery).trim();
    if (!q) {
      setReturningAlert({ type: 'error', message: 'Please enter your Phone, National ID, or Old Reference Code.' });
      return;
    }

    const match = findReturningMutakif(q);
    if (!match) {
      setReturningAlert({
        type: 'error',
        message: `No previous I’tikāf record found for "${q}". You can proceed with standard registration below.`,
      });
      return;
    }

    // Auto-populate all previous information!
    setFullName(match.fullName);
    setAge(match.ramadanYear === '1446' ? match.age + 1 : match.age); // auto-increment age for new year
    setGender(match.gender);
    setPhone(match.phone);
    setWhatsapp(match.whatsapp || match.phone);
    setResidentialArea(match.residentialArea);
    setIdType(match.idVerification.idType);
    setIdNumber(match.idVerification.idNumber);
    if (match.passportPhoto) {
      setPassportPhoto(match.passportPhoto);
    }

    // Emergency Contact
    setEmergencyName(match.emergencyContact.name);
    setEmergencyRelation(match.emergencyContact.relationship);
    setEmergencyPhone(match.emergencyContact.phone);
    setEmergencyAltPhone(match.emergencyContact.altPhone || '');

    // Medical Info
    setHasChronicCondition(match.healthMedical.hasChronicCondition);
    setSelectedConditions(match.healthMedical.conditions || []);
    setConditionDetails(match.healthMedical.conditionDetails || '');
    setCurrentMedications(match.healthMedical.currentMedications || '');
    setDietaryRestrictions(match.healthMedical.dietaryRestrictions || ['None']);
    setMobilityAssistanceNeeded(match.healthMedical.mobilityAssistanceNeeded || false);
    setEmergencyMedicalNotes(match.healthMedical.emergencyMedicalNotes || '');

    // Set Returning Flag & Historical Record
    setIsReturning(true);
    setYearsAttendedCount((match.yearsAttendedCount || 1) + 1);

    const pastList: PastParticipationRecord[] = match.pastRecords ? [...match.pastRecords] : [];
    if (!pastList.some(p => p.year.includes(match.ramadanYear))) {
      pastList.unshift({
        year: `${match.ramadanYear} AH`,
        refCode: match.refCode,
        darName: match.darId ? `Dār ${match.darId.charAt(0).toUpperCase() + match.darId.slice(1)}` : 'Main Musalla',
        spaceTag: match.allocatedSpace?.spaceTag,
        attended: match.attendance.checkedIn,
        notes: `Previously attended in ${match.ramadanYear} AH`,
      });
    }
    setPastRecords(pastList);

    setReturningAlert({
      type: 'success',
      message: `Welcome back, ${match.fullName}! Your previous I’tikāf dossier has been integrated. Please confirm your Mosque in Step 1 or review your personal bio in Step 3.`,
      name: match.fullName,
    });

    // Advance to Step 3 so applicant can inspect their pre-filled info
    setCurrentStep(3);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handlePassportPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 240;
        if (ctx) {
          ctx.drawImage(img, 0, 0, 200, 240);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPassportPhoto(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (currentStep === 1) {
      if (!selectedMasjidId) {
        newErrors.masjid = 'Please select a Mosque across Nigeria to perform your I’tikāf.';
      }
    } else if (currentStep === 2) {
      if (!rulesAccepted) {
        newErrors.rules = 'You must accept the I’tikāf Dawabit & Guidelines to proceed.';
      }
    } else if (currentStep === 3) {
      if (!fullName.trim()) newErrors.fullName = 'Full legal name is required.';
      if (!age || Number(age) < 14) newErrors.age = 'Age must be at least 14 years.';
      if (!phone.trim()) newErrors.phone = 'Primary phone number is required.';
      if (!whatsapp.trim()) newErrors.whatsapp = 'WhatsApp number is required for broadcast alerts.';
      if (!residentialArea.trim()) newErrors.residentialArea = 'Residential district/area is required.';
      if (!idNumber.trim()) newErrors.idNumber = 'Identity document number is required.';
    } else if (currentStep === 4) {
      if (!emergencyName.trim()) newErrors.emergencyName = 'Next of kin name is required.';
      if (!emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency contact phone is required.';
    } else if (currentStep === 5) {
      if (hasChronicCondition && selectedConditions.length === 0 && !conditionDetails.trim()) {
        newErrors.conditions = 'Please select or describe your known condition(s).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setErrors({});
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;
    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newRef = `ITK-2026-${randomSuffix}`;

    const initials = fullName
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    const fallbackPhoto = passportPhoto || 
      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="190" viewBox="0 0 160 190"><rect width="160" height="190" fill="%23f1f5f9"/><circle cx="80" cy="70" r="36" fill="%23064e3b"/><text x="80" y="80" font-size="28" font-family="sans-serif" font-weight="bold" fill="%23ffffff" text-anchor="middle">${initials || 'ITK'}</text><path d="M25 170 C25 125, 135 125, 135 170 Z" fill="%23064e3b" opacity="0.85"/></svg>`;

    const selectedMasjid = masaajid.find(m => m.id === selectedMasjidId) || masaajid[0];
    const pConfig = selectedMasjid.paymentConfig;
    const isWaqfFree = !pConfig || pConfig.registrationFeeNgn === 0 || pConfig.paymentTiming === 'free_waqf';
    const payRef = `PAY-${selectedMasjid.codePrefix}-${CURRENT_RAMADAN_YEAR}-${randomSuffix}`;
    const feeNgn = pConfig?.registrationFeeNgn || 0;
    const platformFeePct = pConfig?.platformFeePercentage ?? 10;
    const platformFeeNgn = isWaqfFree ? 0 : Math.round((feeNgn * platformFeePct) / 100);
    const mosqueAmountNgn = feeNgn - platformFeeNgn;

    const newParticipant: Participant = {
      id: `itk-${Date.now()}`,
      masjidId: selectedMasjidId,
      refCode: newRef,
      darMemberId: getDarUniqueMemberId({
        refCode: newRef,
        ramadanYear: CURRENT_RAMADAN_YEAR,
        darId: undefined,
      } as any, undefined, selectedMasjidId),
      ramadanYear: CURRENT_RAMADAN_YEAR,
      fullName: fullName.trim(),
      age: Number(age),
      gender,
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      residentialArea: residentialArea.trim(),
      passportPhoto: fallbackPhoto,
      isReturning,
      yearsAttendedCount: isReturning ? yearsAttendedCount : 1,
      pastRecords: pastRecords.length > 0 ? pastRecords : undefined,
      emergencyContact: {
        name: emergencyName.trim(),
        relationship: emergencyRelation,
        phone: emergencyPhone.trim(),
        altPhone: emergencyAltPhone.trim() || undefined,
      },
      healthMedical: {
        hasChronicCondition,
        conditions: selectedConditions,
        conditionDetails: conditionDetails.trim() || undefined,
        currentMedications: currentMedications.trim() || undefined,
        dietaryRestrictions,
        mobilityAssistanceNeeded,
        emergencyMedicalNotes: emergencyMedicalNotes.trim() || undefined,
      },
      stay: {
        stayType,
        arrivalDate,
        departureDate,
        notes: specificDaysNotes.trim() || undefined,
      },
      idVerification: {
        idType,
        idNumber: idNumber.trim(),
        verified: isReturning, // pre-verified if returning veteran!
      },
      rulesAccepted: true,
      rulesAcceptedAt: new Date().toISOString(),
      status: 'pending',
      statusNotes: isReturning 
        ? `Returning Mutakif (${yearsAttendedCount} years). Prioritize Dār and Musalla spot.` 
        : 'New application received. Awaiting screening committee verification.',
      attendance: {
        checkedIn: false,
        lanyardTagIssued: false,
        checkedOut: false,
      },
      payment: {
        status: isWaqfFree 
          ? 'exempt' 
          : pConfig?.paymentTiming === 'pay_after_screening' 
          ? 'pending_payment' 
          : 'pending_verification',
        amountNgn: feeNgn,
        platformFeePercentage: platformFeePct,
        platformFeeNgn,
        mosqueAmountNgn,
        paymentMethod: pConfig?.gatewayProvider || 'bank_transfer',
        transactionRef: payRef,
        notes: isWaqfFree 
          ? 'Waqf Sponsored Free Registration.' 
          : pConfig?.paymentTiming === 'pay_after_screening'
          ? 'Payment pending committee screening approval.'
          : 'Awaiting transfer verification / checkout.',
      },
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParticipant),
      }).catch(err => console.warn('API note:', err));
    } catch (apiErr) {
      console.warn('API route:', apiErr);
    }

    addParticipant(newParticipant);
    setCreatedParticipant(newParticipant);
    setSubmittedRef(newRef);
    setPaymentCompleted(false);
    setIsSubmitting(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyRefCode = () => {
    if (submittedRef) {
      navigator.clipboard.writeText(submittedRef);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  const copyAccountNumber = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const copyNarrationRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedNarration(true);
    setTimeout(() => setCopiedNarration(false), 2500);
  };

  const handleSimulatePayment = (method: PaymentGatewayProvider) => {
    setPaymentSubmitting(true);
    setTimeout(() => {
      if (createdParticipant) {
        const fee = createdParticipant.payment?.amountNgn || currentSelectedMasjid.paymentConfig?.registrationFeeNgn || 0;
        const pct = createdParticipant.payment?.platformFeePercentage ?? (currentSelectedMasjid.paymentConfig?.platformFeePercentage ?? 10);
        const platFee = createdParticipant.payment?.platformFeeNgn ?? Math.round((fee * pct) / 100);
        const mosqueAmt = createdParticipant.payment?.mosqueAmountNgn ?? (fee - platFee);

        const updated = updateParticipantPayment(createdParticipant.id, {
          status: 'paid',
          amountNgn: fee,
          platformFeePercentage: pct,
          platformFeeNgn: platFee,
          mosqueAmountNgn: mosqueAmt,
          paymentMethod: method,
          transactionRef: createdParticipant.payment?.transactionRef,
          paidAt: new Date().toISOString(),
          payerName: transferSenderName.trim() || fullName,
          receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
          notes: method === 'paystack' 
            ? `Verified online Card Payment via Paystack. Split: ₦${mosqueAmt.toLocaleString()} Mosque / ₦${platFee.toLocaleString()} GetoCore Platform Fee` 
            : `Direct Bank Transfer from ${transferBankUsed}. Split: ₦${mosqueAmt.toLocaleString()} Mosque / ₦${platFee.toLocaleString()} GetoCore Platform Fee`,
        });
        if (updated) {
          setCreatedParticipant(updated);
        }
      }
      setPaymentCompleted(true);
      setPaymentSubmitting(false);
    }, 1000);
  };

  const stepsList = [
    { num: 1, label: 'Choose Mosque', icon: Building2 },
    { num: 2, label: 'Dawabit & Rules', icon: ShieldCheck },
    { num: 3, label: 'Personal & Photo', icon: User },
    { num: 4, label: 'Emergency Contact', icon: HeartHandshake },
    { num: 5, label: 'Medical Disclosure', icon: Stethoscope },
    { num: 6, label: 'Schedule & Review', icon: Calendar },
  ];

  const availableLgasForSelectedState: string[] = React.useMemo(() => {
    if (selectedStateFilter === 'All States') {
      const allLgas = Array.from(new Set(masaajid.map(m => m.lga)));
      return ['All LGAs', ...allLgas];
    }
    const stateLgas = NIGERIAN_STATE_LGAS[selectedStateFilter as NigerianState] || [];
    return ['All LGAs', ...stateLgas];
  }, [selectedStateFilter, masaajid]);

  const filteredMasaajidForRegistration = masaajid.filter((m) => {
    if (selectedStateFilter !== 'All States' && m.state !== selectedStateFilter) {
      return false;
    }
    if (selectedLgaFilter !== 'All LGAs' && m.lga !== selectedLgaFilter) {
      return false;
    }
    if (mosqueSearchQuery.trim()) {
      const q = mosqueSearchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.nameAr.toLowerCase().includes(q) ||
        m.area.toLowerCase().includes(q) ||
        m.lga.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q) ||
        m.codePrefix.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const currentSelectedMasjid = masaajid.find(m => m.id === selectedMasjidId) || masaajid[0];

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-3 border border-emerald-200">
            <Moon className="w-3.5 h-3.5 text-amber-600" />
            <span>Ramadan 1447 AH • Central Masjid I’tikāf</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            I’tikāf Participant Registration Portal
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            طلب التسجيل للاعتكاف — دعم استرجاع بيانات المعتكفين للسنوات السابقة
          </p>
          <div className="mt-3 inline-block bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1 rounded-md font-medium">
            ⚠️ Policy Notice: All accommodations are strictly <strong>Floor Spaces / Spots</strong> (No beds). Bring personal sleeping mat.
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RETURNING MUTAKIF INTEGRATION CARD (FAST-TRACK RE-REGISTRATION)           */}
        {/* ========================================================================= */}
        {!submittedRef && (
          <div className="bg-gradient-to-br from-amber-50 via-emerald-50/50 to-white rounded-2xl border-2 border-amber-300 p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-bold flex-shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Returning Mutakif from Previous Year? (معتكف سابق؟)
                  </h3>
                  <p className="text-xs text-stone-600">
                    If you attended in 1445 or 1446 AH, enter your phone or ID to auto-populate your photo, contacts & medical info!
                  </p>
                </div>
              </div>

              {isReturning && (
                <span className="inline-flex items-center gap-1 bg-emerald-800 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  Returning Veteran (Year {yearsAttendedCount})
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={returningQuery}
                  onChange={(e) => setReturningQuery(e.target.value)}
                  placeholder="Enter Phone Number, National ID, or Old Reference Code..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
              <button
                type="button"
                onClick={() => handleLookupReturning()}
                className="inline-flex items-center justify-center gap-1.5 bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-all flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Auto-Integrate My Previous Info</span>
              </button>
            </div>

            {/* Quick Demo Test Chip */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone-500">
              <span className="font-semibold text-stone-700">Test Demo Alum:</span>
              <button
                type="button"
                onClick={() => {
                  setReturningQuery('+1 (555) 888-1234');
                  handleLookupReturning('+1 (555) 888-1234');
                }}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-2.5 py-0.5 rounded-md border border-amber-300 transition-colors"
              >
                Click to load Dr. Khalid Al-Amoudi (1446 AH Alum)
              </button>
            </div>

            {returningAlert && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in ${
                returningAlert.type === 'success'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-red-100 text-red-900 border border-red-300'
              }`}>
                {returningAlert.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{returningAlert.message}</span>
              </div>
            )}
          </div>
        )}

        {/* Successful Submission View */}
        {submittedRef ? (
          <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl overflow-hidden p-6 sm:p-10 animate-fade-in space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">Application Registered for 1447 AH!</h2>
              <p className="text-stone-600 text-sm mt-1">
                جزاكم الله خيراً — May Allah accept your intention and continuous devotion.
              </p>

              {/* Reference Code Card */}
              <div className="mt-6 bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-2 border-emerald-300 rounded-xl p-5 max-w-md mx-auto shadow-inner">
                <p className="text-xs uppercase tracking-wider font-semibold text-emerald-800">
                  Your 1447 AH Tracking Reference Code
                </p>
                <div className="flex items-center justify-center gap-3 mt-1.5">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-wider">
                    {submittedRef}
                  </span>
                  <button
                    onClick={copyRefCode}
                    className="p-2 text-emerald-700 hover:text-emerald-900 bg-white rounded-lg shadow-sm border border-emerald-200 hover:bg-emerald-50 transition-colors"
                    title="Copy Reference Code"
                  >
                    {copiedRef ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                {isReturning && (
                  <div className="mt-2 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-md inline-block">
                    ★ Returning Veteran Application (Prioritized for Dār & Spot Allocation)
                  </div>
                )}
              </div>
            </div>

            {/* Selected Mosque Info Card */}
            {currentSelectedMasjid && (
              <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 max-w-xl mx-auto flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Assigned Mosque</span>
                  <span className="font-extrabold text-stone-900 text-sm">{currentSelectedMasjid.name}</span>
                  <p className="text-stone-500 text-[11px]">{currentSelectedMasjid.area}, {currentSelectedMasjid.lga} LGA, {currentSelectedMasjid.state} State</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Musalla Floor Spots</span>
                  <span className="font-mono font-bold text-emerald-900">{currentSelectedMasjid.totalFloorCapacity} spots (No Beds)</span>
                </div>
              </div>
            )}

            {/* WORKFLOW 1: SCREENING FIRST (pay_after_screening) */}
            {(!currentSelectedMasjid?.paymentConfig || currentSelectedMasjid.paymentConfig.paymentTiming === 'pay_after_screening') && (
              <div className="max-w-xl mx-auto bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-amber-800" />
                  </div>
                  <div>
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                      Step 1 Completed • Screening in Progress
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 mt-1">
                      Screening Committee Verification Underway
                    </h3>
                    <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                      In line with <strong>{currentSelectedMasjid?.name}</strong>'s policy, all applicants undergo screening (medical disclosure, emergency contact, and age verification) <strong>before</strong> payment is accepted.
                    </p>
                    <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                      Once the screening committee approves your application, your status will update to <em>"Approved"</em> and the payment gateway of <strong>₦{(currentSelectedMasjid?.paymentConfig?.registrationFeeNgn || 0).toLocaleString()}</strong> will unlock on your Gate Pass page.
                    </p>
                  </div>
                </div>

                {/* Bank Details Preview for Applicant */}
                {currentSelectedMasjid?.paymentConfig && currentSelectedMasjid.paymentConfig.registrationFeeNgn > 0 && (
                  <div className="bg-white rounded-xl p-3.5 border border-amber-200 text-xs space-y-1.5">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Official Mosque Account Preview (Upon Approval):
                    </span>
                    <div className="flex justify-between font-mono">
                      <span className="text-stone-600">Bank:</span>
                      <span className="font-bold text-stone-900">{currentSelectedMasjid.paymentConfig.bankName}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-stone-600">Account NUBAN:</span>
                      <span className="font-bold text-emerald-950">{currentSelectedMasjid.paymentConfig.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">Account Name:</span>
                      <span className="font-medium text-stone-900">{currentSelectedMasjid.paymentConfig.accountName}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WORKFLOW 2: PAY UPFRONT (pay_with_registration) */}
            {currentSelectedMasjid?.paymentConfig?.paymentTiming === 'pay_with_registration' && (currentSelectedMasjid.paymentConfig.registrationFeeNgn || 0) > 0 && (
              <div className="max-w-xl mx-auto bg-white border-2 border-emerald-600 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-800" />
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">
                        {currentSelectedMasjid.name} Payment Gateway
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Complete your payment to validate form submission and spot pass.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 font-bold uppercase block">Amount Due</span>
                    <span className="text-base font-extrabold text-emerald-900">
                      ₦{currentSelectedMasjid.paymentConfig.registrationFeeNgn.toLocaleString()}
                    </span>
                  </div>
                </div>

                {paymentCompleted ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="text-sm font-bold text-emerald-950">Payment Receipt Generated & Confirmed!</h4>
                    <p className="text-xs text-emerald-800">
                      Transfer reference <strong>{createdParticipant?.payment?.transactionRef || `PAY-${submittedRef}`}</strong> has been logged to {currentSelectedMasjid.name}’s account.
                    </p>
                    <span className="inline-block bg-emerald-700 text-white font-mono text-xs px-3 py-1 rounded-full font-bold">
                      Status: Paid & Spot Confirmed
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Itemized Transparent Invoice / Receipt Breakdown */}
                    <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-950 pb-1 border-b border-emerald-200">
                        <span>Official Fee Breakdown & Split Receipt</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.2 rounded font-sans font-semibold">
                          Gateway Automated Split
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-stone-700">
                        <span>• Mosque I’tikāf & Musalla Provision ({100 - (currentSelectedMasjid.paymentConfig.platformFeePercentage ?? 10)}%):</span>
                        <span className="font-mono font-bold text-stone-900">
                          ₦{(currentSelectedMasjid.paymentConfig.registrationFeeNgn - Math.round((currentSelectedMasjid.paymentConfig.registrationFeeNgn * (currentSelectedMasjid.paymentConfig.platformFeePercentage ?? 10)) / 100)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-stone-700">
                        <span>• GetoCore Digital Platform & Technology Processing ({currentSelectedMasjid.paymentConfig.platformFeePercentage ?? 10}%):</span>
                        <span className="font-mono font-bold text-amber-800">
                          ₦{Math.round((currentSelectedMasjid.paymentConfig.registrationFeeNgn * (currentSelectedMasjid.paymentConfig.platformFeePercentage ?? 10)) / 100).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-emerald-200 font-bold text-stone-900 text-xs">
                        <span>Total Payable:</span>
                        <span className="font-mono text-emerald-950 text-sm">
                          ₦{currentSelectedMasjid.paymentConfig.registrationFeeNgn.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Payment Mode Selector Tabs */}
                    <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setActivePaymentTab('transfer')}
                        className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                          activePaymentTab === 'transfer' ? 'bg-white shadow text-emerald-900' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Direct Bank Transfer / USSD
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePaymentTab('paystack')}
                        className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                          activePaymentTab === 'paystack' ? 'bg-white shadow text-emerald-900' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Card / Paystack Online
                      </button>
                    </div>

                    {activePaymentTab === 'transfer' ? (
                      /* DIRECT BANK TRANSFER OPTION */
                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3 text-xs">
                        <p className="text-stone-600">
                          Transfer <strong>₦{currentSelectedMasjid.paymentConfig.registrationFeeNgn.toLocaleString()}</strong> via your bank mobile app or USSD to:
                        </p>

                        <div className="bg-white p-3 rounded-lg border border-stone-300 space-y-2">
                          <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                            <span className="text-stone-500">Bank Name:</span>
                            <span className="font-bold text-stone-900">{currentSelectedMasjid.paymentConfig.bankName}</span>
                          </div>

                          <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                            <span className="text-stone-500">Account Number:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-base font-extrabold text-emerald-950">
                                {currentSelectedMasjid.paymentConfig.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyAccountNumber(currentSelectedMasjid.paymentConfig!.accountNumber)}
                                className="p-1 text-emerald-800 hover:bg-emerald-50 rounded border border-emerald-200"
                                title="Copy Account Number"
                              >
                                {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                            <span className="text-stone-500">Account Name:</span>
                            <span className="font-medium text-stone-900">{currentSelectedMasjid.paymentConfig.accountName}</span>
                          </div>

                          <div className="flex items-center justify-between pt-0.5">
                            <span className="text-stone-500">Payment Narration / Ref:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-stone-800">
                                {createdParticipant?.payment?.transactionRef || submittedRef}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyNarrationRef(createdParticipant?.payment?.transactionRef || submittedRef!)}
                                className="p-1 text-emerald-800 hover:bg-emerald-50 rounded border border-emerald-200"
                                title="Copy Narration Ref"
                              >
                                {copiedNarration ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Sender Account Name..."
                            value={transferSenderName}
                            onChange={(e) => setTransferSenderName(e.target.value)}
                            className="p-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={paymentSubmitting}
                            onClick={() => handleSimulatePayment('bank_transfer')}
                            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2 px-3 rounded-lg shadow-sm transition-all disabled:opacity-50"
                          >
                            {paymentSubmitting ? 'Confirming Transfer...' : 'I Have Transferred — Confirm'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* PAYSTACK ONLINE OPTION */
                      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3 text-xs">
                        <div className="flex items-center justify-between text-stone-600">
                          <span>Pay with Debit Card (Mastercard / Visa / Verve)</span>
                          <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded">
                            Paystack Secured
                          </span>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Card Number: 4242 •••• •••• 4242"
                            className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-xs focus:outline-none"
                            defaultValue="5399 4100 1234 5678"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="p-2 rounded-lg border border-stone-300 font-mono text-xs focus:outline-none"
                              defaultValue="12/28"
                            />
                            <input
                              type="text"
                              placeholder="CVV: 123"
                              className="p-2 rounded-lg border border-stone-300 font-mono text-xs focus:outline-none"
                              defaultValue="842"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={paymentSubmitting}
                            onClick={() => handleSimulatePayment('paystack')}
                            className="w-full bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-bold py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>{paymentSubmitting ? 'Processing Payment...' : `Pay ₦${currentSelectedMasjid.paymentConfig.registrationFeeNgn.toLocaleString()} Now`}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* WORKFLOW 3: FREE WAQF SPONSORED */}
            {(currentSelectedMasjid?.paymentConfig?.paymentTiming === 'free_waqf' || (currentSelectedMasjid?.paymentConfig?.registrationFeeNgn || 0) === 0) && (
              <div className="max-w-xl mx-auto bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 shadow-sm space-y-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span>Free Waqf Sponsored Registration</span>
                </div>
                <p className="text-stone-700 leading-relaxed">
                  Alhamdulillah! All I’tikāf spaces at <strong>{currentSelectedMasjid?.name}</strong> are fully sponsored by community Waqf endowment. No form fee is required.
                </p>
                {currentSelectedMasjid?.paymentConfig?.accountNumber && (
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 text-[11px] text-stone-600 space-y-1">
                    <span className="font-bold text-stone-800 block">Optional Voluntary Sadaqah (Suhur & Iftar Feeding Fund):</span>
                    <p className="font-mono">Bank: {currentSelectedMasjid.paymentConfig.bankName} • NUBAN: {currentSelectedMasjid.paymentConfig.accountNumber} ({currentSelectedMasjid.paymentConfig.accountName})</p>
                  </div>
                )}
              </div>
            )}

            {/* Summary Details */}
            <div className="mt-8 bg-stone-50 rounded-xl border border-stone-200 p-5 text-left text-xs text-stone-700 space-y-2.5 max-w-lg mx-auto">
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500 font-medium">Applicant Name:</span>
                <span className="font-semibold text-stone-900">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500 font-medium">Selected Mosque:</span>
                <span className="font-semibold text-emerald-900">{currentSelectedMasjid?.name} ({currentSelectedMasjid?.lga} LGA, {currentSelectedMasjid?.state})</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500 font-medium">Wing:</span>
                <span className="font-semibold text-stone-900">
                  {gender === 'male' ? 'Brothers Wing (Hall of Omar)' : 'Sisters Wing (Hall of Aisha)'}
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500 font-medium">Status:</span>
                <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                  Pending Screening Review
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Musalla Floor Spot:</span>
                <span className="text-stone-600 italic">
                  Assigned upon committee review
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/pass?ref=${submittedRef}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-xs"
              >
                <QrCode className="w-5 h-5 text-amber-300" />
                <span>View Status & Printable Gate Pass</span>
              </Link>
              <button
                onClick={() => {
                  setSubmittedRef(null);
                  setCurrentStep(1);
                  setFullName('');
                  setAge('');
                  setPhone('');
                  setWhatsapp('');
                  setResidentialArea('');
                  setIdNumber('');
                  setPassportPhoto(null);
                  setEmergencyName('');
                  setEmergencyPhone('');
                  setSelectedConditions([]);
                  setRulesAccepted(false);
                  setIsReturning(false);
                  setPastRecords([]);
                  setReturningAlert(null);
                  setPaymentCompleted(false);
                  setCreatedParticipant(null);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-5 py-3 rounded-xl transition-colors border border-stone-300 text-xs"
              >
                <span>Submit Another Registration</span>
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Step Wizard Container */
          <div className="bg-white rounded-2xl border border-stone-200 shadow-md overflow-hidden">
            
            {/* Step Progress Tracker */}
            <div className="bg-stone-100/80 border-b border-stone-200 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                {stepsList.map((st) => {
                  const Icon = st.icon;
                  const isCompleted = currentStep > st.num;
                  const isCurrent = currentStep === st.num;

                  return (
                    <div key={st.num} className="flex-1 flex flex-col items-center relative">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? 'bg-emerald-700 text-white ring-2 ring-emerald-600'
                            : isCurrent
                            ? 'bg-emerald-900 text-amber-300 ring-4 ring-emerald-100 shadow-sm'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span
                        className={`text-[11px] mt-1.5 hidden sm:block font-medium ${
                          isCurrent ? 'text-emerald-900 font-bold' : 'text-stone-500'
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Step Body */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">

              {/* ================= STEP 1: CHOOSE MOSQUE (STATE BY STATE, LGA BY LGA) ================= */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-200 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                          <Building2 className="w-6 h-6 text-emerald-700" />
                          <span>Step 1: Select Mosque for I’tikāf Across Nigeria (اختر المسجد في نيجيريا)</span>
                        </h2>
                        <p className="text-xs text-stone-600 mt-1">
                          Select your State and Local Government Area (LGA) to find participating Masaajid across Nigeria.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start">
                        {filteredMasaajidForRegistration.length} Masaajid Available
                      </span>
                    </div>
                  </div>

                  {/* 2-TIER FILTERING: STATE BY STATE & LGA BY LGA + SEARCH */}
                  <div className="space-y-4">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={mosqueSearchQuery}
                        onChange={(e) => setMosqueSearchQuery(e.target.value)}
                        placeholder="Search Mosque by name, state, LGA, or area (e.g. Abuja National, Sultan Bello, Lagos Central, Kano Central)..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>

                    {/* TIER 1: STATE SELECTION */}
                    <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Tier 1: Filter by Nigerian State (اختر الولاية):</span>
                        </label>
                        {/* State Dropdown Selector for all 36 States + FCT */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-stone-500 font-semibold">All 36 States + FCT:</span>
                          <select
                            value={selectedStateFilter}
                            onChange={(e) => {
                              setSelectedStateFilter(e.target.value);
                              setSelectedLgaFilter('All LGAs');
                            }}
                            className="text-xs font-bold py-1 px-2.5 rounded-lg border border-emerald-300 bg-white text-emerald-950 focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                          >
                            <option value="All States">All Nigeria (36 States + FCT)</option>
                            {ALL_NIGERIAN_STATES.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Prominent State Quick Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['All States', 'FCT - Abuja', 'Kaduna', 'Kano', 'Lagos', 'Oyo', 'Sokoto', 'Kwara', 'Borno'].map((st) => {
                          const isSelected = selectedStateFilter === st;
                          const count = st === 'All States'
                            ? masaajid.length
                            : masaajid.filter(m => m.state === st).length;

                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => {
                                setSelectedStateFilter(st);
                                setSelectedLgaFilter('All LGAs');
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-emerald-900 text-amber-300 shadow-sm ring-1 ring-emerald-950'
                                  : 'bg-white text-stone-700 hover:bg-emerald-100/70 border border-emerald-200'
                              }`}
                            >
                              <span>{st === 'All States' ? 'All Nigeria' : st}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                isSelected ? 'bg-emerald-800 text-amber-200' : 'bg-stone-100 text-stone-600'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* TIER 2: LGA SELECTION */}
                    <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-extrabold text-stone-700 uppercase tracking-wide flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-500" />
                          <span>
                            Tier 2: Filter by LGA {selectedStateFilter !== 'All States' ? `(${selectedStateFilter})` : '(All)'}:
                          </span>
                        </label>
                        {/* LGA Dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-stone-500 font-semibold">LGA List:</span>
                          <select
                            value={selectedLgaFilter}
                            onChange={(e) => setSelectedLgaFilter(e.target.value)}
                            className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                          >
                            {availableLgasForSelectedState.map((lga) => (
                              <option key={lga} value={lga}>{lga}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Quick LGA pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                        {availableLgasForSelectedState.slice(0, 14).map((lga) => {
                          const isSelected = selectedLgaFilter === lga;
                          const count = lga === 'All LGAs'
                            ? (selectedStateFilter === 'All States' ? masaajid.length : masaajid.filter(m => m.state === selectedStateFilter).length)
                            : masaajid.filter(m => m.lga === lga && (selectedStateFilter === 'All States' || m.state === selectedStateFilter)).length;

                          return (
                            <button
                              key={lga}
                              type="button"
                              onClick={() => setSelectedLgaFilter(lga)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900'
                                  : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                              }`}
                            >
                              <span>{lga}</span>
                              <span className={`text-[10px] px-1 py-0.2 rounded-full ${
                                isSelected ? 'bg-amber-400 text-emerald-950 font-bold' : 'bg-stone-100 text-stone-500'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Mosque Selection Error */}
                  {errors.masjid && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>{errors.masjid}</span>
                    </div>
                  )}

                  {/* Mosque Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredMasaajidForRegistration.map((masjid) => {
                      const isSelected = selectedMasjidId === masjid.id;
                      const fee = masjid.paymentConfig?.registrationFeeNgn || 0;
                      const timing = masjid.paymentConfig?.paymentTiming || 'pay_after_screening';

                      return (
                        <div
                          key={masjid.id}
                          onClick={() => {
                            setSelectedMasjidId(masjid.id);
                            if (errors.masjid) {
                              const nextErrors = { ...errors };
                              delete nextErrors.masjid;
                              setErrors(nextErrors);
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-emerald-700 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/30'
                              : 'border-stone-200 bg-white hover:border-emerald-300 hover:shadow-sm'
                          }`}
                        >
                          <div>
                            {/* Card Header: State, LGA, & Checkmark */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="inline-flex items-center gap-1 bg-emerald-100/90 text-emerald-950 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border border-emerald-300">
                                <MapPin className="w-3 h-3 text-emerald-700" />
                                {masjid.state} • {masjid.lga} LGA • {masjid.area}
                              </span>

                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-800 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-sm">
                                  <CheckCircle className="w-3 h-3 text-amber-300" />
                                  Selected
                                </span>
                              ) : (
                                <span className="text-[10px] text-stone-400 font-mono font-bold">
                                  {masjid.codePrefix}
                                </span>
                              )}
                            </div>

                            {/* Names */}
                            <h3 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug">
                              {masjid.name}
                            </h3>
                            <p className="text-xs font-arabic text-emerald-800 mt-0.5">
                              {masjid.nameAr}
                            </p>

                            {/* Policy & Capacity Badges */}
                            <div className="mt-3 pt-2.5 border-t border-stone-100 space-y-1.5 text-xs">
                              <div className="flex items-center justify-between text-stone-600">
                                <span className="text-stone-500">Musalla Spots:</span>
                                <span className="font-bold text-emerald-950 font-mono">
                                  {masjid.totalFloorCapacity} spots (No Beds)
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-stone-600">
                                <span className="text-stone-500">Registration Fee:</span>
                                <span className="font-extrabold text-stone-900">
                                  {fee > 0 ? `₦${fee.toLocaleString()}` : 'Free / Waqf Sponsored'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-stone-600">
                                <span className="text-stone-500">Screening Policy:</span>
                                <span className="font-semibold text-amber-900 text-[11px]">
                                  {timing === 'pay_after_screening' ? '🛡️ Screening First' : timing === 'pay_with_registration' ? '⚡ Pay Upfront' : '🎁 Free Waqf'}
                                </span>
                              </div>

                              {masjid.paymentConfig?.bankName && (
                                <div className="flex items-center justify-between text-stone-600">
                                  <span className="text-stone-500">Bank Account:</span>
                                  <span className="font-mono text-[11px] text-stone-700">
                                    {masjid.paymentConfig.bankName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Selection indicator button */}
                          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                            <span className="text-[11px] text-stone-400 truncate max-w-[180px]">
                              {masjid.address}
                            </span>
                            <span className={`text-xs font-bold ${isSelected ? 'text-emerald-800' : 'text-stone-500'}`}>
                              {isSelected ? '✓ Confirmed Choice' : 'Select'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredMasaajidForRegistration.length === 0 && (
                    <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
                      <Building2 className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-stone-700">No Mosque found matching "{mosqueSearchQuery}" in {selectedLgaFilter}</p>
                      <button
                        type="button"
                        onClick={() => { setSelectedLgaFilter('All LGAs'); setMosqueSearchQuery(''); }}
                        className="mt-2 text-xs text-emerald-800 underline font-semibold"
                      >
                        Reset Filters & Show All Masaajid
                      </button>
                    </div>
                  )}

                  {/* Selected Mosque Confirmation Callout */}
                  {currentSelectedMasjid && (
                    <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                      <div>
                        <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-4 h-4 text-amber-400" />
                          <span>Currently Selected Mosque for Ramadan 1447 AH</span>
                        </div>
                        <h4 className="text-base font-extrabold mt-0.5 text-white">
                          {currentSelectedMasjid.name} ({currentSelectedMasjid.lga} LGA)
                        </h4>
                        <p className="text-xs text-emerald-200 mt-0.5">
                          {currentSelectedMasjid.area} • Chairman: {currentSelectedMasjid.chairmanName} ({currentSelectedMasjid.contactPhone})
                        </p>
                      </div>
                      <div className="text-right sm:border-l sm:border-emerald-800 sm:pl-4 self-start sm:self-auto">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-300 block">Fee / Contribution</span>
                        <span className="text-sm font-extrabold text-amber-300">
                          {currentSelectedMasjid.paymentConfig?.registrationFeeNgn ? `₦${currentSelectedMasjid.paymentConfig.registrationFeeNgn.toLocaleString()}` : 'Free / Waqf'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= STEP 2: RULES & DAWABIT ================= */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-200 pb-4">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-700" />
                      <span>Masjid I’tikāf Rules & Dawabit (ضوابط وشروط الاعتكاف)</span>
                    </h2>
                    <p className="text-xs text-stone-600 mt-1">
                      Please read the spiritual etiquette and discipline policies carefully before applying.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {DAWABIT_RULES.map((rule, idx) => (
                      <div
                        key={rule.id}
                        className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center mt-0.5 flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="text-sm font-semibold text-stone-900">{rule.titleEn}</h3>
                              <span className="text-xs font-arabic text-emerald-800 font-medium">
                                {rule.titleAr}
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                              {rule.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Space Policy Alert */}
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900 space-y-1">
                        <p className="font-semibold">Important Space Allocation Notice (لا توجد أسرّة — مساحات فقط):</p>
                        <p>
                          Our Masjid does <strong>NOT</strong> provide beds or cots. Accommodation is structured strictly by numbered floor spots (1.8m × 0.8m) organized into the 4 Dārs (Abubakar, Umar, Usman, Aliyu). Participants must bring their own sleeping mat, lightweight blanket, and personal items.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Agreement Checkbox */}
                  <div className="pt-2">
                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      rulesAccepted 
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200' 
                        : 'bg-white border-stone-300 hover:border-stone-400'
                    }`}>
                      <input
                        type="checkbox"
                        checked={rulesAccepted}
                        onChange={(e) => {
                          setRulesAccepted(e.target.checked);
                          if (errors.rules) setErrors({ ...errors, rules: '' });
                        }}
                        className="mt-1 w-5 h-5 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="text-xs text-stone-800 leading-normal select-none">
                        <span className="font-bold text-stone-900 block text-sm mb-1">
                          Digital Agreement & Solemn Pledge (الإقرار والتعهد)
                        </span>
                        I have read, understood, and solemnly pledge to adhere to the I’tikāf Dawabit, stay within my allotted space, respect quiet hours, and obey the decisions of the Masjid I’tikāf committee and Dār Ameers at all times.
                      </div>
                    </label>
                    {errors.rules && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.rules}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ================= STEP 3: PERSONAL & PASSPORT PHOTO ================= */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-200 pb-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                        <User className="w-6 h-6 text-emerald-700" />
                        <span>Personal Details & Passport Photo</span>
                      </h2>
                      {isReturning && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          ★ Pre-filled from Previous Records
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      {isReturning 
                        ? 'Your previously saved information is pre-loaded below. Verify that everything is up to date.'
                        : 'Upload your official passport-style photograph for your gate pass badge and complete your bio details.'}
                    </p>
                  </div>

                  {/* KADUNA STATE MOSQUE SELECTOR (LGA by LGA) */}
                  {(() => {
                    const currentSelectedMasjid = masaajid.find(m => m.id === selectedMasjidId) || masaajid[0];
                    return (
                      <div className="bg-emerald-950 text-white p-4 sm:p-5 rounded-2xl border border-emerald-800 shadow-sm space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                            Select Mosque in Kaduna State (اختر المسجد في ولاية كادونا) *
                          </label>
                          {currentSelectedMasjid && (
                            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-900/90 px-2.5 py-0.5 rounded border border-emerald-700">
                              {currentSelectedMasjid.lga} LGA • {currentSelectedMasjid.area}
                            </span>
                          )}
                        </div>
                        <select
                          value={selectedMasjidId}
                          onChange={(e) => setSelectedMasjidId(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-emerald-700 bg-emerald-900 text-white font-bold text-xs sm:text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer"
                        >
                          {Array.from(new Set(masaajid.map(m => m.lga))).map((lga) => (
                            <optgroup key={lga} label={`── ${lga} LGA ──`} className="bg-stone-900 text-stone-300 font-bold">
                              {masaajid.filter(m => m.lga === lga).map(m => (
                                <option key={m.id} value={m.id} className="bg-stone-900 text-white font-normal">
                                  {m.name} ({m.area}) — Capacity: {m.totalFloorCapacity} spots (Strict No Beds)
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <div className="text-[11px] text-emerald-300/90 flex flex-wrap items-center justify-between gap-2 pt-0.5">
                          <span>Your application & unique ID barcode will be registered with this mosque's committee.</span>
                          <span className="text-amber-300 font-arabic text-xs">نظام مساجد ولاية كادونا</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* PASSPORT PHOTOGRAPH UPLOAD BOX */}
                  <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 flex flex-col sm:flex-row items-center gap-5">
                    <div className="flex-shrink-0">
                      <div className="w-28 h-32 rounded-xl border-2 border-emerald-600/50 bg-white overflow-hidden shadow-md flex items-center justify-center relative">
                        {passportPhoto ? (
                          <>
                            <img
                              src={passportPhoto}
                              alt="Passport Photo Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setPassportPhoto(null)}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow"
                              title="Remove photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-3 text-stone-400 flex flex-col items-center">
                            <Camera className="w-8 h-8 text-emerald-700 mb-1" />
                            <span className="text-[10px] font-semibold text-stone-500">
                              Passport Photo
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1.5">
                      <h3 className="text-sm font-bold text-stone-900">
                        Passport Photograph (صورة شخصية للبطاقة)
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Recent clear portrait photograph with plain background. Printed directly onto your official I’tikāf Gate Pass badge.
                      </p>
                      
                      <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors">
                          <UploadCloud className="w-4 h-4" />
                          <span>{passportPhoto ? 'Change Photo' : 'Select Photo File'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePassportPhotoUpload}
                            className="hidden"
                          />
                        </label>
                        {passportPhoto && (
                          <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Photo attached
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Full Legal Name (الاسم الرباعي الكامل) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ibrahim Al-Mansoor"
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Age (العمر) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="14"
                        max="90"
                        value={age}
                        onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 32"
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Gender & Wing <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setGender('male')}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                            gender === 'male'
                              ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                          }`}
                        >
                          <span>Brothers (رجال)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setGender('female')}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                            gender === 'female'
                              ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                          }`}
                        >
                          <span>Sisters (نساء)</span>
                        </button>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Primary Phone Number (رقم الهاتف) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                    </div>

                    {/* WhatsApp Number */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        WhatsApp Number (لإشعارات واتساب) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {errors.whatsapp && <p className="text-xs text-red-600 mt-1">{errors.whatsapp}</p>}
                    </div>

                    {/* Residential Area */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Residential Area / District / City (المنطقة والمدينة) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={residentialArea}
                          onChange={(e) => setResidentialArea(e.target.value)}
                          placeholder="e.g. Al-Noor District, West Zone"
                          className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      {errors.residentialArea && (
                        <p className="text-xs text-red-600 mt-1">{errors.residentialArea}</p>
                      )}
                    </div>

                    {/* ID Document Type */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Identity Document Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value as IdType)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="national_id">National ID Card (الهوية الوطنية)</option>
                        <option value="passport">Passport (جواز السفر)</option>
                        <option value="voter_card">Voter Card (بطاقة الناخب)</option>
                        <option value="drivers_license">Driver's License (رخصة القيادة)</option>
                      </select>
                    </div>

                    {/* ID Number */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Document Number (رقم الوثيقة) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="e.g. NID-88219-X"
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {errors.idNumber && <p className="text-xs text-red-600 mt-1">{errors.idNumber}</p>}
                    </div>

                  </div>
                </div>
              )}

              {/* ================= STEP 4: EMERGENCY CONTACT ================= */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-200 pb-4">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <HeartHandshake className="w-6 h-6 text-emerald-700" />
                      <span>Next of Kin & Emergency Contact (جهة الاتصال للطوارئ)</span>
                    </h2>
                    <p className="text-xs text-stone-600 mt-1">
                      Emergency contacts are maintained by the Dār Ameer and first-aid desk for immediate contact if needed.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Emergency Contact Full Name (اسم ولي الأمر / قريب) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="e.g. Umar Al-Mansoor"
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {errors.emergencyName && (
                        <p className="text-xs text-red-600 mt-1">{errors.emergencyName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Relationship (صلة القرابة) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={emergencyRelation}
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Father">Father (الوالد)</option>
                        <option value="Mother">Mother (الوالدة)</option>
                        <option value="Brother">Brother (الأخ)</option>
                        <option value="Sister">Sister (الأخت)</option>
                        <option value="Spouse">Spouse (الزوج / الزوجة)</option>
                        <option value="Son">Son (الابن)</option>
                        <option value="Daughter">Daughter (الابنة)</option>
                        <option value="Guardian">Guardian / Uncle (الوصي / القريب)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Emergency Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={emergencyPhone}
                          onChange={(e) => setEmergencyPhone(e.target.value)}
                          placeholder="+1 (555) 999-8888"
                          className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      {errors.emergencyPhone && (
                        <p className="text-xs text-red-600 mt-1">{errors.emergencyPhone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Alternative Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={emergencyAltPhone}
                          onChange={(e) => setEmergencyAltPhone(e.target.value)}
                          placeholder="+1 (555) 777-6666"
                          className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 5: MEDICAL DISCLOSURE ================= */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-200 pb-4">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Stethoscope className="w-6 h-6 text-emerald-700" />
                      <span>Health & Medical Disclosure (الإفصاح الصحي والطبي)</span>
                    </h2>
                    <p className="text-xs text-stone-600 mt-1">
                      Complete disclosure allows the screening team to allocate accessible spaces near exits/washrooms.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-sm font-bold text-stone-900 block">
                          Do you have any known chronic conditions or severe allergies?
                        </span>
                        <span className="text-xs text-stone-500">
                          (هل تعاني من أي أمراض مزمنة أو حساسية تتطلب رعاية خاصة؟)
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={hasChronicCondition}
                        onChange={(e) => setHasChronicCondition(e.target.checked)}
                        className="w-5 h-5 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>

                    {hasChronicCondition && (
                      <div className="mt-4 pt-4 border-t border-stone-200 space-y-3">
                        <label className="block text-xs font-semibold text-stone-700">
                          Select all conditions that apply:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {conditionOptions.map((cond) => {
                            const selected = selectedConditions.includes(cond);
                            return (
                              <button
                                key={cond}
                                type="button"
                                onClick={() => toggleCondition(cond)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                  selected
                                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                                }`}
                              >
                                {cond}
                              </button>
                            );
                          })}
                        </div>
                        {errors.conditions && (
                          <p className="text-xs text-red-600">{errors.conditions}</p>
                        )}

                        <div className="mt-3">
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Condition Details & Notes (تفاصيل إضافية)
                          </label>
                          <textarea
                            rows={2}
                            value={conditionDetails}
                            onChange={(e) => setConditionDetails(e.target.value)}
                            placeholder="e.g. Mild asthma triggered by cold; carries inhaler."
                            className="w-full text-xs p-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Current Daily Medications (الأدوية الحالية)
                          </label>
                          <input
                            type="text"
                            value={currentMedications}
                            onChange={(e) => setCurrentMedications(e.target.value)}
                            placeholder="e.g. Ventolin inhaler, Metformin 500mg"
                            className="w-full text-xs px-3.5 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-sm font-bold text-stone-900 block">
                          Mobility Assistance Needed (صعوبة في الحركة أو صعود الدرج)
                        </span>
                        <span className="text-xs text-stone-500">
                          Priority ground-floor space assignment near ablution / restroom facilities.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={mobilityAssistanceNeeded}
                        onChange={(e) => setMobilityAssistanceNeeded(e.target.checked)}
                        className="w-5 h-5 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      Dietary Preferences for Suhur & Iftar Meals (النظام الغذائي للسحور والإفطار)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {dietaryOptions.map((diet) => {
                        const selected = dietaryRestrictions.includes(diet);
                        return (
                          <button
                            key={diet}
                            type="button"
                            onClick={() => toggleDietary(diet)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              selected
                                ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                            }`}
                          >
                            {diet}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 6: SCHEDULE & REVIEW ================= */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-stone-200 pb-4">
                    <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-emerald-700" />
                      <span>Stay Schedule & Application Review (فترة الإقامة والمراجعة)</span>
                    </h2>
                    <p className="text-xs text-stone-600 mt-1">
                      Review your submitted details before finalizing your 1447 AH I’tikāf application.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                    <label className="block text-xs font-bold text-stone-800">
                      Stay Duration (مدة الاعتكاف):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                          stayType === 'full_10_days'
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                            : 'bg-white border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="stayType"
                          checked={stayType === 'full_10_days'}
                          onChange={() => setStayType('full_10_days')}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-stone-900 block">Full 10 Nights (الأيام العشر كاملة)</span>
                          <span className="text-stone-600">
                            20th Ramadan (after Asr) until Eid night. Prioritized space allocation.
                          </span>
                        </div>
                      </label>

                      <label
                        className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                          stayType === 'specific_days'
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                            : 'bg-white border-stone-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="stayType"
                          checked={stayType === 'specific_days'}
                          onChange={() => setStayType('specific_days')}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-stone-900 block">Specific Days (أيام محددة)</span>
                          <span className="text-stone-600">
                            Custom attendance subject to standby availability.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Summary Card with Photo Preview */}
                  <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 border-b border-stone-100 pb-2 flex items-center justify-between">
                      <span>Application Dossier Summary</span>
                      {isReturning && (
                        <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                          ★ Returning Mutakif Verified
                        </span>
                      )}
                    </h3>

                    <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-stone-100 pb-4">
                      <div className="w-16 h-20 rounded-lg border border-stone-300 overflow-hidden bg-stone-100 flex-shrink-0">
                        {passportPhoto ? (
                          <img src={passportPhoto} alt="Passport" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                            No Photo
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs flex-1 w-full">
                        <div>
                          <span className="text-stone-500 font-medium">Full Name:</span>{' '}
                          <span className="font-semibold text-stone-900">{fullName}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 font-medium">Age & Wing:</span>{' '}
                          <span className="font-semibold text-stone-900">
                            {age} yrs • {gender === 'male' ? 'Brothers Wing' : 'Sisters Wing'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500 font-medium">Phone:</span>{' '}
                          <span className="font-semibold text-stone-900">{phone}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 font-medium">ID Number:</span>{' '}
                          <span className="font-semibold font-mono text-stone-900">{idNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs">
                      <div>
                        <span className="text-stone-500 font-medium">Emergency Kin:</span>{' '}
                        <span className="font-semibold text-stone-900">{emergencyName} ({emergencyRelation})</span>
                      </div>
                      <div>
                        <span className="text-stone-500 font-medium">Kin Phone:</span>{' '}
                        <span className="font-semibold text-stone-900">{emergencyPhone}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-stone-500 font-medium">Medical Disclosure:</span>{' '}
                        {hasChronicCondition ? (
                          <span className="text-amber-700 font-semibold">
                            {selectedConditions.join(', ') || 'Declared condition'}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium">No chronic conditions</span>
                        )}
                      </div>
                    </div>

                    {pastRecords.length > 0 && (
                      <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs">
                        <span className="font-bold text-stone-700 block mb-1">
                          Previous Years Record on File:
                        </span>
                        {pastRecords.map((pr, idx) => (
                          <div key={idx} className="text-stone-600 text-[11px]">
                            • {pr.year}: Ref {pr.refCode} ({pr.darName}) — Attended Full Seclusion
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-emerald-950 text-white p-4 rounded-xl flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-amber-300">1447 AH Dār & Space Allocation:</p>
                      <p className="text-emerald-100 mt-0.5">
                        Your application will be routed to the screening committee. Returning participants are prioritized for balanced placement into the 4 Dārs (Abubakar, Umar, Usman, Aliyu).
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-7 py-3 text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Submitting Application...' : 'Submit 1447 AH Registration'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="text-xs text-emerald-800 font-semibold animate-pulse">Loading registration portal...</div>
      </div>
    }>
      <RegisterContent />
    </React.Suspense>
  );
}

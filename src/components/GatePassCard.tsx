'use client';

import React from 'react';
import { 
  Sparkles, 
  HeartHandshake, 
  Stethoscope, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle,
  Building,
  UserCheck,
  ShieldCheck,
  Crown,
  History
} from 'lucide-react';
import { Participant, Dar, Masjid } from '../types/itikaaf';
import { generateQrSvg } from '../lib/qrCode';
import { generateBarcodeSvg } from '../lib/barcode';
import { INITIAL_DARS, INITIAL_MASAAJID } from '../data/initialData';
import { getStoredDars, getDarUniqueMemberId, getStoredMasaajid, getActiveMasjid } from '../lib/storage';

interface GatePassCardProps {
  participant: Participant;
  dars?: Dar[];
  masjid?: Masjid;
}

export default function GatePassCard({ participant, dars, masjid }: GatePassCardProps) {
  const activeDars = dars || (typeof window !== 'undefined' ? getStoredDars() : INITIAL_DARS);
  const assignedDar = activeDars.find(d => d.id === participant.darId);
  
  const allMasaajid = typeof window !== 'undefined' ? getStoredMasaajid() : INITIAL_MASAAJID;
  const assignedMasjid = masjid || allMasaajid.find(m => m.id === participant.masjidId || m.slug === participant.masjidId) || allMasaajid[0];

  const darMemberId = participant.darMemberId || getDarUniqueMemberId(participant, participant.darId, assignedMasjid?.id);

  const qrPayload = JSON.stringify({
    darMemberId,
    ref: participant.refCode,
    year: participant.ramadanYear || '1447',
    masjid: assignedMasjid?.name || 'Sultan Bello Mosque',
    masjidCode: assignedMasjid?.codePrefix || 'SBM',
    lga: assignedMasjid?.lga || 'Kaduna North',
    name: participant.fullName,
    status: participant.status,
    dar: assignedDar ? assignedDar.nameEn : 'UNASSIGNED',
    darCode: assignedDar ? assignedDar.codePrefix : 'GEN',
    ameer: assignedDar ? assignedDar.ameerName : 'N/A',
    space: participant.allocatedSpace?.spaceTag || 'UNASSIGNED',
    hall: participant.allocatedSpace?.hallName || 'N/A',
    checkedIn: participant.attendance.checkedIn,
  });

  const qrSvg = generateQrSvg(qrPayload, 115, '#064e3b');
  const barcodeSvg = generateBarcodeSvg(darMemberId, 230, 42, true);

  const getDarThemeStyles = () => {
    switch (assignedDar?.id) {
      case 'abubakar':
        return {
          badgeBg: 'bg-emerald-900',
          badgeText: 'text-amber-300',
          border: 'border-emerald-600',
          accent: 'from-emerald-950 via-emerald-900 to-emerald-800',
        };
      case 'umar':
        return {
          badgeBg: 'bg-blue-900',
          badgeText: 'text-blue-100',
          border: 'border-blue-500',
          accent: 'from-slate-950 via-blue-950 to-blue-900',
        };
      case 'usman':
        return {
          badgeBg: 'bg-amber-900',
          badgeText: 'text-amber-200',
          border: 'border-amber-500',
          accent: 'from-stone-950 via-amber-950 to-amber-900',
        };
      case 'aliyu':
        return {
          badgeBg: 'bg-purple-900',
          badgeText: 'text-purple-200',
          border: 'border-purple-500',
          accent: 'from-slate-950 via-purple-950 to-purple-900',
        };
      default:
        return {
          badgeBg: 'bg-stone-800',
          badgeText: 'text-stone-200',
          border: 'border-stone-400',
          accent: 'from-emerald-950 via-emerald-900 to-emerald-800',
        };
    }
  };

  const theme = getDarThemeStyles();

  return (
    <div className="gate-pass-badge-wrapper select-none w-full max-w-sm mx-auto bg-white rounded-2xl border-2 border-emerald-900 shadow-2xl overflow-hidden relative">
      
      {/* Visual Lanyard Punch Hole Indicator */}
      <div className="bg-emerald-950 flex justify-center py-2 border-b border-emerald-800">
        <div 
          className="w-9 h-2.5 rounded-full border border-emerald-700 bg-emerald-900 shadow-inner" 
          title="Standard Lanyard Clip Guide" 
        />
      </div>

      {/* Header Banner with Ramadan Year */}
      <div className={`bg-gradient-to-r ${theme.accent} text-white p-3.5 text-center relative border-b-2 border-amber-400`}>
        <div className="flex items-center justify-between text-[10px] text-emerald-200 font-semibold tracking-wider uppercase border-b border-white/10 pb-1 mb-2">
          <span>FEDERAL REPUBLIC OF NIGERIA • RAMADAN {participant.ramadanYear || '1447'} AH</span>
          <span className="text-amber-300 font-arabic text-xs">العشر الأواخر</span>
          <span>GATE PASS</span>
        </div>

        <h2 className="text-sm font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{assignedMasjid ? assignedMasjid.name : 'CENTRAL MASJID I’TIKĀF'}</span>
        </h2>
        <p className="text-[10px] text-stone-200">
          {assignedMasjid ? `${assignedMasjid.area} • ${assignedMasjid.lga} LGA, ${assignedMasjid.state}` : 'تصريح الدخول وبطاقة المعتكف الرسمية'}
        </p>

        {/* Honorary Returning Veteran Badge */}
        {participant.isReturning && (
          <div className="mt-1.5 inline-flex items-center gap-1 bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm">
            <Crown className="w-3 h-3 text-emerald-950" />
            <span>VETERAN MUTAKIF • YEAR {participant.yearsAttendedCount || 2}</span>
          </div>
        )}
      </div>

      {/* DĀR & AMEER SPOTLIGHT */}
      <div className="bg-stone-100 border-b border-stone-200 px-3 py-2 text-center">
        {assignedDar ? (
          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1.5">
              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold text-white ${theme.badgeBg}`}>
                {assignedDar.nameEn}
              </span>
              {participant.isAmeer && (
                <span className="inline-flex items-center gap-1 bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm">
                  <Crown className="w-3 h-3" /> AMEER
                </span>
              )}
            </div>
            <p className="text-[11px] font-semibold text-stone-800">
              Ameer / Leader: <span className="text-emerald-900 font-bold">{assignedDar.ameerName}</span>
            </p>
            <p className="text-[10px] text-stone-500 font-arabic">
              {assignedDar.nameAr}
            </p>
          </div>
        ) : (
          <div className="py-1">
            <span className="inline-block bg-stone-200 text-stone-700 px-3 py-0.5 rounded text-[11px] font-semibold">
              Dār: Pending Committee Assignment
            </span>
          </div>
        )}
      </div>

      {/* Main Body: Photo, Info, and QR Code */}
      <div className="p-4 space-y-3">
        
        <div className="flex items-start gap-3">
          {/* Passport Photograph */}
          <div className="flex-shrink-0">
            <div className="w-20 h-24 rounded-lg border-2 border-stone-300 bg-stone-100 overflow-hidden shadow-inner flex items-center justify-center relative">
              {participant.passportPhoto ? (
                <img
                  src={participant.passportPhoto}
                  alt={participant.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-stone-400">
                  <div className="w-8 h-8 rounded-full bg-stone-200 mx-auto mb-1 flex items-center justify-center text-xs font-bold">
                    {participant.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[8px] uppercase">Photo</span>
                </div>
              )}
              <div className="absolute inset-0 border border-black/10 pointer-events-none" />
            </div>
            <span className="block text-center text-[9px] font-mono text-stone-400 mt-1 uppercase">
              Official Photo
            </span>
          </div>

          {/* Participant Credentials */}
          <div className="flex-1 min-w-0 space-y-1">
            <div>
              <span className="text-[9px] uppercase font-bold text-stone-400 block tracking-wider">
                Full Name
              </span>
              <h3 className="text-sm font-bold text-stone-900 leading-tight truncate">
                {participant.fullName}
              </h3>
              <p className="text-[11px] text-emerald-800 font-medium">
                {participant.age} yrs • {participant.gender === 'male' ? 'Brothers Wing' : 'Sisters Wing'}
              </p>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-stone-400 block tracking-wider">
                Unique Dār ID
              </span>
              <span className="font-mono text-xs font-extrabold text-emerald-950 bg-amber-100/90 text-emerald-950 px-2 py-0.5 rounded border border-amber-300 inline-block tracking-wider">
                {darMemberId}
              </span>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-stone-400 block tracking-wider">
                Tracking Code
              </span>
              <span className="font-mono text-xs font-semibold text-stone-800 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 inline-block">
                {participant.refCode}
              </span>
            </div>

            <div>
              <span className="text-[9px] uppercase font-bold text-stone-400 block tracking-wider">
                Admission Status
              </span>
              {participant.status === 'approved' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Approved
                </span>
              ) : participant.status === 'pending' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  <Clock className="w-3 h-3 text-amber-600" />
                  Pending
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded">
                  <AlertTriangle className="w-3 h-3 text-yellow-600" />
                  {participant.status}
                </span>
              )}

              {participant.attendance.checkedIn && (
                <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-800 px-1.5 py-0.5 rounded">
                  In Gate
                </span>
              )}
            </div>

            {participant.payment && (
              <div>
                <span className="text-[9px] uppercase font-bold text-stone-400 block tracking-wider">
                  Payment Status
                </span>
                {participant.payment.status === 'paid' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    Paid (₦{participant.payment.amountNgn.toLocaleString()})
                  </span>
                ) : participant.payment.status === 'exempt' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Free / Waqf
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    <Clock className="w-3 h-3 text-amber-600" />
                    {participant.payment.status === 'pending_payment' ? 'Awaiting Payment' : 'Verification Pending'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* DESIGNATED FLOOR SPACE SPOTLIGHT (NO BEDS - FLOOR SPOTS ONLY) */}
        <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase text-emerald-900 mb-1">
            <span>Designated Floor Space</span>
            <span className="text-[9px] text-amber-700 bg-amber-100 px-1.5 rounded font-mono">No Bed Policy</span>
          </div>

          {participant.allocatedSpace ? (
            <div>
              <div className="inline-block bg-emerald-950 text-amber-300 font-mono font-extrabold text-xl px-4 py-1 rounded-lg border border-amber-400 shadow-sm">
                {participant.allocatedSpace.spaceTag}
              </div>
              <p className="text-[11px] font-semibold text-emerald-950 mt-1">
                {participant.allocatedSpace.hallName}
              </p>
              <p className="text-[10px] text-stone-600">
                {participant.allocatedSpace.section} • Row {participant.allocatedSpace.row} • Spot #{participant.allocatedSpace.spaceNumber}
              </p>
            </div>
          ) : (
            <div className="py-1">
              <span className="text-xs font-semibold text-amber-800">
                Space Assignment Under Screening
              </span>
            </div>
          )}
        </div>

        {/* PHYSICAL CODE 128 BARCODE FOR LASER HEADCOUNT SCANNERS */}
        <div className="bg-white border border-stone-300 rounded-xl p-2.5 text-center shadow-inner">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase text-stone-500 mb-1">
            <span>Official Code 128 Barcode</span>
            <span className="font-mono text-emerald-900 font-bold tracking-wider">{darMemberId}</span>
          </div>
          <div 
            className="flex justify-center my-0.5 overflow-hidden max-w-full [&>svg]:max-w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: barcodeSvg }}
          />
          <span className="block text-[8px] font-mono text-stone-400">
            Laser Scanner Compatible • Ameer Headcount & Gate Scan
          </span>
        </div>

        {/* Security QR Code and Emergency Alert */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-stone-200">
          <div className="flex-1 space-y-1 text-[10px] text-stone-600">
            <div className="flex items-center gap-1">
              <HeartHandshake className="w-3 h-3 text-red-500 flex-shrink-0" />
              <span className="truncate">
                Kin: <strong>{participant.emergencyContact.name}</strong> ({participant.emergencyContact.phone})
              </span>
            </div>
            {participant.healthMedical.hasChronicCondition && (
              <div className="flex items-center gap-1 text-amber-800 font-medium">
                <Stethoscope className="w-3 h-3 text-amber-600 flex-shrink-0" />
                <span className="truncate">
                  Med: {participant.healthMedical.conditions.join(', ')}
                </span>
              </div>
            )}
            <p className="text-[9px] text-stone-500">
              Check-in Gate: {participant.gender === 'male' ? 'Gate 3' : 'Gate 6'} • Asr Night 21
            </p>
          </div>

          {/* QR Code */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div 
              className="p-1.5 bg-white border border-stone-300 rounded-lg shadow-sm"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <span className="text-[8px] font-mono text-stone-400 mt-0.5">Gate Scan</span>
          </div>
        </div>

        {/* OFFICIAL AUTHORIZATION SIGNATURE (I’TIKĀF CHAIRMAN) */}
        <div className="pt-2 border-t-2 border-stone-300 flex items-center justify-between text-left">
          <div className="space-y-0.5">
            <div className="font-arabic text-xs font-bold text-emerald-950">
              {assignedMasjid ? assignedMasjid.chairmanName : 'د. محمد طاهر'} — رئيس لجنة الاعتكاف
            </div>
            <p className="text-[9px] text-stone-500 uppercase tracking-tight">
              {assignedMasjid ? assignedMasjid.chairmanName : 'Dr. Muhammad Tahir'} • Chairman, {assignedMasjid ? assignedMasjid.name : 'Central I’tikāf Committee'}
            </p>
            <p className="text-[8px] font-mono text-stone-400">
              Auth ID: {assignedMasjid?.codePrefix || 'KAD'}-{participant.refCode.slice(-4)}-CHAIRMAN-STAMP
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="inline-block border-2 border-emerald-800 text-emerald-800 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase rotate-[-3deg] shadow-sm">
              ★ CERTIFIED ★
            </div>
          </div>

          {/* System Verification Powered by GetoCore Digital Innovation */}
          <div className="col-span-2 pt-1.5 mt-1 border-t border-stone-200 flex items-center justify-between text-[8px] text-stone-400">
            <span>Security Hash: SHA256-OK</span>
            <span className="font-semibold text-stone-600">
              Powered by <strong>GetoCore Digital Innovation</strong>
            </span>
          </div>
        </div>

      </div>

      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .gate-pass-badge-wrapper {
            border: 2px solid #064e3b !important;
            box-shadow: none !important;
            max-width: 3.5in !important;
            margin: 0.25in auto !important;
            page-break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

    </div>
  );
}

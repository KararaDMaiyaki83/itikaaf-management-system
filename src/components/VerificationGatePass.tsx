'use client';

import React, { useState } from 'react';
import { 
  Printer, 
  Share2, 
  Check, 
  UserCheck,
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle,
  Building,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { Participant, Dar } from '../types/itikaaf';
import { checkInParticipant, checkOutParticipant, getStoredDars } from '../lib/storage';
import GatePassCard from './GatePassCard';

interface VerificationGatePassProps {
  participant: Participant;
  onParticipantUpdated?: (updated: Participant) => void;
}

export default function VerificationGatePass({
  participant,
  onParticipantUpdated,
}: VerificationGatePassProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [lanyardInput, setLanyardInput] = useState(
    participant.attendance.lanyardTagNumber || `TAG-${participant.gender === 'male' ? 'M' : 'F'}-${participant.allocatedSpace?.spaceNumber || '01'}`
  );
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const dars = typeof window !== 'undefined' ? getStoredDars() : [];
  const assignedDar = dars.find(d => d.id === participant.darId);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/pass?ref=${participant.refCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleGateCheckIn = () => {
    const updated = checkInParticipant(participant.id, lanyardInput.trim() || 'TAG-01', 'Gate Attendant');
    if (updated && onParticipantUpdated) {
      onParticipantUpdated(updated);
    }
    setIsCheckingIn(false);
  };

  const handleGateCheckOut = () => {
    if (confirm(`Log checkout for ${participant.fullName}?`)) {
      const updated = checkOutParticipant(participant.id);
      if (updated && onParticipantUpdated) {
        onParticipantUpdated(updated);
      }
    }
  };

  const getStatusBadge = () => {
    switch (participant.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            APPROVED & CONFIRMED
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            UNDER SCREENING REVIEW
          </span>
        );
      case 'waitlisted':
        return (
          <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-900 border border-yellow-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-700" />
            STANDBY / WAITLISTED
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-900 border border-red-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            APPLICATION DECLINED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar (Hidden in print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge()}
          <span className="text-xs text-stone-500 font-mono">Ref: {participant.refCode}</span>
          {assignedDar && (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-md font-bold">
              {assignedDar.nameEn}
            </span>
          )}
          {participant.payment && participant.payment.status === 'paid' && (
            <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 text-[11px] px-2.5 py-0.5 rounded-md font-bold">
              Paid: ₦{participant.payment.amountNgn.toLocaleString()} ({participant.payment.receiptNumber || 'Verified'})
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-lg transition-colors border border-stone-300 flex-1 sm:flex-initial"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all flex-1 sm:flex-initial"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Print Official ID Badge</span>
          </button>

          {/* Gate Check-in shortcut */}
          {participant.status === 'approved' && !participant.attendance.checkedIn && (
            <button
              onClick={() => setIsCheckingIn(!isCheckingIn)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 px-3.5 py-2 rounded-lg shadow-sm transition-all flex-1 sm:flex-initial"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Gate Check-In</span>
            </button>
          )}

          {participant.attendance.checkedIn && (
            <button
              onClick={handleGateCheckOut}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-red-50 hover:text-red-700 hover:border-red-300 px-3 py-2 rounded-lg transition-colors border border-stone-300 flex-1 sm:flex-initial"
            >
              <span>Log Checkout</span>
            </button>
          )}
        </div>
      </div>

      {/* Gate Check-in Drawer (Hidden in print) */}
      {isCheckingIn && (
        <div className="no-print bg-amber-50 border-2 border-amber-300 rounded-xl p-4 animate-fade-in">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-amber-700" />
            <span>Gate Attendant Check-In Desk (Night 21)</span>
          </h4>
          <p className="text-xs text-amber-800 mt-1">
            Assign the physical lanyard badge number to <strong>{participant.fullName}</strong> before admitting to {assignedDar ? assignedDar.nameEn : 'the Musalla'}.
          </p>
          <div className="mt-3 flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={lanyardInput}
              onChange={(e) => setLanyardInput(e.target.value)}
              placeholder="e.g. TAG-M-08"
              className="text-xs font-mono font-bold px-3 py-2 border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-48"
            />
            <button
              onClick={handleGateCheckIn}
              className="text-xs font-bold bg-emerald-800 text-white px-4 py-2 rounded-lg hover:bg-emerald-900 transition-colors flex-1 sm:flex-initial"
            >
              Confirm Gate Admission
            </button>
            <button
              onClick={() => setIsCheckingIn(false)}
              className="text-xs text-stone-600 hover:text-stone-900 px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Official ID Badge Card (Components/GatePassCard) */}
      <GatePassCard participant={participant} dars={dars} />
    </div>
  );
}

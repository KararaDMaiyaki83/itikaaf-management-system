'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Crown, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  UserCheck, 
  Phone, 
  Building, 
  Sparkles, 
  Scale, 
  Utensils, 
  Moon, 
  Calendar, 
  ShieldCheck, 
  Search, 
  Edit, 
  Plus, 
  Check, 
  X, 
  Layers,
  HeartHandshake
} from 'lucide-react';
import { Participant, Dar, DarId } from '../../../types/itikaaf';
import { 
  getStoredParticipants, 
  getStoredDars, 
  saveDars, 
  assignParticipantDar, 
  appointDarAmeer, 
  autoDistributeApprovedToDars 
} from '../../../lib/storage';

export default function DaarsManagementPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [dars, setDars] = useState<Dar[]>([]);
  const [selectedDarId, setSelectedDarId] = useState<DarId>('abubakar');
  const [searchMember, setSearchMember] = useState('');
  
  // Ameer Appointment Modal
  const [isAmeerModalOpen, setIsAmeerModalOpen] = useState(false);
  const [modalDarTarget, setModalDarTarget] = useState<DarId>('abubakar');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [customAmeerName, setCustomAmeerName] = useState('');
  const [customAmeerPhone, setCustomAmeerPhone] = useState('');

  // Daily Routine Coordination State (Suhur/Iftar & Tahajjud checked state)
  const [routineChecks, setRoutineChecks] = useState<{
    [key: string]: { suhurDistributed: boolean; iftarDistributed: boolean; tahajjudCounted: boolean }
  }>({
    abubakar: { suhurDistributed: true, iftarDistributed: true, tahajjudCounted: true },
    umar: { suhurDistributed: true, iftarDistributed: true, tahajjudCounted: false },
    usman: { suhurDistributed: true, iftarDistributed: false, tahajjudCounted: false },
    aliyu: { suhurDistributed: false, iftarDistributed: false, tahajjudCounted: false },
  });

  const loadData = () => {
    setParticipants(getStoredParticipants());
    setDars(getStoredDars());
  };

  useEffect(() => {
    loadData();
    const handleDataChange = () => loadData();
    window.addEventListener('itikaaf_data_changed', handleDataChange);
    return () => window.removeEventListener('itikaaf_data_changed', handleDataChange);
  }, []);

  const selectedDar = dars.find(d => d.id === selectedDarId) || dars[0];

  // Approved participants belonging to this Dar
  const darMembers = participants.filter(
    p => p.darId === selectedDarId && p.status === 'approved'
  );

  const filteredMembers = darMembers.filter(p =>
    !searchMember ||
    p.fullName.toLowerCase().includes(searchMember.toLowerCase()) ||
    p.phone.includes(searchMember) ||
    (p.allocatedSpace?.spaceTag.toLowerCase().includes(searchMember.toLowerCase()) ?? false)
  );

  // Unassigned approved participants available to be distributed
  const unassignedApproved = participants.filter(
    p => p.status === 'approved' && !p.darId
  );

  const handleAutoBalance = () => {
    if (unassignedApproved.length === 0) {
      alert('All approved participants have already been distributed into Dārs!');
      return;
    }
    const result = autoDistributeApprovedToDars();
    alert(`Successfully distributed ${unassignedApproved.length} approved mutakifin across the 4 Dārs evenly!`);
    loadData();
  };

  const handleMoveMember = (participantId: string, targetDarId: DarId) => {
    assignParticipantDar(participantId, targetDarId);
    loadData();
  };

  const openAmeerModal = (darId: DarId) => {
    setModalDarTarget(darId);
    const targetDar = dars.find(d => d.id === darId);
    if (targetDar) {
      setCustomAmeerName(targetDar.ameerName);
      setCustomAmeerPhone(targetDar.ameerPhone);
      setSelectedCandidateId(targetDar.ameerParticipantId || '');
    }
    setIsAmeerModalOpen(true);
  };

  const handleSaveAmeer = () => {
    if (selectedCandidateId) {
      const candidate = participants.find(p => p.id === selectedCandidateId);
      if (candidate) {
        appointDarAmeer(modalDarTarget, candidate.id, candidate.fullName, candidate.phone);
      }
    } else if (customAmeerName.trim()) {
      appointDarAmeer(modalDarTarget, '', customAmeerName.trim(), customAmeerPhone.trim());
    }
    setIsAmeerModalOpen(false);
    loadData();
  };

  const toggleRoutine = (darId: string, key: 'suhurDistributed' | 'iftarDistributed' | 'tahajjudCounted') => {
    setRoutineChecks(prev => ({
      ...prev,
      [darId]: {
        ...prev[darId],
        [key]: !prev[darId][key],
      },
    }));
  };

  return (
    <div className="min-h-screen bg-stone-50 py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-semibold mb-1 border border-amber-200">
              <Crown className="w-3.5 h-3.5 text-amber-700" />
              <span>Chairman Oversight Panel • نظام الدور الأربعة</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 tracking-tight">
              Dār Management & Coordination
            </h1>
            <p className="text-xs text-stone-600 mt-0.5">
              Balanced distribution across Dār Abubakar, Umar, Usman, and Aliyu, Ameer supervision, and daily routines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleAutoBalance}
              disabled={unassignedApproved.length === 0}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex-1 sm:flex-initial ${
                unassignedApproved.length > 0
                  ? 'bg-amber-400 hover:bg-amber-300 text-emerald-950 ring-2 ring-amber-300'
                  : 'bg-stone-200 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Auto-Balance ({unassignedApproved.length} Unassigned)</span>
            </button>

            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-900 hover:bg-emerald-950 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex-1 sm:flex-initial"
            >
              <span>← Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* ================= 4 DĀRS BIRD'S-EYE VIEW CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dars.map((dar) => {
            const members = participants.filter(p => p.darId === dar.id && p.status === 'approved');
            const inGate = members.filter(p => p.attendance.checkedIn).length;
            const isSelected = selectedDarId === dar.id;
            const targetCap = dar.capacityTarget || 50;
            const percentage = Math.min(100, Math.round((members.length / targetCap) * 100));

            return (
              <div
                key={dar.id}
                onClick={() => setSelectedDarId(dar.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-700 shadow-lg ring-4 ring-emerald-100'
                    : 'border-stone-200 hover:border-stone-300 shadow-sm'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    dar.id === 'abubakar' ? 'bg-emerald-100 text-emerald-900' :
                    dar.id === 'umar' ? 'bg-blue-100 text-blue-900' :
                    dar.id === 'usman' ? 'bg-amber-100 text-amber-900' :
                    'bg-purple-100 text-purple-900'
                  }`}>
                    {dar.nameEn}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] bg-emerald-800 text-amber-300 font-bold px-2 py-0.5 rounded-md">
                      ACTIVE VIEW
                    </span>
                  )}
                </div>

                <div className="font-arabic text-xs font-semibold text-stone-500 mb-2 truncate">
                  {dar.nameAr}
                </div>

                {/* Ameer Info */}
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-500" />
                      Appointed Ameer
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAmeerModal(dar.id);
                      }}
                      className="text-[10px] text-emerald-700 hover:underline font-bold"
                    >
                      Change
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 mt-1 truncate">
                    {dar.ameerName}
                  </h4>
                  <p className="text-[11px] font-mono text-stone-500">{dar.ameerPhone}</p>
                </div>

                {/* Capacity Balance Meter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500 font-medium">Headcount:</span>
                    <span className="font-bold text-stone-900">
                      {members.length} <span className="text-stone-400 font-normal">/ {targetCap} cap</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-500 pt-0.5">
                    <span>Gate Present: {inGate}</span>
                    <span>{percentage}% Full</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* ================= DAILY ROUTINE COORDINATION PANEL ================= */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-600" />
                <span>Daily Routine Coordination (التنسيق اليومي للدور الأربعة)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Suhur and Iftar meals distributed Dār-by-Dār via Ameers. Tahajjud headcounts reported to Chairman.
              </p>
            </div>
            <div className="text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 font-medium">
              Night of 21 Ramadan Coordination Active
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {dars.map((dar) => {
              const checks = routineChecks[dar.id] || { suhurDistributed: false, iftarDistributed: false, tahajjudCounted: false };
              return (
                <div key={dar.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900">{dar.nameEn}</span>
                    <span className="text-[10px] text-stone-500 font-mono">Ameer: {dar.ameerName.split(' ')[1]}</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <label 
                      onClick={() => toggleRoutine(dar.id, 'suhurDistributed')}
                      className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded hover:bg-white transition-colors"
                    >
                      <span className="text-stone-700">Suhur Distribution</span>
                      <input
                        type="checkbox"
                        checked={checks.suhurDistributed}
                        onChange={() => {}}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                    </label>

                    <label 
                      onClick={() => toggleRoutine(dar.id, 'iftarDistributed')}
                      className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded hover:bg-white transition-colors"
                    >
                      <span className="text-stone-700">Iftar Distribution</span>
                      <input
                        type="checkbox"
                        checked={checks.iftarDistributed}
                        onChange={() => {}}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                    </label>

                    <label 
                      onClick={() => toggleRoutine(dar.id, 'tahajjudCounted')}
                      className="flex items-center justify-between text-xs cursor-pointer p-1.5 rounded hover:bg-white transition-colors"
                    >
                      <span className="text-stone-700">Tahajjud & Halqah Check</span>
                      <input
                        type="checkbox"
                        checked={checks.tahajjudCounted}
                        onChange={() => {}}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= SELECTED DĀR MEMBER ROSTER ================= */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          
          {/* Roster Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 bg-stone-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900">
                  {selectedDar?.nameEn} — Member Roster
                </h2>
                <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {darMembers.length} Members
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Leader / Ameer: <strong>{selectedDar?.ameerName}</strong> ({selectedDar?.ameerPhone}) • {selectedDar?.notes}
              </p>
            </div>

            <div className="w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  placeholder="Search members in this Dār..."
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-100 text-stone-600 uppercase text-[10px] font-bold border-b border-stone-200 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Tracking Code</th>
                  <th className="px-4 py-3">Floor Space #</th>
                  <th className="px-4 py-3">Emergency Contact</th>
                  <th className="px-4 py-3">Medical Note</th>
                  <th className="px-4 py-3">Gate Status</th>
                  <th className="px-4 py-3 text-right">Reassign Dār</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-stone-500">
                      No members found in {selectedDar?.nameEn} matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                      
                      {/* Name & Photo */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-10 rounded border border-stone-300 bg-stone-100 overflow-hidden flex-shrink-0">
                            {p.passportPhoto ? (
                              <img src={p.passportPhoto} alt={p.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">
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
                              {p.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tracking Code */}
                      <td className="px-4 py-3 font-mono font-semibold text-stone-800">
                        {p.refCode}
                      </td>

                      {/* Floor Space Spot */}
                      <td className="px-4 py-3">
                        {p.allocatedSpace ? (
                          <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {p.allocatedSpace.spaceTag}
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                            Pending Space
                          </span>
                        )}
                      </td>

                      {/* Emergency Kin */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <span className="font-medium text-stone-900 block">{p.emergencyContact.name}</span>
                          <span className="text-[10px] text-stone-500 font-mono">{p.emergencyContact.phone}</span>
                        </div>
                      </td>

                      {/* Medical */}
                      <td className="px-4 py-3">
                        {p.healthMedical.hasChronicCondition ? (
                          <span className="text-red-700 font-semibold text-[11px]">
                            {p.healthMedical.conditions.join(', ')}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">None</span>
                        )}
                      </td>

                      {/* Gate Attendance */}
                      <td className="px-4 py-3">
                        {p.attendance.checkedIn ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Checked In
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">Awaiting Gate</span>
                        )}
                      </td>

                      {/* Reassign Dār Dropdown */}
                      <td className="px-4 py-3 text-right">
                        <select
                          value={p.darId}
                          onChange={(e) => handleMoveMember(p.id, e.target.value as DarId)}
                          className="text-[11px] p-1.5 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="abubakar">Move to Abubakar</option>
                          <option value="umar">Move to Umar</option>
                          <option value="usman">Move to Usman</option>
                          <option value="aliyu">Move to Aliyu</option>
                        </select>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* ================= AMEER APPOINTMENT MODAL ================= */}
        {isAmeerModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span>Appoint Ameer for {dars.find(d => d.id === modalDarTarget)?.nameEn}</span>
                </h3>
                <button
                  onClick={() => setIsAmeerModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-stone-600">
                  Select an approved, experienced participant to serve as the Leader (Ameer) of this Dār, or enter details manually:
                </p>

                {/* Candidate Selector */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Select from Approved Mutakifin in this Dār:
                  </label>
                  <select
                    value={selectedCandidateId}
                    onChange={(e) => {
                      setSelectedCandidateId(e.target.value);
                      const found = participants.find(p => p.id === e.target.value);
                      if (found) {
                        setCustomAmeerName(found.fullName);
                        setCustomAmeerPhone(found.phone);
                      }
                    }}
                    className="w-full p-2.5 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="">-- Choose Candidate or Enter Below --</option>
                    {participants
                      .filter(p => p.status === 'approved' && (!p.darId || p.darId === modalDarTarget))
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          {c.fullName} ({c.phone})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Ameer Full Name:</label>
                    <input
                      type="text"
                      value={customAmeerName}
                      onChange={(e) => setCustomAmeerName(e.target.value)}
                      placeholder="e.g. Sheikh Ahmad Abubakar"
                      className="w-full p-2 rounded-lg border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Ameer Phone / WhatsApp:</label>
                    <input
                      type="text"
                      value={customAmeerPhone}
                      onChange={(e) => setCustomAmeerPhone(e.target.value)}
                      placeholder="+1 (555) 111-0001"
                      className="w-full p-2 rounded-lg border border-stone-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAmeerModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAmeer}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900"
                >
                  Confirm & Appoint Ameer
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

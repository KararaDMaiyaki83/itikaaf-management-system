import { 
  Participant, 
  SpaceAllocation, 
  ApplicationStatus, 
  Dar, 
  DarId, 
  PastParticipationRecord,
  HeadcountSession,
  HeadcountRecord,
  Masjid,
  MasjidSubscription,
  MasjidPaymentConfig,
  ParticipantPayment,
  KadunaLGA,
  MasjidAdmin,
  MasjidAdminRole
} from '../types/itikaaf';
import { INITIAL_PARTICIPANTS, INITIAL_DARS, INITIAL_MASAAJID } from '../data/initialData';

const PARTICIPANTS_STORAGE_KEY = 'itikaaf_participants_v5';
const DARS_STORAGE_KEY = 'itikaaf_dars_v5';
const HEADCOUNT_STORAGE_KEY = 'itikaaf_headcount_records_v5';
const MASAAJID_STORAGE_KEY = 'itikaaf_masaajid_v5';
const ACTIVE_MASJID_STORAGE_KEY = 'itikaaf_active_masjid_id_v5';
export const CURRENT_RAMADAN_YEAR = '1447';

export function getStoredParticipants(): Participant[] {
  if (typeof window === 'undefined') {
    return INITIAL_PARTICIPANTS;
  }
  try {
    const raw = localStorage.getItem(PARTICIPANTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(INITIAL_PARTICIPANTS));
      return INITIAL_PARTICIPANTS;
    }
    const parsed: Participant[] = JSON.parse(raw);
    let needsSave = false;
    // Check if newly seeded participants exist
    INITIAL_PARTICIPANTS.forEach(ip => {
      if (!parsed.some(p => p.id === ip.id || p.refCode === ip.refCode)) {
        parsed.push(ip);
        needsSave = true;
      }
    });
    // Ensure participant payments have calculated splits
    parsed.forEach(p => {
      if (p.payment && p.payment.amountNgn > 0 && p.payment.platformFeeNgn === undefined) {
        const pct = p.payment.platformFeePercentage ?? 10;
        p.payment.platformFeePercentage = pct;
        p.payment.platformFeeNgn = Math.round((p.payment.amountNgn * pct) / 100);
        p.payment.mosqueAmountNgn = p.payment.amountNgn - p.payment.platformFeeNgn;
        needsSave = true;
      }
    });
    if (needsSave) {
      localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error('Failed reading participants from localStorage', err);
    return INITIAL_PARTICIPANTS;
  }
}

export function saveParticipants(participants: Participant[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(participants));
    window.dispatchEvent(new Event('itikaaf_data_changed'));
  } catch (err) {
    console.error('Failed saving participants to localStorage', err);
  }
}

export function getStoredDars(): Dar[] {
  if (typeof window === 'undefined') {
    return INITIAL_DARS;
  }
  try {
    const raw = localStorage.getItem(DARS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DARS_STORAGE_KEY, JSON.stringify(INITIAL_DARS));
      return INITIAL_DARS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading Dars from localStorage', err);
    return INITIAL_DARS;
  }
}

export function saveDars(dars: Dar[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DARS_STORAGE_KEY, JSON.stringify(dars));
    window.dispatchEvent(new Event('itikaaf_data_changed'));
  } catch (err) {
    console.error('Failed saving Dars to localStorage', err);
  }
}

export function getStoredMasaajid(): Masjid[] {
  if (typeof window === 'undefined') {
    return INITIAL_MASAAJID;
  }
  try {
    const raw = localStorage.getItem(MASAAJID_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MASAAJID_STORAGE_KEY, JSON.stringify(INITIAL_MASAAJID));
      return INITIAL_MASAAJID;
    }
    const parsed: Masjid[] = JSON.parse(raw);
    let needsSave = false;
    // Check for any initial mosques missing in storage
    INITIAL_MASAAJID.forEach(im => {
      if (!parsed.some(p => p.id === im.id || p.slug === im.slug)) {
        parsed.push(im);
        needsSave = true;
      }
    });
    parsed.forEach(m => {
      if (m.paymentConfig && m.paymentConfig.platformFeePercentage === undefined) {
        m.paymentConfig.platformFeePercentage = 10;
        m.paymentConfig.platformSettlementBank = 'Jaiz Bank';
        m.paymentConfig.platformSettlementAccount = '0010998822';
        m.paymentConfig.platformSettlementAccountName = 'GetoCore Digital Innovation Ltd - Platform Settlement';
        needsSave = true;
      }
    });
    if (needsSave) {
      localStorage.setItem(MASAAJID_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error('Failed reading Masaajid from localStorage', err);
    return INITIAL_MASAAJID;
  }
}

export function saveMasaajid(masaajid: Masjid[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MASAAJID_STORAGE_KEY, JSON.stringify(masaajid));
    window.dispatchEvent(new Event('itikaaf_masaajid_changed'));
    window.dispatchEvent(new Event('itikaaf_data_changed'));
  } catch (err) {
    console.error('Failed saving Masaajid to localStorage', err);
  }
}

export function getMasjidById(id: string): Masjid | undefined {
  const all = getStoredMasaajid();
  return all.find(m => m.id === id || m.slug === id);
}

export function getMasjidBySlug(slug: string): Masjid | undefined {
  const all = getStoredMasaajid();
  return all.find(m => m.slug === slug || m.id === slug);
}

export function getMasaajidByState(state: string): Masjid[] {
  const all = getStoredMasaajid();
  return all.filter(m => m.state.toLowerCase() === state.toLowerCase());
}

export function getMasaajidByStateAndLga(state: string, lga: string): Masjid[] {
  const all = getStoredMasaajid();
  return all.filter(m => 
    m.state.toLowerCase() === state.toLowerCase() && 
    m.lga.toLowerCase() === lga.toLowerCase()
  );
}

export function getMasaajidByLga(lga: string): Masjid[] {
  const all = getStoredMasaajid();
  return all.filter(m => m.lga === lga);
}

export function getActiveMasjidId(): string {
  if (typeof window === 'undefined') return 'sultan-bello';
  try {
    return localStorage.getItem(ACTIVE_MASJID_STORAGE_KEY) || 'sultan-bello';
  } catch {
    return 'sultan-bello';
  }
}

export function setActiveMasjidId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_MASJID_STORAGE_KEY, id);
    window.dispatchEvent(new Event('itikaaf_active_masjid_changed'));
    window.dispatchEvent(new Event('itikaaf_data_changed'));
  } catch (err) {
    console.error('Failed setting active masjid', err);
  }
}

export function getActiveMasjid(): Masjid {
  const activeId = getActiveMasjidId();
  const all = getStoredMasaajid();
  return all.find(m => m.id === activeId || m.slug === activeId) || all[0] || INITIAL_MASAAJID[0];
}

export function addMasjid(masjid: Masjid): void {
  const all = getStoredMasaajid();
  const exists = all.some(m => m.id === masjid.id || m.slug === masjid.slug);
  if (exists) {
    throw new Error(`A Masjid with ID "${masjid.id}" or slug "${masjid.slug}" already exists.`);
  }
  const updated = [masjid, ...all];
  saveMasaajid(updated);
}

export function updateMasjidSubscription(
  masjidId: string,
  subscriptionUpdate: Partial<MasjidSubscription>
): Masjid | undefined {
  const all = getStoredMasaajid();
  const index = all.findIndex(m => m.id === masjidId || m.slug === masjidId);
  if (index === -1) return undefined;

  all[index].subscription = {
    ...all[index].subscription,
    ...subscriptionUpdate,
  };
  saveMasaajid(all);
  return all[index];
}

export function updateMasjidPaymentConfig(
  masjidId: string,
  paymentConfig: MasjidPaymentConfig
): Masjid | undefined {
  const all = getStoredMasaajid();
  const index = all.findIndex(m => m.id === masjidId || m.slug === masjidId);
  if (index === -1) return undefined;

  all[index].paymentConfig = paymentConfig;
  saveMasaajid(all);
  return all[index];
}

// Mosque Admin Management
export function getMasjidAdmins(masjidId: string): MasjidAdmin[] {
  const masjid = getMasjidById(masjidId);
  return masjid?.admins || [];
}

export function assignMasjidAdmin(
  masjidId: string,
  adminData: Omit<MasjidAdmin, 'id' | 'assignedAt' | 'masjidId'> & { masjidId?: string }
): MasjidAdmin {
  const all = getStoredMasaajid();
  const index = all.findIndex(m => m.id === masjidId || m.slug === masjidId);
  if (index === -1) {
    throw new Error(`Masjid with ID "${masjidId}" not found.`);
  }

  const targetMasjid = all[index];
  const newAdmin: MasjidAdmin = {
    id: `adm-${targetMasjid.codePrefix.toLowerCase()}-${Date.now().toString().slice(-4)}`,
    masjidId: targetMasjid.id,
    fullName: adminData.fullName,
    email: adminData.email,
    phone: adminData.phone,
    role: adminData.role,
    accessPin: adminData.accessPin || Math.floor(1000 + Math.random() * 9000).toString(),
    status: adminData.status || 'active',
    assignedAt: new Date().toISOString(),
    notes: adminData.notes,
  };

  const currentAdmins = targetMasjid.admins || [];
  targetMasjid.admins = [...currentAdmins, newAdmin];
  saveMasaajid(all);
  return newAdmin;
}

export function removeMasjidAdmin(masjidId: string, adminId: string): boolean {
  const all = getStoredMasaajid();
  const index = all.findIndex(m => m.id === masjidId || m.slug === masjidId);
  if (index === -1) return false;

  const targetMasjid = all[index];
  if (!targetMasjid.admins) return false;

  const initialCount = targetMasjid.admins.length;
  targetMasjid.admins = targetMasjid.admins.filter(a => a.id !== adminId);
  if (targetMasjid.admins.length !== initialCount) {
    saveMasaajid(all);
    return true;
  }
  return false;
}

export function updateMasjidAdminStatus(
  masjidId: string,
  adminId: string,
  status: 'active' | 'suspended'
): boolean {
  const all = getStoredMasaajid();
  const index = all.findIndex(m => m.id === masjidId || m.slug === masjidId);
  if (index === -1) return false;

  const targetMasjid = all[index];
  if (!targetMasjid.admins) return false;

  const admin = targetMasjid.admins.find(a => a.id === adminId);
  if (!admin) return false;

  admin.status = status;
  saveMasaajid(all);
  return true;
}

// Generate unique ID per Dār with Masjid Prefix (e.g. SBM-ABK-1447-0101, ASD-UMR-1447-0204)
export function getDarUniqueMemberId(
  participant: Participant, 
  darId?: DarId,
  masjidId?: string
): string {
  const dId = darId || participant.darId;
  const suffix = participant.refCode.split('-').pop() || '0000';
  const year = participant.ramadanYear || CURRENT_RAMADAN_YEAR;

  const mId = masjidId || participant.masjidId || getActiveMasjidId();
  const masaajid = getStoredMasaajid();
  const masjid = masaajid.find(m => m.id === mId || m.slug === mId);
  const masjidCode = masjid ? masjid.codePrefix : 'SBM';

  let darCode = 'ABK';
  switch (dId) {
    case 'abubakar': darCode = 'ABK'; break;
    case 'umar': darCode = 'UMR'; break;
    case 'usman': darCode = 'USM'; break;
    case 'aliyu': darCode = 'ALY'; break;
    default: darCode = 'GEN'; break;
  }

  return `${masjidCode}-${darCode}-${year}-${suffix}`;
}

export function getParticipantByRef(refCode: string): Participant | undefined {
  const all = getStoredParticipants();
  const normalized = refCode.trim().toUpperCase();
  return all.find(p => 
    p.refCode.toUpperCase() === normalized || 
    (p.darMemberId && p.darMemberId.toUpperCase() === normalized)
  );
}

export function getParticipantByPhone(phone: string): Participant | undefined {
  const all = getStoredParticipants();
  const clean = phone.replace(/[^0-9]/g, '');
  if (!clean) return undefined;
  return all.find(p => p.phone.replace(/[^0-9]/g, '').includes(clean));
}

// FIND PARTICIPANT BY ANY SCANNED BARCODE (Unique Dār ID, Ref Code, QR payload, Phone)
export function findParticipantByBarcode(rawScan: string): Participant | undefined {
  const all = getStoredParticipants();
  const trimmed = rawScan.trim();

  // Try parsing JSON if from QR code
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.darMemberId) {
        const byDarId = all.find(p => p.darMemberId === parsed.darMemberId);
        if (byDarId) return byDarId;
      }
      if (parsed.ref) {
        const byRef = all.find(p => p.refCode === parsed.ref);
        if (byRef) return byRef;
      }
    } catch {
      // Fall through to string match
    }
  }

  const cleanUpper = trimmed.toUpperCase();

  // 1. Direct Dār Member ID match (e.g. ABK-1447-0101)
  const byDar = all.find(p => p.darMemberId && p.darMemberId.toUpperCase() === cleanUpper);
  if (byDar) return byDar;

  // 2. Ref Code match (e.g. ITK-2026-0101)
  const byRef = all.find(p => p.refCode.toUpperCase() === cleanUpper);
  if (byRef) return byRef;

  // 3. National ID match
  const byNid = all.find(p => p.idVerification.idNumber.toUpperCase() === cleanUpper);
  if (byNid) return byNid;

  // 4. Phone number match
  const digitsOnly = trimmed.replace(/[^0-9]/g, '');
  if (digitsOnly.length >= 7) {
    const byPhone = all.find(p => p.phone.replace(/[^0-9]/g, '').includes(digitsOnly));
    if (byPhone) return byPhone;
  }

  return undefined;
}

export function findReturningMutakif(query: string): Participant | undefined {
  return findParticipantByBarcode(query);
}

export function addParticipant(participant: Participant): void {
  const all = getStoredParticipants();
  if (participant.darId && !participant.darMemberId) {
    participant.darMemberId = getDarUniqueMemberId(participant, participant.darId);
  }
  const updated = [participant, ...all];
  saveParticipants(updated);
}

export function updateParticipantStatus(
  id: string,
  status: ApplicationStatus,
  notes?: string
): Participant | undefined {
  const all = getStoredParticipants();
  const index = all.findIndex(p => p.id === id);
  if (index === -1) return undefined;

  all[index].status = status;
  if (notes !== undefined) {
    all[index].statusNotes = notes;
  }
  all[index].updatedAt = new Date().toISOString();
  saveParticipants(all);
  return all[index];
}

export function updateParticipantPayment(
  participantId: string,
  payment: ParticipantPayment
): Participant | undefined {
  const all = getStoredParticipants();
  const index = all.findIndex(p => p.id === participantId);
  if (index === -1) return undefined;

  all[index].payment = payment;
  all[index].updatedAt = new Date().toISOString();
  saveParticipants(all);
  return all[index];
}

export function assignParticipantSpace(
  id: string,
  space: SpaceAllocation
): Participant | undefined {
  const all = getStoredParticipants();
  const index = all.findIndex(p => p.id === id);
  if (index === -1) return undefined;

  all[index].allocatedSpace = space;
  all[index].updatedAt = new Date().toISOString();
  saveParticipants(all);
  return all[index];
}

export function assignParticipantDar(
  participantId: string,
  darId: DarId | undefined
): Participant | undefined {
  const all = getStoredParticipants();
  const index = all.findIndex(p => p.id === participantId);
  if (index === -1) return undefined;

  all[index].darId = darId;
  if (darId) {
    all[index].darMemberId = getDarUniqueMemberId(all[index], darId);
  }
  all[index].updatedAt = new Date().toISOString();
  saveParticipants(all);
  return all[index];
}

export function appointDarAmeer(
  darId: DarId,
  participantId: string,
  ameerName: string,
  ameerPhone: string
): void {
  const dars = getStoredDars();
  const darIndex = dars.findIndex(d => d.id === darId);
  if (darIndex !== -1) {
    dars[darIndex].ameerName = ameerName;
    dars[darIndex].ameerPhone = ameerPhone;
    dars[darIndex].ameerParticipantId = participantId;
    saveDars(dars);
  }

  const participants = getStoredParticipants();
  participants.forEach(p => {
    if (p.darId === darId) {
      p.isAmeer = (p.id === participantId);
    }
  });
  saveParticipants(participants);
}

export function autoDistributeApprovedToDars(): { [key in DarId]: number } {
  const participants = getStoredParticipants();
  const dars: DarId[] = ['abubakar', 'umar', 'usman', 'aliyu'];

  const counts: { [key in DarId]: number } = {
    abubakar: 0,
    umar: 0,
    usman: 0,
    aliyu: 0,
  };

  participants.forEach(p => {
    if (p.status === 'approved' && p.darId && counts[p.darId] !== undefined) {
      counts[p.darId]++;
    }
  });

  participants.forEach(p => {
    if (p.status === 'approved' && !p.darId) {
      let minDar: DarId = 'abubakar';
      let minCount = Infinity;
      for (const d of dars) {
        if (counts[d] < minCount) {
          minCount = counts[d];
          minDar = d;
        }
      }
      p.darId = minDar;
      p.darMemberId = getDarUniqueMemberId(p, minDar);
      counts[minDar]++;
      p.updatedAt = new Date().toISOString();
    }
  });

  saveParticipants(participants);
  return counts;
}

export function checkInParticipant(
  id: string,
  lanyardTagNumber: string,
  officerName: string = 'Gate Officer'
): Participant | undefined {
  const all = getStoredParticipants();
  const index = all.findIndex(p => p.id === id);
  if (index === -1) return undefined;

  all[index].attendance = {
    checkedIn: true,
    checkedInAt: new Date().toISOString(),
    checkedInBy: officerName,
    lanyardTagIssued: true,
    lanyardTagNumber,
    checkedOut: false,
  };
  all[index].updatedAt = new Date().toISOString();
  saveParticipants(all);
  return all[index];
}

export function checkOutParticipant(id: string): Participant | undefined {
  const all = getStoredParticipants();
  const index = all.findIndex(p => p.id === id);
  if (index === -1) return undefined;

  all[index].attendance.checkedOut = true;
  all[index].attendance.checkedOutAt = new Date().toISOString();
  all[index].updatedAt = new Date().toISOString();
  saveParticipants(all);
  return all[index];
}

// =========================================================================
// HEADCOUNT SCANNING SYSTEM (BARCODE & QR HEADCOUNTS PER DĀR)
// =========================================================================

export function getStoredHeadcountRecords(): HeadcountRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HEADCOUNT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading headcount records', err);
    return [];
  }
}

export function saveHeadcountRecords(records: HeadcountRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HEADCOUNT_STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event('itikaaf_headcount_changed'));
  } catch (err) {
    console.error('Error saving headcount records', err);
  }
}

export function recordHeadcountScan(
  participant: Participant,
  session: HeadcountSession,
  scannedBy: string = 'Ameer / Officer'
): { success: boolean; message: string; record?: HeadcountRecord; alreadyRecorded?: boolean } {
  if (!participant.darId) {
    return {
      success: false,
      message: `${participant.fullName} is not yet assigned to any Dār. Please assign them first.`,
    };
  }

  const records = getStoredHeadcountRecords();
  const today = new Date().toISOString().split('T')[0];

  // Check if already scanned today for this session
  const existing = records.find(
    r => r.participantId === participant.id && r.session === session && r.dateKey === today
  );

  if (existing) {
    return {
      success: true,
      alreadyRecorded: true,
      message: `${participant.fullName} (${existing.darMemberId}) was already counted for ${session.toUpperCase()} today at ${new Date(existing.timestamp).toLocaleTimeString()}.`,
      record: existing,
    };
  }

  const darMemberId = participant.darMemberId || getDarUniqueMemberId(participant);

  const newRecord: HeadcountRecord = {
    id: `hc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    masjidId: participant.masjidId || getActiveMasjidId(),
    participantId: participant.id,
    participantName: participant.fullName,
    darId: participant.darId,
    darMemberId,
    spaceTag: participant.allocatedSpace?.spaceTag,
    session,
    dateKey: today,
    timestamp: new Date().toISOString(),
    scannedBy,
  };

  const updated = [newRecord, ...records];
  saveHeadcountRecords(updated);

  return {
    success: true,
    alreadyRecorded: false,
    message: `✓ Headcount Confirmed! ${participant.fullName} (${darMemberId}) counted for ${session.toUpperCase()}.`,
    record: newRecord,
  };
}

export function resetToDefaultData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(INITIAL_PARTICIPANTS));
  localStorage.setItem(DARS_STORAGE_KEY, JSON.stringify(INITIAL_DARS));
  localStorage.setItem(MASAAJID_STORAGE_KEY, JSON.stringify(INITIAL_MASAAJID));
  localStorage.setItem(ACTIVE_MASJID_STORAGE_KEY, 'sultan-bello');
  localStorage.removeItem(HEADCOUNT_STORAGE_KEY);
  window.dispatchEvent(new Event('itikaaf_data_changed'));
  window.dispatchEvent(new Event('itikaaf_headcount_changed'));
  window.dispatchEvent(new Event('itikaaf_masaajid_changed'));
  window.dispatchEvent(new Event('itikaaf_active_masjid_changed'));
}

export type Gender = 'male' | 'female';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'waitlisted';

export type StayType = 'full_10_days' | 'specific_days';

export type IdType = 'national_id' | 'voter_card' | 'passport' | 'drivers_license';

export type DarId = 'abubakar' | 'umar' | 'usman' | 'aliyu';

export type HeadcountSession = 'suhur' | 'iftar' | 'tahajjud' | 'halqah' | 'gate';

export type NigerianState =
  | 'Abia'
  | 'Adamawa'
  | 'Akwa Ibom'
  | 'Anambra'
  | 'Bauchi'
  | 'Bayelsa'
  | 'Benue'
  | 'Borno'
  | 'Cross River'
  | 'Delta'
  | 'Ebonyi'
  | 'Edo'
  | 'Ekiti'
  | 'Enugu'
  | 'FCT - Abuja'
  | 'Gombe'
  | 'Imo'
  | 'Jigawa'
  | 'Kaduna'
  | 'Kano'
  | 'Katsina'
  | 'Kebbi'
  | 'Kogi'
  | 'Kwara'
  | 'Lagos'
  | 'Nasarawa'
  | 'Niger'
  | 'Ogun'
  | 'Ondo'
  | 'Osun'
  | 'Oyo'
  | 'Plateau'
  | 'Rivers'
  | 'Sokoto'
  | 'Taraba'
  | 'Yobe'
  | 'Zamfara';

export type KadunaLGA =
  | 'Kaduna North'
  | 'Kaduna South'
  | 'Igabi'
  | 'Chikun'
  | 'Zaria'
  | 'Sabon Gari'
  | 'Giwa'
  | 'Birnin Gwari'
  | 'Makarfi'
  | 'Kudan'
  | 'Soba'
  | 'Ikara'
  | 'Kubau'
  | 'Kauru'
  | 'Lere'
  | 'Jaba'
  | "Jema'a"
  | 'Kachia'
  | 'Kagarko'
  | 'Kajuru'
  | 'Kaura'
  | 'Sanga'
  | 'Zangon Kataf';

export interface MasjidSubscription {
  status: 'active' | 'trial' | 'expired' | 'pending';
  planTier: 'standard' | 'premium' | 'unlimited';
  validUntilYear: string; // e.g. "1447"
  annualFeePaid?: boolean;
  subscribedAt: string;
}

export type PaymentTiming = 
  | 'pay_after_screening'   // Mosque screens first; applicant pays only once approved to collect pass
  | 'pay_with_registration'  // Applicant pays upfront when registering
  | 'free_waqf';            // Completely free / Waqf sponsored (voluntary Sadaqah optional)

export type PaymentGatewayProvider = 
  | 'bank_transfer' 
  | 'paystack' 
  | 'flutterwave' 
  | 'free_waqf';

export interface MasjidPaymentConfig {
  bankName: string; // e.g. "Jaiz Bank", "Taj Bank", "Lotus Bank", "Stanbic IBTC"
  accountNumber: string; // 10-digit NUBAN
  accountName: string; // e.g. "Sultan Bello Mosque I'tikaf Committee"
  gatewayProvider: PaymentGatewayProvider;
  paymentTiming: PaymentTiming;
  registrationFeeNgn: number; // 0 for free
  currency: 'NGN';
  instructions?: string;
  // Platform Commission & Revenue-Sharing (Powered by GetoCore Digital Innovation)
  platformFeePercentage: number; // e.g. 10 for 10%, 7.5 for 7.5%, 5 for 5%
  platformSettlementBank?: string; // e.g. "Jaiz Bank"
  platformSettlementAccount?: string; // e.g. "0010998822"
  platformSettlementAccountName?: string; // "GetoCore Digital Innovation Ltd - Platform Settlement"
}

export type MasjidAdminRole = 
  | 'lead_admin'           // Mosque Lead Administrator (مشرف عام)
  | 'screening_officer'     // Screening & Health Verification Officer (مسؤول التدقيق الصحي)
  | 'logistics_officer'     // Logistics & Dar Ameer Coordinator (مسؤول التسكين والإعاشة)
  | 'finance_officer'       // Financial & Payment Auditor (المسؤول المالي)
  | 'security_officer';     // Gate Security & Headcount Monitor (مسؤول الأمن والبوابة)

export interface MasjidAdmin {
  id: string; // e.g. "adm-sbm-01"
  masjidId: string; // e.g. "sultan-bello"
  fullName: string;
  email: string;
  phone: string;
  role: MasjidAdminRole;
  accessPin?: string; // 4-6 digit quick PIN or temporary pass
  status: 'active' | 'suspended' | 'invited';
  assignedAt: string;
  notes?: string;
}

export interface Masjid {
  id: string; // e.g. "abuja-national", "sultan-bello"
  slug: string; // "abuja-national", "sultan-bello"
  name: string; // "Abuja National Mosque", "Sultan Bello Mosque"
  nameAr: string; // "مسجد أبوجا الوطني", "مسجد السلطان بيلو"
  state: NigerianState; // e.g. "FCT - Abuja", "Kaduna", "Kano", "Lagos"
  lga: string; // e.g. "Central Area", "Kaduna North", "Kano Municipal", "Lagos Island"
  area: string; // e.g. "Central Business District", "Unguwan Sarki"
  address: string;
  codePrefix: string; // e.g. "ANM", "SBM", "ASD", "LMC"
  chairmanName: string; // "Prof. Ishaq Oloyede", "Dr. Muhammad Tahir"
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  totalFloorCapacity: number; // Musalla floor spots only (STRICT NO BEDS)
  subscription: MasjidSubscription;
  paymentConfig?: MasjidPaymentConfig;
  admins?: MasjidAdmin[];
  logoUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface Dar {
  id: DarId;
  masjidId?: string;
  codePrefix: string; // e.g. "ABK", "UMR", "USM", "ALY"
  nameAr: string;
  nameEn: string;
  ameerName: string;
  ameerPhone: string;
  ameerParticipantId?: string;
  colorTheme: 'emerald' | 'blue' | 'amber' | 'purple';
  capacityTarget: number;
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  altPhone?: string;
}

export interface HealthMedicalInfo {
  hasChronicCondition: boolean;
  conditions: string[];
  conditionDetails?: string;
  currentMedications?: string;
  dietaryRestrictions: string[];
  dietaryNotes?: string;
  mobilityAssistanceNeeded: boolean;
  emergencyMedicalNotes?: string;
}

export interface StayDetails {
  stayType: StayType;
  arrivalDate: string;
  departureDate: string;
  customDaysCount?: number;
  notes?: string;
}

export interface IdVerification {
  idType: IdType;
  idNumber: string;
  documentPhoto?: string;
  applicantPhoto?: string;
  verified: boolean;
}

export interface SpaceAllocation {
  hallId: string;
  hallName: string;
  section: string;
  row: number;
  spaceNumber: number;
  spaceTag: string; // e.g. "SPA-A-R2-08"
  notes?: string;
}

export interface AttendanceRecord {
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  lanyardTagIssued: boolean;
  lanyardTagNumber?: string;
  checkedOut: boolean;
  checkedOutAt?: string;
}

export interface PastParticipationRecord {
  year: string; // e.g. "1446 AH (2025)"
  refCode: string;
  darName: string;
  spaceTag?: string;
  attended: boolean;
  notes?: string;
}

export interface HeadcountRecord {
  id: string;
  masjidId?: string;
  participantId: string;
  participantName: string;
  darId: DarId;
  darMemberId: string;
  spaceTag?: string;
  session: HeadcountSession;
  dateKey: string;
  timestamp: string;
  scannedBy: string;
}

export interface ParticipantPayment {
  status: 'exempt' | 'pending_payment' | 'pending_verification' | 'paid';
  amountNgn: number;
  platformFeePercentage?: number; // Platform commission percentage applied (e.g. 10)
  platformFeeNgn?: number; // GetoCore platform share (e.g. ₦1,000)
  mosqueAmountNgn?: number; // Net amount remitted to mosque (e.g. ₦9,000)
  paymentMethod: PaymentGatewayProvider;
  transactionRef?: string;
  paidAt?: string;
  payerName?: string;
  verifiedBy?: string;
  receiptNumber?: string;
  notes?: string;
}

export interface Participant {
  id: string;
  masjidId?: string;
  refCode: string; // e.g. "ITK-2026-0842"
  darMemberId?: string; // e.g. "ABK-1447-0101", "UMR-1447-0204"
  ramadanYear: string; // e.g. "1447" or "1446"
  fullName: string;
  age: number;
  gender: Gender;
  phone: string;
  whatsapp: string;
  residentialArea: string;
  passportPhoto?: string;
  darId?: DarId;
  isAmeer?: boolean;
  isReturning?: boolean;
  yearsAttendedCount?: number;
  pastRecords?: PastParticipationRecord[];
  emergencyContact: EmergencyContact;
  healthMedical: HealthMedicalInfo;
  stay: StayDetails;
  idVerification: IdVerification;
  rulesAccepted: boolean;
  rulesAcceptedAt: string;
  status: ApplicationStatus;
  statusNotes?: string;
  allocatedSpace?: SpaceAllocation;
  attendance: AttendanceRecord;
  payment?: ParticipantPayment;
  appliedAt: string;
  updatedAt: string;
}

export interface DawabitRule {
  id: string;
  category: 'spiritual' | 'discipline' | 'health' | 'electronics' | 'visitors';
  titleAr: string;
  titleEn: string;
  description: string;
  mandatory: boolean;
}

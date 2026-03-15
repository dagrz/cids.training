export type PillarId = 'C' | 'I' | 'D' | 'S';

export interface AssessmentResult {
  C: number;
  I: number;
  D: number;
  S: number;
}

export interface Subscriber {
  email: string;
  phone: string;
  assessmentResult: AssessmentResult;
  weakestPillar: PillarId;
  signupDate: string;
  currentPhase: number;
  status: 'active' | 'unsubscribed';
  unsubscribeToken: string;
  lastNudgeDate?: string;
  lastMessageIndex: Record<PillarId, number>;
  messagingChannel: 'whatsapp' | 'sms';
}

export interface SignupRequest {
  email: string;
  phone: string;
  countryCode: string;
  timezone: string; // IANA timezone e.g. 'America/New_York'
  assessmentResult?: AssessmentResult;
}

// Shared shapes used by every screen.

export type Turn = {
  speaker: "patient" | "doctor" | "system";
  original: string;
  translation: string;
  confirmed?: boolean;
  live?: boolean;
  time: string;
};

export type TeachBackAttempt = { answer: string; status: "Understood" | "Mismatch"; missed: string[] };

export type TeachBackResult = {
  expected: string;
  patient: string;
  status: "Understood" | "Mismatch" | "Not checked";
  attempts: number;
  missed?: string[];
  totalDetails?: number;
  history?: TeachBackAttempt[];
};

export type Consultation = {
  id: string;
  facility: string;
  doctor: string;
  date: string;
  time: string;
  patientLanguage: string;
  doctorLanguage: string;
  patientLang?: string;
  patientAuto?: boolean;
  doctorLang?: string;
  liveFacts?: string[];
  urgent?: string[];
  symptoms: string[];
  instructions: string[];
  expectedUnderstanding: string;
  teachBack: TeachBackResult;
  status: "Verified" | "Mismatch" | "Not checked";
  turns: Turn[];
};

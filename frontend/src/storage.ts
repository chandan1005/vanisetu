// storage.ts
// Saves consultations in the browser (localStorage). No server, no account.
import type { Consultation } from "./types";
import { findLanguage } from "./languages";

const LIST_KEY = "vanisetu.consultations";
const CURRENT_KEY = "vanisetu.current";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the demo keeps working, it just won't be saved.
  }
}

// Returns all saved consultations, newest first.
export function listConsultations(): Consultation[] {
  return read<Consultation[]>(LIST_KEY, []);
}

// Returns one saved consultation, or undefined if not found.
export function getConsultation(id: string): Consultation | undefined {
  return listConsultations().find((c) => c.id === id);
}

// Saves a finished consultation and gives it the next id (C001, C002...).
export function saveConsultation(c: Consultation): Consultation {
  const list = listConsultations();
  const next = { ...c, id: `C${String(list.length + 1).padStart(3, "0")}` };
  write(LIST_KEY, [next, ...list]);
  return next;
}

// Deletes every saved consultation (used by the demo reset button).
export function clearAll(): void {
  try {
    localStorage.removeItem(LIST_KEY);
    localStorage.removeItem(CURRENT_KEY);
  } catch {
    // ignore
  }
}

// The consultation in progress, shared between Consultation, Teach-back and Summary.
export function getCurrent(): Consultation | null {
  return read<Consultation | null>(CURRENT_KEY, null);
}

export function setCurrent(c: Consultation): void {
  write(CURRENT_KEY, c);
}

export function clearCurrent(): void {
  try {
    localStorage.removeItem(CURRENT_KEY);
  } catch {
    // ignore
  }
}

// Creates an empty consultation with the fictional demo details.
export function newConsultation(patientLang = "auto", doctorLang = "en"): Consultation {
  const now = new Date();
  const auto = patientLang === "auto";
  // In auto mode the patient's language is learned from their first sentence (Hindi until then).
  const p = findLanguage(auto ? "hi" : patientLang);
  const d = findLanguage(doctorLang);
  return {
    id: "draft",
    facility: "Sample Government PHC, Bengaluru (demo)",
    doctor: "Dr. Demo",
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    patientLanguage: p.name,
    doctorLanguage: d.name,
    patientLang: p.code,
    patientAuto: auto,
    doctorLang: d.code,
    symptoms: [],
    instructions: [],
    expectedUnderstanding: "",
    teachBack: { expected: "", patient: "", status: "Not checked", attempts: 0 },
    status: "Not checked",
    turns: [],
  };
}

// statusInfo.ts
// Plain-language labels for the understanding status, used on Summary, history and details.
import type { Consultation } from "./types";

export const STATUS_INFO: Record<Consultation["status"], { label: string; help: string; badge: string }> = {
  Verified: {
    label: "Understood ✓",
    help: "The patient repeated the instructions correctly.",
    badge: "bg-green-100 text-green-800",
  },
  Mismatch: {
    label: "Needs re-explaining",
    help: "The patient's last answer did not match the instructions. Explain again and check understanding before the patient leaves.",
    badge: "bg-orange-100 text-orange-800",
  },
  "Not checked": {
    label: "Not checked",
    help: "Understanding was not checked in this consultation.",
    badge: "bg-slate-100 text-slate-700",
  },
};

// Plain reason for each kind of missed detail.
function reasonForDetail(detail: string): string {
  const d = detail.toLowerCase();
  if (d.startsWith("frequency") || d.includes("twice") || d.includes("times")) return "Medicine frequency misunderstood";
  if (d.startsWith("dose") || d.includes("tablet")) return "Dose misunderstood";
  if (d.startsWith("duration")) return "Treatment length misunderstood";
  if (d.startsWith("food")) return "Food timing misunderstood";
  if (d.startsWith("warning")) return "Warning not repeated";
  return "Instruction not repeated correctly";
}

// "Why VANISETU flagged this": one line per kind of missed detail.
export function flagReasons(missed: string[] = []): string[] {
  return [...new Set(missed.map(reasonForDetail))];
}

export type Risk = { level: "Low" | "Medium" | "High"; dot: string; badge: string; text: string };

// Communication risk (not a medical risk): based only on whether the patient repeated the instructions.
export function communicationRisk(c: Consultation): Risk {
  const tb = c.teachBack;
  if (tb.status === "Not checked") {
    return { level: "Medium", dot: "🟡", badge: "bg-yellow-100 text-yellow-900", text: "Understanding was not checked. Next step: ask the patient to repeat the instructions before they leave." };
  }
  if (tb.status === "Mismatch") {
    return { level: "High", dot: "🔴", badge: "bg-red-100 text-red-800", text: "Instructions may not have been understood. Next step: explain again before the patient leaves; consider a human interpreter or a family member who speaks the language." };
  }
  if (tb.attempts > 1) {
    return { level: "Medium", dot: "🟡", badge: "bg-yellow-100 text-yellow-900", text: "Understood after re-explaining. Next step: consider repeating the most important instruction once more." };
  }
  return { level: "Low", dot: "🟢", badge: "bg-green-100 text-green-800", text: "Patient repeated the instructions correctly the first time. No further action needed." };
}

// "3 of 4 details repeated correctly" for the last answer.
export function understandingScore(c: Consultation): string | null {
  const tb = c.teachBack;
  if (tb.status === "Not checked" || !tb.totalDetails) return null;
  const right = Math.max(0, tb.totalDetails - (tb.missed?.length ?? 0));
  return `${right} of ${tb.totalDetails} instruction details repeated correctly`;
}

// "20 Nov 2026" from "2026-11-20".
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// "Consultation #005" from "C005".
export function consultationTitle(id: string): string {
  return id.startsWith("C") ? `Consultation #${id.slice(1)}` : "Consultation";
}

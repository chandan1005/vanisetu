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

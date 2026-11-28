import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import DemoBanner from "./DemoBanner";

const STEPS = ["Speak", "Safety check", "Teach-back", "Summary"];

// Shared page frame: demo notice, back link, optional step indicator, title, narrow mobile-first column.
export default function PageShell({
  title,
  back = "/",
  backLabel = "Back to Home",
  step,
  children,
}: {
  title: string;
  back?: string;
  backLabel?: string;
  step?: number;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex justify-center p-4">
      <div className="w-full max-w-[420px] flex flex-col gap-4">
        <DemoBanner />
        <div className="flex items-center justify-between">
          <Link to={back} className="text-teal-700 underline">{backLabel}</Link>
        </div>
        {step !== undefined && (
          <ol className="flex gap-1" aria-label="Consultation steps">
            {STEPS.map((name, i) => (
              <li
                key={name}
                aria-current={i === step ? "step" : undefined}
                className={`flex-1 rounded-lg px-1 py-1 text-center text-[11px] font-semibold ${
                  i < step ? "bg-teal-100 text-teal-800" : i === step ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {i < step ? "✓ " : ""}{name}
              </li>
            ))}
          </ol>
        )}
        <h1 className="text-2xl font-bold text-blue-900">{title}</h1>
        {children}
      </div>
    </div>
  );
}

import type { Consultation } from "../types";
import { STATUS_INFO, communicationRisk, flagReasons, understandingScore } from "../statusInfo";

// Shows how well the patient understood: status, communication risk, score, reasons and a timeline.
export default function Outcome({ c, saved }: { c: Consultation; saved: boolean }) {
  const info = STATUS_INFO[c.status];
  const risk = communicationRisk(c);
  const score = understandingScore(c);
  const history = c.teachBack.history ?? [];
  const lastMismatch = [...history].reverse().find((a) => a.status === "Mismatch");
  const confirmed = c.turns.some((t) => t.confirmed);

  return (
    <div className="flex flex-col gap-4">
      {c.urgent?.length ? (
        <section className="rounded-2xl border-2 border-red-600 bg-red-50 p-3">
          <p className="font-bold text-red-700">⚠ Urgent words flagged: {c.urgent.join(", ")}</p>
          <p className="text-sm text-red-800">The doctor was alerted during the consultation. VANISETU flags words; it does not diagnose.</p>
        </section>
      ) : null}
      <section className="rounded-2xl border-2 border-slate-200 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-semibold text-blue-900">Understanding</h2>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${info.badge}`}>{info.label}</span>
        </div>
        <p className="text-sm text-slate-700">{info.help}</p>
        {score && <p className="text-sm text-slate-700">{score}</p>}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <h2 className="font-semibold text-blue-900">Communication risk</h2>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${risk.badge}`}>{risk.dot} {risk.level}</span>
        </div>
        <p className="text-sm text-slate-700">{risk.text}</p>
        <p className="text-xs text-slate-500">This is about understanding the instructions, not a medical assessment.</p>
      </section>

      {lastMismatch && (
        <section className="rounded-2xl bg-orange-50 border border-orange-200 p-4 flex flex-col gap-1">
          <h2 className="font-semibold text-orange-800">
            {c.status === "Mismatch" ? "Why VANISETU flagged this" : "What was corrected"}
          </h2>
          <p className="text-sm"><span className="font-semibold">Patient said:</span> “{lastMismatch.answer}”</p>
          <p className="text-sm"><span className="font-semibold">Expected:</span> {c.teachBack.expected}</p>
          {lastMismatch.missed.length > 0 && (
            <p className="text-sm"><span className="font-semibold">Missed:</span> {lastMismatch.missed.map((m) => m.split(": ")[1] ?? m).join(", ")}</p>
          )}
          <p className="text-sm"><span className="font-semibold">Reason:</span> {flagReasons(lastMismatch.missed).join("; ") || "Instruction not repeated correctly"}</p>
        </section>
      )}

      <section>
        <h2 className="font-semibold text-blue-900">Timeline</h2>
        <ol className="mt-1 flex flex-col gap-1 text-sm text-slate-800">
          <li>✅ Consultation started</li>
          <li>{confirmed ? "✅ Safety clarification confirmed" : "⚪ No instruction needed a safety check"}</li>
          {history.length === 0 && <li>⚪ Teach-back not done</li>}
          {history.map((a, i) => (
            <li key={i}>{a.status === "Understood" ? "✅" : "❌"} Teach-back attempt {i + 1}: “{a.answer}”</li>
          ))}
          <li>{saved ? "✅ Summary saved" : "⚪ Summary not saved yet"}</li>
        </ol>
      </section>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import { clearCurrent, getCurrent, saveConsultation } from "../storage";
import type { Consultation } from "../types";

const statusStyle: Record<Consultation["status"], string> = {
  Verified: "bg-green-100 text-green-800",
  Mismatch: "bg-orange-100 text-orange-800",
  "Not checked": "bg-slate-100 text-slate-700",
};

export default function Summary() {
  const [current] = useState(getCurrent);
  const [saved, setSaved] = useState<Consultation | null>(null);

  if (!current) {
    return (
      <PageShell title="Summary">
        <p className="text-slate-700">No consultation in progress. Start one from Home.</p>
      </PageShell>
    );
  }

  function save() {
    if (!current) return;
    const stored = saveConsultation(current);
    clearCurrent();
    setSaved(stored);
  }

  return (
    <PageShell title="Summary" back="/teachback" backLabel="Back to Teach-back">
      <div className="rounded-2xl bg-blue-50 p-4 flex flex-col gap-1 text-slate-800">
        <p><span className="font-semibold">Facility:</span> {current.facility}</p>
        <p><span className="font-semibold">Doctor:</span> {current.doctor}</p>
        <p><span className="font-semibold">Date:</span> {current.date} {current.time}</p>
        <p><span className="font-semibold">Languages:</span> {current.patientLanguage} ↔ {current.doctorLanguage}</p>
      </div>

      <section>
        <h2 className="font-semibold text-blue-900">Symptoms (patient's words, translated)</h2>
        {current.symptoms.length ? (
          <ul className="list-disc pl-5 text-slate-800">{current.symptoms.map((s) => <li key={s}>{s}</li>)}</ul>
        ) : (
          <p className="text-slate-500">None recorded</p>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-blue-900">Instructions (confirmed)</h2>
        {current.instructions.length ? (
          <ul className="list-disc pl-5 text-slate-800">{current.instructions.map((s) => <li key={s}>{s}</li>)}</ul>
        ) : (
          <p className="text-slate-500">None recorded</p>
        )}
      </section>

      <section className="flex items-center gap-3">
        <h2 className="font-semibold text-blue-900">Understanding</h2>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyle[current.status]}`}>{current.status}</span>
      </section>
      {current.teachBack.status !== "Not checked" && (
        <p className="text-sm text-slate-600">
          Last answer: “{current.teachBack.patient}” after {current.teachBack.attempts} attempt(s)
        </p>
      )}

      <p className="text-xs text-slate-500">Translations are AI-generated (scripted demo lines or on-device live translation). No diagnosis or medical advice is given.</p>

      {!saved ? (
        <button onClick={save} className="min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700">
          Save consultation
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-green-700 font-semibold">Saved ✓ as {saved.id}</p>
          <Link to="/history" className="flex items-center justify-center min-h-[56px] w-full rounded-2xl bg-blue-700 text-white text-lg font-semibold">
            View My Consultations
          </Link>
        </div>
      )}
    </PageShell>
  );
}

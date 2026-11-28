import { useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import { clearCurrent, getCurrent, saveConsultation } from "../storage";
import type { Consultation } from "../types";
import Outcome from "../components/Outcome";
import { formatDate } from "../statusInfo";

export default function Summary() {
  const [current] = useState(getCurrent);
  const [saved, setSaved] = useState<Consultation | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

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
    <PageShell title="Summary" back="/teachback" backLabel="Back to Teach-back" step={3}>
      <div className="rounded-2xl bg-blue-50 p-4 flex flex-col gap-1 text-slate-800">
        <p><span className="font-semibold">Facility:</span> {current.facility}</p>
        <p><span className="font-semibold">Doctor:</span> {current.doctor}</p>
        <p><span className="font-semibold">Date:</span> {formatDate(current.date)}, {current.time}</p>
        <p><span className="font-semibold">Patient language:</span> {current.patientLanguage}</p>
        <p><span className="font-semibold">Doctor language:</span> {current.doctorLanguage}</p>
        <p><span className="font-semibold">Translation pair:</span> {current.patientLanguage} ↔ {current.doctorLanguage}</p>
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

      <Outcome c={current} saved={Boolean(saved)} />

      <p className="text-xs text-slate-500">Translations are AI-generated (scripted demo lines or on-device live translation). No diagnosis or medical advice is given.</p>

      {!saved ? (
        <>
          {current.status !== "Verified" && (
            <label className="flex items-start gap-2 rounded-2xl border-2 border-orange-300 bg-orange-50 p-3 text-sm text-orange-900">
              <input type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} className="mt-1 h-5 w-5" />
              <span>
                {current.status === "Mismatch"
                  ? "The patient has not repeated the instructions correctly yet. I will explain again, and I want to save this record as “Needs re-explaining”."
                  : "Understanding was not checked. I want to save this record as “Not checked”."}
              </span>
            </label>
          )}
          <button
            onClick={save}
            disabled={current.status !== "Verified" && !acknowledged}
            className="min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700 disabled:opacity-40"
          >
            Save consultation
          </button>
        </>
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

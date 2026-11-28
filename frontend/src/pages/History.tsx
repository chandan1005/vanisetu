import { useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import { clearAll, listConsultations, saveConsultation } from "../storage";
import { sampleConsultations } from "../sampleData";

const SEEDED_KEY = "vanisetu.samplesSeeded";
function markSeeded() {
  try { localStorage.setItem(SEEDED_KEY, "1"); } catch { /* ignore */ }
}
function alreadySeeded() {
  try { return localStorage.getItem(SEEDED_KEY) === "1"; } catch { return true; }
}
import { STATUS_INFO, communicationRisk, consultationTitle, formatDate } from "../statusInfo";

export default function History() {
  // First visit: show the six sample consultations so judges see every outcome straight away.
  const [items, setItems] = useState(() => {
    if (listConsultations().length === 0 && !alreadySeeded()) {
      sampleConsultations().forEach((c) => saveConsultation(c));
      markSeeded();
    }
    return listConsultations();
  });

  // Adds six clearly-labelled sample consultations covering every outcome.
  function loadSamples() {
    sampleConsultations().forEach((c) => saveConsultation(c));
    markSeeded();
    setItems(listConsultations());
  }

  function reset() {
    if (window.confirm("Delete all saved demo consultations?")) {
      clearAll();
      markSeeded();
      setItems([]);
    }
  }

  return (
    <PageShell title="My Consultations">
      {items.length === 0 ? (
        <p className="text-slate-700">No consultations yet. Start one from Home.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((c) => (
            <li key={c.id} className="rounded-2xl border border-slate-200 p-4 flex flex-col gap-1">
              <p className="font-semibold text-blue-900">{consultationTitle(c.id)}</p>
              <p className="text-sm text-slate-700">{c.facility}</p>
              <p className="text-sm text-slate-600">{formatDate(c.date)}, {c.time} · {c.patientLanguage} ↔ {c.doctorLanguage}</p>
              <p className="text-sm">{communicationRisk(c).dot} Communication risk: {communicationRisk(c).level}</p>
              {c.urgent?.length ? <p className="text-sm font-semibold text-red-700">⚠ Urgent words flagged: {c.urgent.join(", ")}</p> : null}
              {c.symptoms[0] && <p className="text-xs text-slate-600">Main concern: {c.symptoms[0]}</p>}
              <p className="text-sm flex items-center gap-2">
                Understanding:
                <span className={`rounded-full px-2 py-0.5 text-sm font-semibold ${STATUS_INFO[c.status].badge}`}>{STATUS_INFO[c.status].label}</span>
              </p>
              {c.status !== "Verified" && <p className="text-xs text-slate-600">{STATUS_INFO[c.status].help}</p>}
              <Link to={`/history/${c.id}`} className="mt-2 flex items-center justify-center min-h-[48px] rounded-2xl bg-teal-600 text-white font-semibold">
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
      <button onClick={loadSamples} className="min-h-[44px] rounded-2xl border-2 border-dashed border-yellow-500 bg-yellow-50 text-sm font-semibold text-yellow-900">
        Add 6 sample consultations (all outcomes)
      </button>
      {items.length > 0 && (
        <button onClick={reset} className="text-sm text-slate-500 underline self-center">
          Demo reset: delete all
        </button>
      )}
    </PageShell>
  );
}

import { useState } from "react";
import { useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import { getConsultation } from "../storage";
import { speakText } from "../speech";

export default function Details() {
  const { id = "" } = useParams();
  const c = getConsultation(id);
  const [audioMsg, setAudioMsg] = useState("");

  if (!c) {
    return (
      <PageShell title="Consultation not found" back="/history" backLabel="Back to My Consultations">
        <p className="text-slate-700">This consultation does not exist on this device.</p>
      </PageShell>
    );
  }

  function play(text: string) {
    setAudioMsg(speakText(text, "en-IN") ? "" : "Audio not available on this device");
  }

  const summaryText = `Consultation ${c.id}. Symptoms: ${c.symptoms.join(", ") || "none recorded"}. Understanding status: ${c.status}.`;
  const instructionText = c.instructions.join(". ") || "No instructions recorded.";

  return (
    <PageShell title={`Consultation ${c.id}`} back="/history" backLabel="Back to My Consultations">
      <div className="rounded-2xl bg-blue-50 p-4 flex flex-col gap-1 text-slate-800">
        <p><span className="font-semibold">Facility:</span> {c.facility}</p>
        <p><span className="font-semibold">Doctor:</span> {c.doctor}</p>
        <p><span className="font-semibold">Date:</span> {c.date} {c.time}</p>
        <p><span className="font-semibold">Languages:</span> {c.patientLanguage} ↔ {c.doctorLanguage}</p>
        <p><span className="font-semibold">Understanding:</span> {c.status}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => play(summaryText)} className="flex-1 min-h-[56px] rounded-2xl bg-teal-600 text-white font-semibold">
          ▶ Replay summary
        </button>
        <button onClick={() => play(instructionText)} className="flex-1 min-h-[56px] rounded-2xl bg-blue-700 text-white font-semibold">
          ▶ Replay instructions
        </button>
      </div>
      {audioMsg && <p className="text-sm text-orange-700">{audioMsg}</p>}

      <section>
        <h2 className="font-semibold text-blue-900">Symptoms</h2>
        <ul className="list-disc pl-5">{c.symptoms.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>
      <section>
        <h2 className="font-semibold text-blue-900">Instructions</h2>
        <ul className="list-disc pl-5">{c.instructions.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>
      <section>
        <h2 className="font-semibold text-blue-900">Teach-back</h2>
        <p>Expected: {c.teachBack.expected || "—"}</p>
        <p>Patient: {c.teachBack.patient || "—"}</p>
        <p>Result: {c.teachBack.status}</p>
      </section>
      <section>
        <h2 className="font-semibold text-blue-900">Conversation</h2>
        <ul className="flex flex-col gap-2">
          {c.turns.map((t, i) => (
            <li key={i} className="rounded-xl bg-slate-50 p-2 text-sm">
              <span className="font-semibold capitalize">{t.speaker}</span> ({t.time}): {t.original}
              {t.translation && <span className="block text-blue-900">AI translation{t.confirmed ? " (confirmed)" : ""}: {t.translation}</span>}
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}

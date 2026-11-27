import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import { getConsultation } from "../storage";
import { speakText, stopSpeaking } from "../speech";
import { findLanguage } from "../languages";
import { STATUS_INFO } from "../statusInfo";

export default function Details() {
  const { id = "" } = useParams();
  const c = getConsultation(id);
  const [playing, setPlaying] = useState<"summary" | "instructions" | null>(null);
  const [audioMsg, setAudioMsg] = useState("");

  // Stop any voice when leaving the page.
  useEffect(() => () => stopSpeaking(), []);

  if (!c) {
    return (
      <PageShell title="Consultation not found" back="/history" backLabel="Back to My Consultations">
        <p className="text-slate-700">This consultation does not exist on this device.</p>
      </PageShell>
    );
  }

  const info = STATUS_INFO[c.status];
  const summaryText = `Consultation ${c.id}. Symptoms: ${c.symptoms.join(", ") || "none recorded"}. Understanding: ${info.label}.`;
  const instructionText = c.instructions.join(". ") || "No instructions recorded.";

  // Plays text aloud and shows a "Playing…" indicator until it finishes.
  function play(which: "summary" | "instructions") {
    if (playing === which) {
      stopSpeaking();
      setPlaying(null);
      return;
    }
    const text = which === "summary" ? summaryText : instructionText;
    const lang = which === "summary" ? "en-IN" : findLanguage(c!.patientLang ?? "hi").speech;
    const ok = speakText(text, lang, () => setPlaying(null));
    setAudioMsg(ok ? "" : "Audio not available on this device");
    setPlaying(ok ? which : null);
  }

  return (
    <PageShell title={`Consultation ${c.id}`} back="/history" backLabel="Back to My Consultations">
      <div className="rounded-2xl bg-blue-50 p-4 flex flex-col gap-1 text-slate-800">
        <p><span className="font-semibold">Facility:</span> {c.facility}</p>
        <p><span className="font-semibold">Doctor:</span> {c.doctor}</p>
        <p><span className="font-semibold">Date:</span> {c.date} {c.time}</p>
        <p><span className="font-semibold">Languages:</span> {c.patientLanguage} ↔ {c.doctorLanguage}</p>
        <p className="flex items-center gap-2">
          <span className="font-semibold">Understanding:</span>
          <span className={`rounded-full px-2 py-0.5 text-sm font-semibold ${info.badge}`}>{info.label}</span>
        </p>
        <p className="text-sm text-slate-600">{info.help}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => play("summary")} aria-pressed={playing === "summary"}
          className={`flex-1 min-h-[56px] rounded-2xl text-white font-semibold ${playing === "summary" ? "bg-red-600" : "bg-teal-600"}`}>
          {playing === "summary" ? "■ Stop" : "▶ Replay summary"}
        </button>
        <button onClick={() => play("instructions")} aria-pressed={playing === "instructions"}
          className={`flex-1 min-h-[56px] rounded-2xl text-white font-semibold ${playing === "instructions" ? "bg-red-600" : "bg-blue-700"}`}>
          {playing === "instructions" ? "■ Stop" : "▶ Replay instructions"}
        </button>
      </div>
      {playing && (
        <div className="rounded-2xl bg-yellow-50 border border-yellow-300 p-3" aria-live="polite">
          <p className="font-semibold text-yellow-900">🔊 Playing {playing}…</p>
          <p className="text-blue-900">{playing === "summary" ? summaryText : instructionText}</p>
        </div>
      )}
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

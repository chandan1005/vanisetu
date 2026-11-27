import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { matchUtterance, needsClarification, translateToPatient, expectedFor } from "../mockAI";
import { getCurrent, newConsultation, setCurrent } from "../storage";
import { canListen, speakText, startListening, type Listening } from "../speech";
import { findLanguage } from "../languages";
import { getProgress, liveTranslationSupported, onProgress, translateText, warmUp, warmUpConsultation } from "../translator";
import { extractFacts } from "../safety";
import type { Consultation as ConsultationData, Turn } from "../types";

// The scripted sentences for the demo buttons (always work, even offline).
const PATIENT_SENTENCE = "Mujhe teen din se bukhar hai";
const DOCTOR_SENTENCE = "Take two tablets after food";

const nowTime = () => new Date().toTimeString().slice(0, 8);

type Pending =
  | { kind: "scripted"; original: string; question: string; options: string[] }
  | { kind: "live"; original: string; english: string; facts: string[] };

export default function Consultation() {
  const navigate = useNavigate();
  const [data, setData] = useState<ConsultationData>(() => getCurrent() ?? newConsultation());
  const [status, setStatus] = useState("Ready");
  const [typed, setTyped] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<Pending | null>(null);
  const [packs, setPacks] = useState<Record<string, number>>(getProgress);
  const live = liveTranslationSupported();
  // Whose turn it is. Turns switch automatically, so the patient never has to choose.
  const [turn, setTurn] = useState<"patient" | "doctor">("patient");
  const [listening, setListening] = useState<Listening | null>(null);

  const patient = findLanguage(data.patientLang ?? "hi");
  const doctor = findLanguage(data.doctorLang ?? "en");

  // Keep the consultation in progress saved, so Teach-back and Summary can read it.
  useEffect(() => setCurrent(data), [data]);
  // Show language-pack download progress.
  useEffect(() => onProgress(() => setPacks(getProgress())), []);

  // Shows English demo text in the listener's language when live translation is ready.
  async function localize(english: string, to: { code: string; speech: string }): Promise<{ text: string; lang: string }> {
    if (to.code === "en") return { text: english, lang: "en-IN" };
    try {
      return { text: await translateText(english, "en", to.code), lang: to.speech };
    } catch {
      return { text: english, lang: "en-IN" };
    }
  }

  function addTurns(turns: Turn[], extra: Partial<ConsultationData> = {}) {
    setData((prev) => ({ ...prev, ...extra, turns: [...prev.turns, ...turns] }));
  }

  function addPatientTurn(original: string, translation: string, symptom: string, live: boolean) {
    setData((prev) => ({
      ...prev,
      symptoms: symptom && !prev.symptoms.includes(symptom) ? [...prev.symptoms, symptom] : prev.symptoms,
      turns: [...prev.turns, { speaker: "patient", original, translation, live, time: nowTime() }],
    }));
  }

  // Scripted path: the predefined demo sentences (no internet, no keys).
  async function handleScripted(speaker: "patient" | "doctor", text: string, result: ReturnType<typeof matchUtterance>) {
    if (speaker === "doctor") {
      const check = needsClarification(result.flags);
      if (check.needed) {
        setPending({ kind: "scripted", original: text, question: check.question, options: check.options });
        setStatus("Waiting for safety check");
        return;
      }
    }
    // Demo meanings are written in English; show them in the listener's language if possible.
    const out = await localize(result.translation, speaker === "patient" ? doctor : patient);
    if (speaker === "doctor") addTurns([{ speaker, original: text, translation: out.text, time: nowTime() }]);
    else addPatientTurn(text, out.text, result.translation, false);
    speakText(out.text, out.lang);
  }

  // Live path: any real sentence, translated on-device by the browser.
  async function handleLive(speaker: "patient" | "doctor", text: string) {
    const from = speaker === "patient" ? patient : doctor;
    const to = speaker === "patient" ? doctor : patient;
    setStatus("Translating");
    try {
      const english = await translateText(text, from.code, "en");
      if (speaker === "doctor") {
        const facts = extractFacts(english);
        if (facts.length) {
          // Risky detail found: confirm with the doctor before translating to the patient.
          setPending({ kind: "live", original: text, english, facts });
          setStatus("Waiting for safety check");
          return;
        }
        const translation = await translateText(text, from.code, to.code);
        addTurns([{ speaker, original: text, translation, live: true, time: nowTime() }]);
        speakText(translation, to.speech);
      } else {
        const translation = await translateText(text, from.code, to.code);
        addPatientTurn(text, translation, english, true);
        speakText(translation, to.speech);
      }
      setStatus("Ready");
    } catch (err) {
      addTurns([
        { speaker, original: text, translation: "", live: true, time: nowTime() },
        {
          speaker: "system",
          original: `Not translated: ${err instanceof Error ? err.message : "live translation failed"} Use the demo buttons, or ask staff to help.`,
          translation: "",
          time: nowTime(),
        },
      ]);
      setStatus("Ready");
    }
  }

  // Handles any sentence: demo sentences use the script, everything else uses live translation.
  function handle(speaker: "patient" | "doctor", text: string) {
    const result = matchUtterance(text);
    if (!result.flags.includes("unclear")) void handleScripted(speaker, text, result);
    else void handleLive(speaker, text);
  }

  // Plays the status steps (Listening, Understanding, Speaking) for the demo buttons.
  function speakDemo(speaker: "patient" | "doctor", text: string) {
    warmUpConsultation(patient.code, doctor.code);
    setStatus("Listening");
    setTimeout(() => setStatus("Understanding"), 800);
    setTimeout(() => {
      handle(speaker, text);
      setStatus((s) => (s === "Waiting for safety check" ? s : "Speaking"));
    }, 1600);
    setTimeout(() => setStatus((s) => (s === "Waiting for safety check" ? s : "Ready")), 2400);
  }

  // One big button: tap to speak, tap again to stop. It listens in the language of
  // whoever's turn it is, then hands the turn to the other person automatically.
  function tapToSpeak() {
    if (listening) {
      listening.stop();
      return;
    }
    warmUpConsultation(patient.code, doctor.code);
    setNote("");
    const speaker = turn;
    const session = startListening(speaker === "patient" ? patient.speech : doctor.speech);
    setListening(session);
    setStatus(`Listening to the ${speaker}`);
    session.result
      .then((heard) => {
        setListening(null);
        setStatus("Ready");
        handle(speaker, heard);
        setTurn(speaker === "patient" ? "doctor" : "patient");
      })
      .catch(() => {
        setListening(null);
        setStatus("Ready");
        setNote("I didn't hear anything. Tap the big button and speak again.");
      });
  }

  // Doctor confirms the scripted option.
  async function confirmScripted(option: string) {
    if (!pending || pending.kind !== "scripted") return;
    warmUp("en", patient.code);
    const english = translateToPatient(option);
    const original = pending.original;
    setPending(null);
    setStatus("Translating");
    const out = await localize(english, patient);
    const translated = out.text;
    addTurns(
      [
        { speaker: "doctor", original, translation: translated, confirmed: true, time: nowTime() },
        { speaker: "system", original: `Confirmed: ${option}`, translation: "", time: nowTime() },
      ],
      { instructions: [translated], expectedUnderstanding: expectedFor(option), liveFacts: [] }
    );
    speakText(translated, out.lang);
    setStatus("Ready");
  }

  // Doctor confirms the live sentence is correct; now translate it for the patient.
  async function confirmLive() {
    if (!pending || pending.kind !== "live") return;
    warmUp(doctor.code, patient.code);
    const { original, english, facts } = pending;
    setPending(null);
    setStatus("Translating");
    try {
      const translation = await translateText(original, doctor.code, patient.code);
      addTurns(
        [
          { speaker: "doctor", original, translation, confirmed: true, live: true, time: nowTime() },
          { speaker: "system", original: `Confirmed: ${facts.join(", ")}`, translation: "", time: nowTime() },
        ],
        { instructions: [translation], expectedUnderstanding: "live", liveFacts: facts }
      );
      speakText(translation, patient.speech);
    } catch {
      setNote("Live translation failed. Please try again or use the demo buttons.");
    }
    setStatus("Ready");
  }

  // Closes the popup without confirming, so the doctor can speak again.
  function repeat() {
    setPending(null);
    setStatus("Ready");
  }

  function sendTyped(speaker: "patient" | "doctor") {
    if (!typed.trim()) return;
    warmUpConsultation(patient.code, doctor.code);
    handle(speaker, typed.trim());
    setTyped("");
  }

  const busy = status !== "Ready";

  return (
    <PageShell title="Consultation">
      <div className="rounded-2xl bg-blue-50 p-3 text-center text-blue-900">
        <p className="font-semibold">Patient: {patient.name} ({patient.native})</p>
        <p className="font-semibold">Doctor: {doctor.name} ({doctor.native})</p>
        <p className="mt-1 text-sm text-slate-600" aria-live="polite">Status: {status}</p>
      </div>

      {/* Conversation */}
      <div className="flex flex-col gap-3 min-h-[120px]">
        {data.turns.length === 0 && (
          <p className="text-center text-slate-500">Speak with the mic, dictate below, or use the demo buttons.</p>
        )}
        {data.turns.map((line, index) =>
          line.speaker === "system" ? (
            <p key={index} className="text-center text-sm font-semibold text-orange-700">{line.original}</p>
          ) : (
            <div
              key={index}
              className={`rounded-2xl p-3 w-[90%] ${line.speaker === "patient" ? "bg-slate-100 self-start" : "bg-teal-50 self-end"}`}
            >
              <p className="text-xs text-slate-500">
                {line.speaker === "patient" ? "Patient" : "Doctor"} (original){line.live ? " • live" : " • demo"}
              </p>
              <p className="text-sm text-slate-500">{line.original}</p>
              {line.translation && (
                <>
                  <p className="mt-2 text-xs text-teal-800">
                    {line.confirmed ? "AI translation (confirmed)" : "AI translation"}
                  </p>
                  <p className="text-lg font-semibold text-blue-900">{line.translation}</p>
                </>
              )}
            </div>
          )
        )}
      </div>

      {note && <p className="text-sm text-orange-700">{note}</p>}

      {/* Language packs for live translation (Chrome downloads them after a tap) */}
      {live && patient.code !== doctor.code && (
        <div className="rounded-2xl border border-slate-200 p-3 flex flex-col gap-2">
          <button
            onClick={() => warmUpConsultation(patient.code, doctor.code)}
            className="min-h-[44px] rounded-2xl bg-slate-800 text-white font-semibold"
          >
            Prepare languages ({patient.name} ↔ {doctor.name})
          </button>
          {Object.keys(packs).length > 0 && (
            <ul className="text-xs text-slate-600 flex flex-wrap gap-x-3">
              {Object.entries(packs).map(([pair, pct]) => (
                <li key={pair}>{pair.replace(">", " → ")}: {pct >= 100 ? "ready" : `${pct}%`}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Turn-based speaking: one big button, the app knows whose turn it is */}
      {canListen() && (
        <div className="rounded-2xl border-2 border-slate-200 p-4 flex flex-col gap-3 items-center text-center">
          <p className="text-sm text-slate-600">Next to speak</p>
          <p className="text-2xl font-bold text-blue-900">
            {turn === "patient" ? "🧑 Patient" : "🩺 Doctor"} · {(turn === "patient" ? patient : doctor).native}
          </p>
          <button
            onClick={tapToSpeak}
            disabled={busy && !listening}
            aria-pressed={Boolean(listening)}
            className={`min-h-[72px] w-full rounded-2xl text-white text-xl font-bold disabled:opacity-50 ${
              listening ? "bg-red-600 hover:bg-red-700" : turn === "patient" ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-700 hover:bg-blue-800"
            }`}
          >
            {listening ? "■ Stop listening" : `🎙 Tap and speak (${(turn === "patient" ? patient : doctor).name})`}
          </button>
          <p className="text-xs text-slate-500">Stops by itself when you stop talking. The turn then passes to the other person.</p>
          {!listening && (
            <button onClick={() => setTurn(turn === "patient" ? "doctor" : "patient")} className="text-sm text-teal-700 underline">
              Switch to {turn === "patient" ? "doctor" : "patient"}
            </button>
          )}
        </div>
      )}

      {/* Type or dictate (Wispr Flow dictation works in this field) */}
      <div className="flex flex-col gap-2">
        <label htmlFor="typed" className="text-sm text-slate-600">Type or dictate a sentence (Wispr Flow works here)</label>
        <input
          id="typed"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="min-h-[48px] rounded-2xl border-2 border-slate-300 px-3"
          placeholder="e.g. Take one tablet twice daily after food for five days"
        />
        <div className="flex gap-2">
          <button onClick={() => sendTyped("patient")} disabled={busy} className="flex-1 min-h-[44px] rounded-2xl bg-slate-200 font-semibold disabled:opacity-50">
            Send as patient
          </button>
          <button onClick={() => sendTyped("doctor")} disabled={busy} className="flex-1 min-h-[44px] rounded-2xl bg-slate-200 font-semibold disabled:opacity-50">
            Send as doctor
          </button>
        </div>
      </div>

      {/* Scripted demo lines (always work, even offline) */}
      <p className="text-xs text-slate-500">
        Demo lines (scripted Hindi patient line and English doctor line; always work offline).
        {patient.code !== "hi" || doctor.code !== "en"
          ? ` Their meaning is shown in ${doctor.name} / ${patient.name} once languages are prepared, otherwise in English.`
          : ""}
      </p>
      <button
        onClick={() => speakDemo("patient", PATIENT_SENTENCE)}
        disabled={busy}
        className="min-h-[56px] w-full rounded-2xl border-2 border-teal-600 text-teal-700 text-lg font-semibold hover:bg-teal-50 disabled:opacity-50"
      >
        🎤 Patient: Hold to speak
      </button>
      <button
        onClick={() => speakDemo("doctor", DOCTOR_SENTENCE)}
        disabled={busy}
        className="min-h-[56px] w-full rounded-2xl border-2 border-blue-700 text-blue-800 text-lg font-semibold hover:bg-blue-50 disabled:opacity-50"
      >
        🎤 Doctor: Hold to speak
      </button>

      <button
        onClick={() => navigate("/teachback")}
        disabled={data.instructions.length === 0}
        className="min-h-[56px] w-full rounded-2xl bg-orange-600 text-white text-lg font-semibold hover:bg-orange-700 disabled:opacity-40"
      >
        Check understanding
      </button>
      <button onClick={() => navigate("/summary")} className="text-teal-700 underline">
        Skip to summary
      </button>

      {/* Safety check popup */}
      {pending && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-blue-900">Safety check</h2>
            <p className="text-slate-600 text-sm">Heard: “{pending.original}”</p>
            {pending.kind === "scripted" ? (
              <>
                <p className="text-slate-700">{pending.question}</p>
                {pending.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => void confirmScripted(option)}
                    className="min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700"
                  >
                    {option}
                  </button>
                ))}
              </>
            ) : (
              <>
                {pending.english !== pending.original && (
                  <p className="text-slate-600 text-sm">In English: “{pending.english}”</p>
                )}
                <p className="text-slate-700">Please confirm these details before they are translated:</p>
                <ul className="flex flex-wrap gap-2">
                  {pending.facts.map((f) => (
                    <li key={f} className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800">{f}</li>
                  ))}
                </ul>
                <button
                  onClick={() => void confirmLive()}
                  className="min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700"
                >
                  Yes, these are correct
                </button>
              </>
            )}
            <button
              onClick={repeat}
              className="min-h-[56px] w-full rounded-2xl border-2 border-slate-400 text-slate-700 text-lg font-semibold hover:bg-slate-100"
            >
              Repeat
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}

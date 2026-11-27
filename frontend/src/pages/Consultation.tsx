import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { matchUtterance, needsClarification, translateToPatient, expectedFor } from "../mockAI";
import { getCurrent, newConsultation, setCurrent } from "../storage";
import { canListen, speakText, startListening, type Listening } from "../speech";
import { findLanguage } from "../languages";
import { getProgress, liveTranslationSupported, onProgress, translateText, warmUp } from "../translator";
import { detectLanguage, warmUpDetector } from "../detector";
import { extractFacts } from "../safety";
import type { Consultation as ConsultationData, Turn } from "../types";

// The scripted sentences for the demo buttons (always work, even offline).
const PATIENT_SENTENCE = "Mujhe teen din se bukhar hai";
const DOCTOR_SENTENCE = "Take two tablets after food";

const nowTime = () => new Date().toTimeString().slice(0, 8);
type Who = "patient" | "doctor";
const other = (w: Who): Who => (w === "patient" ? "doctor" : "patient");

type Pending =
  | { kind: "scripted"; original: string; question: string; options: string[] }
  | { kind: "live"; original: string; english: string; facts: string[]; from: string; to: string };

// A sentence that could not be translated yet (usually a language pack that needs a tap to download).
type Retry = { speaker: Who; text: string; from: string; to: string };

export default function Consultation() {
  const navigate = useNavigate();
  const [data, setData] = useState<ConsultationData>(() => getCurrent() ?? newConsultation());
  const [status, setStatus] = useState("Ready");
  const [typed, setTyped] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<Pending | null>(null);
  const [retry, setRetry] = useState<Retry | null>(null);
  const [packs, setPacks] = useState<Record<string, number>>(getProgress);
  // Whose turn it is. Turns switch automatically after each sentence.
  const [turn, setTurn] = useState<Who>("patient");
  const [listening, setListening] = useState<Listening | null>(null);
  const live = liveTranslationSupported();

  // Always read the latest languages inside async code.
  const dataRef = useRef(data);
  dataRef.current = data;
  const patient = findLanguage(data.patientLang ?? "hi");
  const doctor = findLanguage(data.doctorLang ?? "en");

  useEffect(() => setCurrent(data), [data]);
  useEffect(() => onProgress(() => setPacks(getProgress())), []);

  function addTurns(turns: Turn[], extra: Partial<ConsultationData> = {}) {
    setData((prev) => ({ ...prev, ...extra, turns: [...prev.turns, ...turns] }));
  }

  function addPatientTurn(original: string, translation: string, symptom: string, isLive: boolean) {
    setData((prev) => ({
      ...prev,
      symptoms: symptom && !prev.symptoms.includes(symptom) ? [...prev.symptoms, symptom] : prev.symptoms,
      turns: [...prev.turns, { speaker: "patient", original, translation, live: isLive, time: nowTime() }],
    }));
  }

  // Taps are the only moment Chrome allows downloads, so every button warms things up first.
  function warmAll() {
    warmUpDetector();
    const d = dataRef.current;
    warmUp(d.patientLang ?? "hi", d.doctorLang ?? "en");
    warmUp(d.doctorLang ?? "en", d.patientLang ?? "hi");
  }

  // Shows English demo text in the listener's language when live translation is ready.
  async function localize(english: string, toCode: string): Promise<{ text: string; lang: string }> {
    if (toCode === "en") return { text: english, lang: "en-IN" };
    try {
      return { text: await translateText(english, "en", toCode), lang: findLanguage(toCode).speech };
    } catch {
      return { text: english, lang: "en-IN" };
    }
  }

  // ---------- Scripted demo lines ----------
  async function handleScripted(speaker: Who, text: string, result: ReturnType<typeof matchUtterance>) {
    const d = dataRef.current;
    if (speaker === "doctor") {
      const check = needsClarification(result.flags);
      if (check.needed) {
        setPending({ kind: "scripted", original: text, question: check.question, options: check.options });
        setStatus("Waiting for safety check");
        return;
      }
    }
    const listener = speaker === "patient" ? d.doctorLang ?? "en" : d.patientLang ?? "hi";
    const out = await localize(result.translation, listener);
    if (speaker === "doctor") addTurns([{ speaker, original: text, translation: out.text, time: nowTime() }]);
    else addPatientTurn(text, out.text, result.translation, false);
    speakText(out.text, out.lang);
  }

  // ---------- Live sentences (any language) ----------
  async function handleLive(speaker: Who, text: string, from: string, to: string) {
    setStatus("Translating");
    try {
      const english = await translateText(text, from, "en");
      if (speaker === "doctor") {
        const facts = extractFacts(english);
        if (facts.length) {
          setPending({ kind: "live", original: text, english, facts, from, to });
          setStatus("Waiting for safety check");
          return;
        }
        const translation = await translateText(text, from, to);
        addTurns([{ speaker, original: text, translation, live: true, time: nowTime() }]);
        speakText(translation, findLanguage(to).speech);
      } else {
        const translation = await translateText(text, from, to);
        addPatientTurn(text, translation, english, true);
        speakText(translation, findLanguage(to).speech);
      }
      setRetry(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Live translation failed.";
      addTurns([
        { speaker, original: text, translation: "", live: true, time: nowTime() },
        { speaker: "system", original: `Not translated yet: ${message}`, translation: "", time: nowTime() },
      ]);
      setRetry({ speaker, text, from, to });
    }
    setStatus("Ready");
  }

  // ---------- Routing: who spoke, in which language ----------
  // Detects the language of what was said. If it is the doctor's language, the doctor spoke;
  // any other language is the patient, and the patient's language is updated automatically.
  async function route(text: string, expected?: Who) {
    const d = dataRef.current;
    const doctorCode = d.doctorLang ?? "en";
    let patientCode = d.patientLang ?? "hi";

    // Demo sentences keep their scripted behaviour.
    const scripted = matchUtterance(text);
    if (!scripted.flags.includes("unclear")) {
      const speaker = expected ?? (scripted.flags.length ? "doctor" : "patient");
      await handleScripted(speaker, text, scripted);
      setTurn(other(speaker));
      return;
    }

    const found = await detectLanguage(text, patientCode === "mr" ? "mr" : "hi");
    let speaker: Who = expected ?? turn;
    let from = speaker === "patient" ? patientCode : doctorCode;

    if (found.code && patientCode !== doctorCode) {
      // Trust the detection over the expected turn only when it is certain (Indian scripts or a confident detector),
      // or when nobody said who was speaking (the auto "Send" button).
      if (found.sure || !expected) {
        if (found.code === doctorCode) {
          speaker = "doctor";
          from = doctorCode;
        } else {
          speaker = "patient";
          from = found.code;
          if (found.code !== patientCode) {
            patientCode = found.code;
            const lang = findLanguage(found.code);
            setData((prev) => ({ ...prev, patientLang: lang.code, patientLanguage: lang.name }));
            addTurns([{ speaker: "system", original: `Patient language detected: ${lang.name} (${lang.native})`, translation: "", time: nowTime() }]);
          }
        }
      }
    }

    const to = speaker === "patient" ? doctorCode : patientCode;
    await handleLive(speaker, text, from, to);
    setTurn(other(speaker));
  }

  // ---------- Inputs ----------
  // One big button: tap to speak, tap again to stop. It listens in the language of whoever's turn it is.
  function tapToSpeak() {
    if (listening) {
      listening.stop();
      return;
    }
    warmAll();
    setNote("");
    const speaker = turn;
    const session = startListening(speaker === "patient" ? patient.speech : doctor.speech);
    setListening(session);
    setStatus(`Listening to the ${speaker}`);
    session.result
      .then((heard) => {
        setListening(null);
        setStatus("Ready");
        void route(heard, speaker);
      })
      .catch(() => {
        setListening(null);
        setStatus("Ready");
        setNote("I didn't hear anything. Tap the big button and speak again.");
      });
  }

  function sendTyped(expected?: Who) {
    if (!typed.trim()) return;
    warmAll();
    void route(typed.trim(), expected);
    setTyped("");
  }

  function speakDemo(speaker: Who, text: string) {
    warmAll();
    setStatus("Listening");
    setTimeout(() => setStatus("Understanding"), 800);
    setTimeout(() => {
      void route(text, speaker);
      setStatus((s) => (s === "Waiting for safety check" ? s : "Speaking"));
    }, 1600);
    setTimeout(() => setStatus((s) => (s === "Waiting for safety check" ? s : "Ready")), 2400);
  }

  // Retries a sentence after the language pack is prepared (this tap allows the download).
  function prepareAndRetry() {
    if (!retry) return;
    warmUp(retry.from, retry.to);
    warmUp(retry.from, "en");
    warmUp("en", retry.to);
    const r = retry;
    setRetry(null);
    void handleLive(r.speaker, r.text, r.from, r.to);
  }

  // ---------- Safety check ----------
  async function confirmScripted(option: string) {
    if (!pending || pending.kind !== "scripted") return;
    const patientCode = dataRef.current.patientLang ?? "hi";
    warmUp("en", patientCode);
    const english = translateToPatient(option);
    const original = pending.original;
    setPending(null);
    setStatus("Translating");
    const out = await localize(english, patientCode);
    addTurns(
      [
        { speaker: "doctor", original, translation: out.text, confirmed: true, time: nowTime() },
        { speaker: "system", original: `Confirmed: ${option}`, translation: "", time: nowTime() },
      ],
      { instructions: [out.text], expectedUnderstanding: expectedFor(option), liveFacts: [] }
    );
    speakText(out.text, out.lang);
    setStatus("Ready");
  }

  async function confirmLive() {
    if (!pending || pending.kind !== "live") return;
    const { original, facts, from, to } = pending;
    warmUp(from, to);
    setPending(null);
    setStatus("Translating");
    try {
      const translation = await translateText(original, from, to);
      addTurns(
        [
          { speaker: "doctor", original, translation, confirmed: true, live: true, time: nowTime() },
          { speaker: "system", original: `Confirmed: ${facts.join(", ")}`, translation: "", time: nowTime() },
        ],
        { instructions: [translation], expectedUnderstanding: "live", liveFacts: facts }
      );
      speakText(translation, findLanguage(to).speech);
    } catch {
      setNote("Live translation failed. Tap 'Prepare languages' and confirm again, or use the demo buttons.");
    }
    setStatus("Ready");
  }

  function repeat() {
    setPending(null);
    setStatus("Ready");
  }

  const busy = status !== "Ready";
  const turnLang = turn === "patient" ? patient : doctor;

  return (
    <PageShell title="Consultation">
      <div className="rounded-2xl bg-blue-50 p-3 text-center text-blue-900">
        <p className="font-semibold">
          Patient: {patient.name} ({patient.native}){data.patientAuto ? " · detected automatically" : ""}
        </p>
        <p className="font-semibold">Doctor: {doctor.name} ({doctor.native})</p>
        <p className="mt-1 text-sm text-slate-600" aria-live="polite">Status: {status}</p>
      </div>

      {/* Conversation */}
      <div className="flex flex-col gap-3 min-h-[120px]">
        {data.turns.length === 0 && (
          <p className="text-center text-slate-500">Tap the big button and speak. VANISETU works out who spoke and in which language.</p>
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
                  <p className="mt-2 text-xs text-teal-800">{line.confirmed ? "AI translation (confirmed)" : "AI translation"}</p>
                  <p className="text-lg font-semibold text-blue-900">{line.translation}</p>
                </>
              )}
            </div>
          )
        )}
      </div>

      {retry && (
        <button onClick={prepareAndRetry} className="min-h-[56px] w-full rounded-2xl bg-orange-600 text-white text-lg font-semibold">
          Prepare {findLanguage(retry.from).name} → {findLanguage(retry.to).name} and translate
        </button>
      )}
      {note && <p className="text-sm text-orange-700">{note}</p>}

      {/* Turn-based speaking: one big button */}
      {canListen() && (
        <div className="rounded-2xl border-2 border-slate-200 p-4 flex flex-col gap-3 items-center text-center">
          <p className="text-sm text-slate-600">Next to speak</p>
          <p className="text-2xl font-bold text-blue-900">
            {turn === "patient" ? "🧑 Patient" : "🩺 Doctor"} · {turnLang.native}
          </p>
          <button
            onClick={tapToSpeak}
            disabled={busy && !listening}
            aria-pressed={Boolean(listening)}
            className={`min-h-[72px] w-full rounded-2xl text-white text-xl font-bold disabled:opacity-50 ${
              listening ? "bg-red-600 hover:bg-red-700" : turn === "patient" ? "bg-teal-600 hover:bg-teal-700" : "bg-blue-700 hover:bg-blue-800"
            }`}
          >
            {listening ? "■ Stop listening" : `🎙 Tap and speak (${turnLang.name})`}
          </button>
          <p className="text-xs text-slate-500">Stops by itself when you stop talking. The turn then passes to the other person.</p>
          {!listening && (
            <button onClick={() => setTurn(other(turn))} className="text-sm text-teal-700 underline">
              Switch to {other(turn)}
            </button>
          )}
        </div>
      )}

      {/* Type or dictate: language and speaker are detected automatically */}
      <div className="flex flex-col gap-2">
        <label htmlFor="typed" className="text-sm text-slate-600">
          Type or dictate in any language (Wispr Flow works here). VANISETU detects the language and who is speaking.
        </label>
        <input
          id="typed"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendTyped()}
          className="min-h-[48px] rounded-2xl border-2 border-slate-300 px-3"
          placeholder="e.g. ನನಗೆ ಎರಡು ದಿನದಿಂದ ಜ್ವರ ಇದೆ"
        />
        <button onClick={() => sendTyped()} disabled={busy} className="min-h-[48px] rounded-2xl bg-slate-800 text-white font-semibold disabled:opacity-50">
          Send (auto-detect)
        </button>
        <div className="flex gap-2">
          <button onClick={() => sendTyped("patient")} disabled={busy}
            className="flex-1 min-h-[48px] rounded-2xl border-2 border-teal-600 text-teal-700 font-semibold disabled:opacity-50">
            Send as patient
          </button>
          <button onClick={() => sendTyped("doctor")} disabled={busy}
            className="flex-1 min-h-[48px] rounded-2xl border-2 border-blue-700 text-blue-800 font-semibold disabled:opacity-50">
            Send as doctor
          </button>
        </div>
      </div>

      {live && patient.code !== doctor.code && (() => {
        const values = Object.values(packs);
        const ready = values.length > 0 && values.every((v) => v >= 100);
        return (
          <details className="rounded-2xl border border-slate-200 p-3 text-sm text-slate-600">
            <summary className="cursor-pointer font-semibold">
              {ready ? "Translation ready ✓" : values.length ? "Preparing translation…" : "Translation status"}
            </summary>
            <div className="mt-2 flex flex-col gap-2">
              <p>Translation runs inside this browser. The first time a language is used, it is downloaded once.</p>
              {values.length > 0 && (
                <ul className="text-xs flex flex-wrap gap-x-3">
                  {Object.entries(packs).map(([pair, pct]) => (
                    <li key={pair}>{pair.replace(">", " → ")}: {pct >= 100 ? "ready" : `${pct}%`}</li>
                  ))}
                </ul>
              )}
              <button onClick={warmAll} className="min-h-[44px] rounded-2xl bg-slate-200 font-semibold text-slate-800">
                Prepare {patient.name} ↔ {doctor.name} now
              </button>
            </div>
          </details>
        );
      })()}

      {/* Scripted demo lines */}
      <p className="text-xs text-slate-500">Demo lines (scripted Hindi patient line and English doctor line; always work offline).</p>
      <div className="flex gap-2">
        <button onClick={() => speakDemo("patient", PATIENT_SENTENCE)} disabled={busy}
          className="flex-1 min-h-[48px] rounded-2xl border-2 border-teal-600 text-teal-700 font-semibold disabled:opacity-50">
          🎤 Patient: Hold to speak
        </button>
        <button onClick={() => speakDemo("doctor", DOCTOR_SENTENCE)} disabled={busy}
          className="flex-1 min-h-[48px] rounded-2xl border-2 border-blue-700 text-blue-800 font-semibold disabled:opacity-50">
          🎤 Doctor: Hold to speak
        </button>
      </div>

      <button
        onClick={() => navigate("/teachback")}
        disabled={data.instructions.length === 0}
        className="min-h-[56px] w-full rounded-2xl bg-orange-600 text-white text-lg font-semibold hover:bg-orange-700 disabled:opacity-40"
      >
        Check understanding
      </button>
      <button onClick={() => navigate("/summary")} className="text-teal-700 underline">Skip to summary</button>

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
                  <button key={option} onClick={() => void confirmScripted(option)}
                    className="min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700">
                    {option}
                  </button>
                ))}
              </>
            ) : (
              <>
                {pending.english !== pending.original && <p className="text-slate-600 text-sm">In English: “{pending.english}”</p>}
                <p className="text-slate-700">Please confirm these details before they are translated:</p>
                <ul className="flex flex-wrap gap-2">
                  {pending.facts.map((f) => (
                    <li key={f} className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800">{f}</li>
                  ))}
                </ul>
                <button onClick={() => void confirmLive()}
                  className="min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700">
                  Yes, these are correct
                </button>
              </>
            )}
            <button onClick={repeat}
              className="min-h-[56px] w-full rounded-2xl border-2 border-slate-400 text-slate-700 text-lg font-semibold hover:bg-slate-100">
              Repeat
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}

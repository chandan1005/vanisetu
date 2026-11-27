import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { matchUtterance, needsClarification, translateToPatient, expectedFor } from "../mockAI";
import { getCurrent, newConsultation, setCurrent } from "../storage";
import { canListen, listenOnce, speakText } from "../speech";
import type { Consultation as ConsultationData, Turn } from "../types";

// The scripted sentences for the demo buttons.
const PATIENT_SENTENCE = "Mujhe teen din se bukhar hai";
const DOCTOR_SENTENCE = "Take two tablets after food";

const nowTime = () => new Date().toTimeString().slice(0, 8);

export default function Consultation() {
  const navigate = useNavigate();
  const [data, setData] = useState<ConsultationData>(() => getCurrent() ?? newConsultation());
  const [status, setStatus] = useState("Ready");
  const [typed, setTyped] = useState("");
  const [micError, setMicError] = useState("");
  const [pending, setPending] = useState<{ original: string; question: string; options: string[] } | null>(null);

  // Keep the consultation in progress saved, so Teach-back and Summary can read it.
  useEffect(() => setCurrent(data), [data]);

  function addTurns(turns: Turn[], extra: Partial<ConsultationData> = {}) {
    setData((prev) => ({ ...prev, ...extra, turns: [...prev.turns, ...turns] }));
  }

  // Handles one spoken (or typed) sentence from the patient or the doctor.
  function handle(speaker: "patient" | "doctor", text: string) {
    const result = matchUtterance(text);

    if (result.flags.includes("unclear")) {
      addTurns([
        { speaker, original: text, translation: "", time: nowTime() },
        { speaker: "system", original: "Not understood. Please say it again.", translation: "", time: nowTime() },
      ]);
      return;
    }

    if (speaker === "doctor") {
      const check = needsClarification(result.flags);
      if (check.needed) {
        // Risky detail: do not translate yet. Ask the doctor first.
        setPending({ original: text, question: check.question, options: check.options });
        setStatus("Waiting for safety check");
        return;
      }
    }

    setData((prev) => ({
      ...prev,
      symptoms:
        speaker === "patient" && !prev.symptoms.includes(result.translation)
          ? [...prev.symptoms, result.translation]
          : prev.symptoms,
      turns: [...prev.turns, { speaker, original: text, translation: result.translation, time: nowTime() }],
    }));
    speakText(result.translation, speaker === "patient" ? "en-IN" : "hi-IN");
  }

  // Plays the status steps (Listening, Understanding, Speaking), then handles the sentence.
  function speak(speaker: "patient" | "doctor", text: string) {
    setStatus("Listening");
    setTimeout(() => setStatus("Understanding"), 800);
    setTimeout(() => {
      handle(speaker, text);
      setStatus((s) => (s === "Waiting for safety check" ? s : "Speaking"));
    }, 1600);
    setTimeout(() => setStatus((s) => (s === "Waiting for safety check" ? s : "Ready")), 2400);
  }

  // Uses the real microphone (Chrome only), then handles what was heard.
  async function speakWithMic(speaker: "patient" | "doctor") {
    setMicError("");
    setStatus("Listening");
    try {
      const heard = await listenOnce(speaker === "patient" ? "hi-IN" : "en-IN");
      setStatus("Ready");
      handle(speaker, heard);
    } catch (err) {
      setStatus("Ready");
      setMicError("I didn't hear anything clearly. Please hold the button and speak again, or use the demo button.");
    }
  }

  // Runs when the doctor taps one of the safety-check options.
  function confirm(option: string) {
    if (!pending) return;
    const translated = translateToPatient(option);
    addTurns(
      [
        { speaker: "doctor", original: pending.original, translation: translated, confirmed: true, time: nowTime() },
        { speaker: "system", original: `Confirmed: ${option}`, translation: "", time: nowTime() },
      ],
      { instructions: [translated], expectedUnderstanding: expectedFor(option) }
    );
    speakText(translated, "hi-IN");
    setPending(null);
    setStatus("Ready");
  }

  // Closes the popup without confirming, so the doctor can speak again.
  function repeat() {
    setPending(null);
    setStatus("Ready");
  }

  function sendTyped(speaker: "patient" | "doctor") {
    if (!typed.trim()) return;
    handle(speaker, typed.trim());
    setTyped("");
  }

  const busy = status !== "Ready";

  return (
    <PageShell title="Consultation">
      <div className="rounded-2xl bg-blue-50 p-3 text-center text-blue-900">
        <p className="font-semibold">Patient: Odia (ଓଡ଼ିଆ)</p>
        <p className="font-semibold">Doctor: Kannada (ಕನ್ನಡ)</p>
        <p className="mt-1 text-sm text-slate-600" aria-live="polite">Status: {status}</p>
      </div>

      {/* Conversation */}
      <div className="flex flex-col gap-3 min-h-[120px]">
        {data.turns.length === 0 && (
          <p className="text-center text-slate-500">Press a speak button to start the conversation.</p>
        )}
        {data.turns.map((line, index) =>
          line.speaker === "system" ? (
            <p key={index} className="text-center text-sm font-semibold text-orange-700">{line.original}</p>
          ) : (
            <div
              key={index}
              className={`rounded-2xl p-3 w-[90%] ${line.speaker === "patient" ? "bg-slate-100 self-start" : "bg-teal-50 self-end"}`}
            >
              <p className="text-xs text-slate-500">{line.speaker === "patient" ? "Patient" : "Doctor"} (original)</p>
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

      {micError && <p className="text-sm text-orange-700">{micError}</p>}

      {/* Demo speak buttons (scripted lines) */}
      <button
        onClick={() => speak("patient", PATIENT_SENTENCE)}
        disabled={busy}
        className="min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700 disabled:opacity-50"
      >
        🎤 Patient: Hold to speak
      </button>
      <button
        onClick={() => speak("doctor", DOCTOR_SENTENCE)}
        disabled={busy}
        className="min-h-[56px] w-full rounded-2xl bg-blue-700 text-white text-lg font-semibold hover:bg-blue-800 disabled:opacity-50"
      >
        🎤 Doctor: Hold to speak
      </button>

      {/* Optional real microphone (Chrome) */}
      {canListen() && (
        <div className="flex gap-2">
          <button
            onClick={() => speakWithMic("patient")}
            disabled={busy}
            className="flex-1 min-h-[48px] rounded-2xl border-2 border-teal-600 text-teal-700 font-semibold disabled:opacity-50"
          >
            Patient mic
          </button>
          <button
            onClick={() => speakWithMic("doctor")}
            disabled={busy}
            className="flex-1 min-h-[48px] rounded-2xl border-2 border-blue-700 text-blue-800 font-semibold disabled:opacity-50"
          >
            Doctor mic
          </button>
        </div>
      )}

      {/* Type or dictate (Wispr Flow works in this field) */}
      <div className="flex flex-col gap-2">
        <label htmlFor="typed" className="text-sm text-slate-600">Type or dictate a sentence</label>
        <input
          id="typed"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="min-h-[48px] rounded-2xl border-2 border-slate-300 px-3"
          placeholder="e.g. Take medicine twice daily"
        />
        <div className="flex gap-2">
          <button onClick={() => sendTyped("patient")} className="flex-1 min-h-[44px] rounded-2xl bg-slate-200 font-semibold">
            Send as patient
          </button>
          <button onClick={() => sendTyped("doctor")} className="flex-1 min-h-[44px] rounded-2xl bg-slate-200 font-semibold">
            Send as doctor
          </button>
        </div>
      </div>

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
            <p className="text-slate-700">{pending.question}</p>
            {pending.options.map((option) => (
              <button
                key={option}
                onClick={() => confirm(option)}
                className="min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700"
              >
                {option}
              </button>
            ))}
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

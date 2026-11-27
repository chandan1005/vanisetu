import { useState } from "react";
import { Link } from "react-router-dom";
import {
  matchUtterance,
  needsClarification,
  translateToPatient,
} from "../mockAI";

// One line in the conversation.
type Line = {
  kind: "speech" | "system";
  speaker?: "patient" | "doctor";
  original?: string;
  translation?: string;
  label?: string;
};

// The scripted sentences for the demo.
const PATIENT_SENTENCE = "Mujhe teen din se bukhar hai";
const DOCTOR_SENTENCE = "Take two tablets after food";

export default function Consultation() {
  const [lines, setLines] = useState<Line[]>([]);
  const [status, setStatus] = useState("Ready");
  // The doctor's line waiting for a safety check, if any.
  const [pending, setPending] = useState<{
    original: string;
    question: string;
    options: string[];
  } | null>(null);

  // Plays the status steps, then adds a patient line or opens the safety check.
  function speak(speaker: "patient" | "doctor", text: string) {
    setStatus("Listening");
    setTimeout(() => setStatus("Understanding"), 800);
    setTimeout(() => {
      const result = matchUtterance(text);

      if (speaker === "doctor") {
        const check = needsClarification(result.flags);
        if (check.needed) {
          // Do not translate yet. Ask the doctor first.
          setPending({
            original: text,
            question: check.question,
            options: check.options,
          });
          setStatus("Waiting for safety check");
          return;
        }
      }

      setLines((prev) => [
        ...prev,
        {
          kind: "speech",
          speaker,
          original: text,
          translation: result.translation,
        },
      ]);
      setStatus("Speaking");
    }, 1600);
    setTimeout(() => setStatus("Ready"), 2400);
  }

  // Runs when the doctor taps one of the two options.
  function confirm(option: string) {
    if (!pending) return;
    const translated = translateToPatient(option);
    setLines((prev) => [
      ...prev,
      {
        kind: "speech",
        speaker: "doctor",
        original: pending.original,
        translation: translated,
      },
      { kind: "system", label: `Confirmed: ${option}` },
    ]);
    setPending(null);
    setStatus("Ready");
  }

  // Closes the popup without confirming, so the doctor can speak again.
  function repeat() {
    setPending(null);
    setStatus("Ready");
  }

  return (
    <div className="min-h-screen bg-white flex justify-center p-4">
      <div className="w-full max-w-[420px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-teal-700 underline">Back to Home</Link>
          <span className="text-sm text-slate-600">Demo</span>
        </div>

        <div className="rounded-2xl bg-blue-50 p-3 text-center text-blue-900">
          <p className="font-semibold">Patient: Odia (ଓଡ଼ିଆ)</p>
          <p className="font-semibold">Doctor: Kannada (ಕನ್ನಡ)</p>
          <p className="mt-1 text-sm text-slate-600">Status: {status}</p>
        </div>

        {/* Conversation */}
        <div className="flex flex-col gap-3 min-h-[160px]">
          {lines.map((line, index) =>
            line.kind === "system" ? (
              <p key={index} className="text-center text-sm font-semibold text-orange-700">
                {line.label}
              </p>
            ) : (
              <div
                key={index}
                className={`rounded-2xl p-3 w-[90%] ${
                  line.speaker === "patient" ? "bg-slate-100 self-start" : "bg-teal-50 self-end"
                }`}
              >
                <p className="text-xs text-slate-500">
                  {line.speaker === "patient" ? "Patient" : "Doctor"} (original)
                </p>
                <p className="text-sm text-slate-500">{line.original}</p>
                {line.translation && (
                  <>
                    <p className="mt-2 text-xs text-teal-800">
                      {line.speaker === "doctor" ? "AI translation (confirmed)" : "AI translation"}
                    </p>
                    <p className="text-lg font-semibold text-blue-900">{line.translation}</p>
                  </>
                )}
              </div>
            )
          )}
        </div>

        {/* Hold-to-speak buttons */}
        <button
          onClick={() => speak("patient", PATIENT_SENTENCE)}
          disabled={status !== "Ready"}
          className="min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700 disabled:opacity-50"
        >
          🎤 Patient: Hold to speak
        </button>
        <button
          onClick={() => speak("doctor", DOCTOR_SENTENCE)}
          disabled={status !== "Ready"}
          className="min-h-[56px] w-full rounded-2xl bg-blue-700 text-white text-lg font-semibold hover:bg-blue-800 disabled:opacity-50"
        >
          🎤 Doctor: Hold to speak
        </button>
      </div>

      {/* Safety check popup */}
      {pending && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-[380px] rounded-2xl bg-white p-6 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-blue-900">Safety check</h2>
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
    </div>
  );
}
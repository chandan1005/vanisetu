import { useState } from "react";
import { Link } from "react-router-dom";
import { matchUtterance } from "../mockAI";

// One line in the conversation: who spoke, what was said, and the translation.
type Line = {
  speaker: "patient" | "doctor";
  original: string;
  translation: string;
  flags: string[];
};

// The scripted sentences for the demo. Pressing each button adds its sentence.
const PATIENT_SENTENCE = "Mujhe teen din se bukhar hai";
const DOCTOR_SENTENCE = "Take two tablets after food";

export default function Consultation() {
  const [lines, setLines] = useState<Line[]>([]);
  const [status, setStatus] = useState("Ready");

  // Plays the status steps (Listening, Understanding, Speaking), then adds the line.
  function speak(speaker: "patient" | "doctor", text: string) {
    setStatus("Listening");
    setTimeout(() => setStatus("Understanding"), 800);
    setTimeout(() => {
      const result = matchUtterance(text);
      setLines((prev) => [
        ...prev,
        {
          speaker,
          original: text,
          translation: result.translation,
          flags: result.flags,
        },
      ]);
      setStatus("Speaking");
    }, 1600);
    setTimeout(() => setStatus("Ready"), 2400);
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
          {lines.map((line, index) => (
            <div
              key={index}
              className={`rounded-2xl p-3 ${
                line.speaker === "patient" ? "bg-slate-100 self-start" : "bg-teal-50 self-end"
              } w-[90%]`}
            >
              <p className="text-xs text-slate-500">
                {line.speaker === "patient" ? "Patient" : "Doctor"} (original)
              </p>
              <p className="text-sm text-slate-500">{line.original}</p>
              {line.translation && (
                <>
                  <p className="mt-2 text-xs text-teal-800">AI translation</p>
                  <p className="text-lg font-semibold text-blue-900">{line.translation}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Hold-to-speak buttons: patient on top, doctor below */}
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
    </div>
  );
}
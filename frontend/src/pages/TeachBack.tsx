import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { checkTeachBack, reExplain, scriptedRepeat } from "../mockAI";
import { getCurrent, setCurrent } from "../storage";
import { canListen, speakText, startListening, type Listening } from "../speech";
import { findLanguage } from "../languages";
import { translateText, warmUp } from "../translator";
import { compareFacts, extractFacts } from "../safety";
import { detectLanguage } from "../detector";

export default function TeachBack() {
  const navigate = useNavigate();
  const current = getCurrent();
  const [asked, setAsked] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [answer, setAnswer] = useState("");
  const [missed, setMissed] = useState<string[]>([]);
  const [result, setResult] = useState<"Understood" | "Mismatch" | null>(null);
  const [explained, setExplained] = useState(false);
  const [typed, setTyped] = useState("");
  const [note, setNote] = useState("");
  const [listening, setListening] = useState<Listening | null>(null);

  if (!current || !current.expectedUnderstanding) {
    return (
      <PageShell title="Teach-back" back="/consult" backLabel="Back to Consultation">
        <p className="text-slate-700">There is no confirmed instruction yet. Finish the safety check in the consultation first.</p>
        <Link to="/consult" className="text-teal-700 underline">Go to Consultation</Link>
      </PageShell>
    );
  }

  const isLive = current.expectedUnderstanding === "live";
  const expectedFacts = current.liveFacts ?? [];
  const expectedLabel = isLive ? expectedFacts.filter((f) => !f.startsWith("time:")).join(", ") : current.expectedUnderstanding;
  const instruction = current.instructions[current.instructions.length - 1] ?? "";
  const patient = findLanguage(current.patientLang ?? "hi");

  function save(said: string, status: "Understood" | "Mismatch") {
    const latest = getCurrent();
    if (latest) {
      setCurrent({
        ...latest,
        teachBack: { expected: expectedLabel, patient: said, status, attempts: attempt + 1 },
        status: status === "Understood" ? "Verified" : "Mismatch",
      });
    }
  }

  // Checks the patient's answer: scripted rules for demo lines, fact comparison for live speech.
  async function record(said: string) {
    setNote("");
    let status: "Understood" | "Mismatch";
    let gaps: string[];
    if (isLive) {
      try {
        const found = await detectLanguage(said, patient.code === "mr" ? "mr" : "hi");
        const from = found.sure && found.code ? found.code : patient.code;
        const english = await translateText(said, from, "en");
        const check = compareFacts(expectedFacts, extractFacts(english));
        status = check.status;
        gaps = check.missing;
      } catch {
        setNote("Could not translate the answer. Please try again or ask staff to help.");
        return;
      }
    } else {
      // Scripted instruction: understand answers in any language by translating them to English first.
      let english = said;
      const found = await detectLanguage(said, patient.code === "mr" ? "mr" : "hi");
      if (found.sure && found.code && found.code !== "en") {
        try {
          english = await translateText(said, found.code, "en");
        } catch {
          english = said;
        }
      }
      const check = checkTeachBack(current!.expectedUnderstanding, english);
      status = check.status;
      gaps = check.missed ? [check.missed] : [];
    }
    setAnswer(said);
    setMissed(gaps);
    setResult(status);
    setExplained(false);
    setAttempt((a) => a + 1);
    save(said, status);
  }

  // Tap to listen to the patient; tap again to stop.
  function repeatWithMic() {
    if (listening) {
      listening.stop();
      return;
    }
    warmUp(patient.code, "en");
    setNote("");
    const session = startListening(patient.speech);
    setListening(session);
    session.result
      .then((heard) => {
        setListening(null);
        void record(heard);
      })
      .catch(() => {
        setListening(null);
        setNote("I didn't hear anything. Tap the button and speak again.");
      });
  }

  function explainAgain() {
    setExplained(true);
    speakText(isLive ? instruction : reExplain(current!.expectedUnderstanding), patient.speech);
  }

  const canAnswer = asked && (result === null || (result === "Mismatch" && explained));

  return (
    <PageShell title="Teach-back" back="/consult" backLabel="Back to Consultation">
      <div className="rounded-2xl bg-blue-50 p-4">
        <p className="text-sm text-slate-600">Doctor's instruction (in {patient.name})</p>
        <p className="text-lg font-semibold text-blue-900">{instruction}</p>
      </div>

      {!asked && (
        <button
          onClick={() => {
            setAsked(true);
            speakText(instruction, patient.speech);
          }}
          className="min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700"
        >
          Ask patient to repeat
        </button>
      )}

      {canAnswer && (
        <div className="flex flex-col gap-2">
          <p className="text-slate-700">Patient's answer</p>
          {canListen() && (
            <button
              onClick={repeatWithMic}
              className={`min-h-[72px] w-full rounded-2xl text-white text-xl font-bold ${listening ? "bg-red-600" : "bg-teal-600"}`}
            >
              {listening ? "■ Stop listening" : `🎙 Patient: tap and speak (${patient.name})`}
            </button>
          )}
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="min-h-[48px] rounded-2xl border-2 border-slate-300 px-3"
            placeholder="Type or dictate the patient's answer"
            aria-label="Patient's answer"
          />
          <button
            onClick={() => {
              warmUp(patient.code, "en");
              if (typed.trim()) void record(typed.trim());
              setTyped("");
            }}
            className="min-h-[44px] rounded-2xl bg-slate-200 font-semibold"
          >
            Check this answer
          </button>
          {!isLive && (
            <button
              onClick={() => void record(scriptedRepeat(current.expectedUnderstanding, attempt))}
              className="min-h-[56px] w-full rounded-2xl border-2 border-teal-600 text-teal-700 text-lg font-semibold"
            >
              🎤 {result === null ? "Patient: Hold to speak" : "Patient repeats"}
            </button>
          )}
        </div>
      )}
      {note && <p className="text-sm text-orange-700">{note}</p>}

      {result === "Mismatch" && (
        <div className="rounded-2xl border-2 border-orange-500 bg-orange-50 p-4 flex flex-col gap-2" aria-live="polite">
          <p className="text-xl font-bold text-orange-700">⚠ Mismatch</p>
          <p><span className="font-semibold">Expected:</span> {expectedLabel}</p>
          <p><span className="font-semibold">Patient:</span> {answer}</p>
          {missed.length > 0 && <p><span className="font-semibold">Missed:</span> {missed.join(", ")}</p>}
          {!explained ? (
            <button onClick={explainAgain} className="min-h-[56px] w-full rounded-2xl bg-orange-600 text-white text-lg font-semibold hover:bg-orange-700">
              Explain again
            </button>
          ) : (
            <p className="rounded-xl bg-white p-3 text-blue-900 font-semibold">
              {isLive ? instruction : reExplain(current.expectedUnderstanding)}
            </p>
          )}
        </div>
      )}

      {result === "Understood" && (
        <div className="rounded-2xl border-2 border-green-600 bg-green-50 p-4" aria-live="polite">
          <p className="text-xl font-bold text-green-700">✓ Understood</p>
          <p className="text-slate-700">Patient said: {answer}</p>
        </div>
      )}

      <button
        onClick={() => navigate("/summary")}
        disabled={result === null}
        className="min-h-[56px] w-full rounded-2xl bg-blue-700 text-white text-lg font-semibold hover:bg-blue-800 disabled:opacity-40"
      >
        Continue to Summary
      </button>
    </PageShell>
  );
}

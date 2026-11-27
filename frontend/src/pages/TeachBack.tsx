import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { checkTeachBack, reExplain, scriptedRepeat } from "../mockAI";
import { getCurrent, setCurrent } from "../storage";
import { canListen, listenOnce, speakText } from "../speech";

export default function TeachBack() {
  const navigate = useNavigate();
  const current = getCurrent();
  const [asked, setAsked] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"Understood" | "Mismatch" | null>(null);
  const [explained, setExplained] = useState(false);
  const [micError, setMicError] = useState("");

  if (!current || !current.expectedUnderstanding) {
    return (
      <PageShell title="Teach-back" back="/consult" backLabel="Back to Consultation">
        <p className="text-slate-700">There is no confirmed instruction yet. Finish the safety check in the consultation first.</p>
        <Link to="/consult" className="text-teal-700 underline">Go to Consultation</Link>
      </PageShell>
    );
  }

  const expected = current.expectedUnderstanding;
  const instruction = current.instructions[current.instructions.length - 1] ?? "";

  // Records the patient's answer and checks it against the doctor's instruction.
  function record(said: string) {
    const check = checkTeachBack(expected, said);
    setAnswer(said);
    setResult(check.status);
    setExplained(false);
    setAttempt((a) => a + 1);
    const latest = getCurrent();
    if (latest) {
      setCurrent({
        ...latest,
        teachBack: { expected, patient: said, status: check.status, attempts: attempt + 1 },
        status: check.status === "Understood" ? "Verified" : "Mismatch",
      });
    }
  }

  async function repeatWithMic() {
    setMicError("");
    try {
      record(await listenOnce("hi-IN"));
    } catch {
      setMicError("I didn't hear anything clearly. Please try again, or use the demo button.");
    }
  }

  function explainAgain() {
    const text = reExplain(expected);
    setExplained(true);
    speakText(text, "hi-IN");
  }

  return (
    <PageShell title="Teach-back" back="/consult" backLabel="Back to Consultation">
      <div className="rounded-2xl bg-blue-50 p-4">
        <p className="text-sm text-slate-600">Doctor's instruction</p>
        <p className="text-lg font-semibold text-blue-900">{instruction}</p>
      </div>

      {!asked ? (
        <button
          onClick={() => {
            setAsked(true);
            speakText("Please tell me how you will take your medicine.", "hi-IN");
          }}
          className="min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700"
        >
          Ask patient to repeat
        </button>
      ) : (
        <>
          <p className="text-slate-700">Patient's answer</p>
          {(result === null || (result === "Mismatch" && explained)) && (
            <>
              <button
                onClick={() => record(scriptedRepeat(expected, attempt))}
                className="min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700"
              >
                🎤 {result === null ? "Patient: Hold to speak" : "Patient repeats"}
              </button>
              {canListen() && (
                <button onClick={repeatWithMic} className="min-h-[48px] w-full rounded-2xl border-2 border-teal-600 text-teal-700 font-semibold">
                  Patient mic
                </button>
              )}
            </>
          )}
          {micError && <p className="text-sm text-orange-700">{micError}</p>}
        </>
      )}

      {result === "Mismatch" && (
        <div className="rounded-2xl border-2 border-orange-500 bg-orange-50 p-4 flex flex-col gap-2" aria-live="polite">
          <p className="text-xl font-bold text-orange-700">⚠ Mismatch</p>
          <p><span className="font-semibold">Expected:</span> {expected}</p>
          <p><span className="font-semibold">Patient:</span> {answer}</p>
          {!explained ? (
            <button
              onClick={explainAgain}
              className="min-h-[56px] w-full rounded-2xl bg-orange-600 text-white text-lg font-semibold hover:bg-orange-700"
            >
              Explain again
            </button>
          ) : (
            <p className="rounded-xl bg-white p-3 text-blue-900 font-semibold">{reExplain(expected)}</p>
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

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { hasKey } from "../mockAI";
import { newConsultation, setCurrent } from "../storage";
import { LANGUAGES } from "../languages";
import { liveTranslationSupported, warmUpConsultation } from "../translator";
import { warmUpDetector } from "../detector";

export default function Home() {
  const navigate = useNavigate();
  const [patientLang, setPatientLang] = useState("auto");
  const [doctorLang, setDoctorLang] = useState("en");
  const live = liveTranslationSupported();

  // Starts a fresh consultation with the chosen languages and opens the Consultation screen.
  function start() {
    setCurrent(newConsultation(patientLang, doctorLang));
    // Start downloading language packs now: Chrome only allows this during a tap or click.
    warmUpDetector();
    warmUpConsultation(patientLang === "auto" ? "hi" : patientLang, doctorLang);
    navigate("/consult");
  }

  const select = "min-h-[48px] w-full rounded-2xl border-2 border-slate-300 bg-white px-3 text-lg";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] flex flex-col items-center gap-6 text-center">
        <div>
          <h1 className="text-4xl font-bold text-blue-900">VANISETU</h1>
          <p className="mt-2 text-lg text-slate-600">No Patient Lost in Translation</p>
        </div>

        <div className="w-full flex flex-col gap-3 text-left">
          <label className="text-sm font-semibold text-slate-700" htmlFor="patientLang">Patient speaks</label>
          <select id="patientLang" value={patientLang} onChange={(e) => setPatientLang(e.target.value)} className={select}>
            <option value="auto">Detect automatically (recommended)</option>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.name} ({l.native})</option>
            ))}
          </select>
          <label className="text-sm font-semibold text-slate-700" htmlFor="doctorLang">Doctor speaks (set once)</label>
          <select id="doctorLang" value={doctorLang} onChange={(e) => setDoctorLang(e.target.value)} className={select}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.name} ({l.native})</option>
            ))}
          </select>
        </div>

        <div className="w-full flex flex-col gap-4">
          <button
            onClick={start}
            className="flex items-center justify-center min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            Start Consultation
          </button>
          <Link
            to="/history"
            className="flex items-center justify-center min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            My Consultations
          </Link>
        </div>

        <p className="text-sm text-slate-600">
          {live ? "Translation works in this browser. No account needed." : "Translation is not available in this browser. Sample lines still work."}
        </p>
        <details className="w-full text-left text-xs text-slate-500">
          <summary className="cursor-pointer">About this demo</summary>
          <ul className="mt-2 list-disc pl-5 flex flex-col gap-1">
            <li>{hasKey() ? "AI key set." : "AI key not set: no API keys are used. Sample (scripted) lines always work offline."}</li>
            <li>{live ? "Live translation runs on this device in Chrome (free)." : "Live translation needs recent desktop Chrome."}</li>
            <li>All data is fictional and saved only in this browser.</li>
          </ul>
        </details>

        <p className="text-xs text-slate-500">Demo • Fictional data • No diagnosis or medical advice</p>
      </div>
    </div>
  );
}

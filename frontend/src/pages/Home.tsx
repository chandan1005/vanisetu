import { Link, useNavigate } from "react-router-dom";
import { hasKey } from "../mockAI";
import { newConsultation, setCurrent } from "../storage";

export default function Home() {
  const navigate = useNavigate();

  // Starts a fresh consultation and opens the Consultation screen.
  function start() {
    setCurrent(newConsultation());
    navigate("/consult");
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] flex flex-col items-center gap-6 text-center">
        <div>
          <h1 className="text-4xl font-bold text-blue-900">VANISETU</h1>
          <p className="mt-2 text-lg text-slate-600">No Patient Lost in Translation</p>
        </div>

        <div className="w-full flex flex-col gap-4 mt-6">
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
          {hasKey() ? "AI key set" : "AI key not set: using scripted responses"}
        </p>

        <p className="mt-4 text-xs text-slate-500">
          Demo • Fictional data • Scripted responses
        </p>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] flex flex-col items-center gap-6 text-center">
        <div>
          <h1 className="text-4xl font-bold text-blue-900">VANISETU</h1>
          <p className="mt-2 text-lg text-slate-600">No Patient Lost in Translation</p>
        </div>

        <div className="w-full flex flex-col gap-4 mt-6">
          <Link
            to="/consult"
            className="flex items-center justify-center min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            Start Consultation
          </Link>
          <Link
            to="/history"
            className="flex items-center justify-center min-h-[56px] w-full rounded-2xl bg-teal-600 text-white text-lg font-semibold hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            My Consultations
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-500">
          Demo • Fictional data • Scripted responses
        </p>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import { clearAll, listConsultations } from "../storage";

export default function History() {
  const [items, setItems] = useState(listConsultations);

  function reset() {
    if (window.confirm("Delete all saved demo consultations?")) {
      clearAll();
      setItems([]);
    }
  }

  return (
    <PageShell title="My Consultations">
      {items.length === 0 ? (
        <p className="text-slate-700">No consultations yet. Start one from Home.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((c) => (
            <li key={c.id} className="rounded-2xl border border-slate-200 p-4 flex flex-col gap-1">
              <p className="font-semibold text-blue-900">{c.facility}</p>
              <p className="text-sm text-slate-600">{c.date} at {c.time} • {c.id}</p>
              <p className="text-sm">
                Status:{" "}
                <span className={c.status === "Verified" ? "text-green-700 font-semibold" : c.status === "Mismatch" ? "text-orange-700 font-semibold" : "text-slate-600"}>
                  {c.status}
                </span>
              </p>
              <Link to={`/history/${c.id}`} className="mt-2 flex items-center justify-center min-h-[48px] rounded-2xl bg-teal-600 text-white font-semibold">
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
      {items.length > 0 && (
        <button onClick={reset} className="text-sm text-slate-500 underline self-center">
          Demo reset: delete all
        </button>
      )}
    </PageShell>
  );
}

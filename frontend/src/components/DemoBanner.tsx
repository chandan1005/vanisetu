// Always-visible notice so nobody mistakes the prototype for a clinical tool.
export default function DemoBanner() {
  return (
    <p className="sticky top-0 z-20 rounded-xl bg-yellow-50 border border-yellow-300 px-3 py-2 text-xs text-yellow-900 shadow-sm" role="note">
      <span className="font-bold">PROTOTYPE · </span>
      Sample lines are scripted. Real speech is translated by your browser. Fictional data. Not for real patient care.
    </p>
  );
}

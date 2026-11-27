export default function Placeholder({ name }: { name: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold text-blue-900">VANISETU</h1>
      <p className="text-slate-600">Placeholder: {name}</p>
      <a href="/" className="text-teal-700 underline">Back to Home</a>
    </div>
  );
}
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

// Shared page frame: back link, page title and a narrow mobile-first column.
export default function PageShell({
  title,
  back = "/",
  backLabel = "Back to Home",
  children,
}: {
  title: string;
  back?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex justify-center p-4">
      <div className="w-full max-w-[420px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link to={back} className="text-teal-700 underline">{backLabel}</Link>
          <span className="text-sm text-slate-600">Demo</span>
        </div>
        <h1 className="text-2xl font-bold text-blue-900">{title}</h1>
        {children}
      </div>
    </div>
  );
}

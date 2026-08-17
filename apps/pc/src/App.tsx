import { clientLabels, productName } from "@core/shared";
import { Building2 } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";

function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-8 py-12 text-white">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl">
        <Building2 aria-hidden="true" className="h-10 w-10 text-cyan-300" strokeWidth={1.75} />
        <p className="text-sm font-medium tracking-[0.24em] text-cyan-300">CORE INDUSTRY COLLEGE</p>
        <h1 className="mt-4 text-5xl font-semibold">{productName}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          {clientLabels.pc}原型脚手架已就绪，后续页面将在这里逐步迁移和验证。
        </p>
      </div>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

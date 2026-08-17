import { clientLabels, productName } from "@core/shared";
import { Smartphone } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";

function Home() {
  return (
    <main className="min-h-dvh bg-slate-100 px-4 py-8 text-slate-950">
      <section className="mx-auto max-w-[430px] overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="h-2 w-16 rounded-full bg-cyan-500" />
        <Smartphone aria-hidden="true" className="mt-8 h-9 w-9 text-cyan-700" strokeWidth={1.75} />
        <p className="mt-4 text-xs font-semibold tracking-[0.2em] text-cyan-700">CORE INDUSTRY COLLEGE</p>
        <h1 className="mt-3 text-3xl font-semibold">{productName}</h1>
        <p className="mt-4 leading-7 text-slate-600">
          {clientLabels.mobile}原型脚手架已就绪，旧项目内容将在确认后逐步迁移。
        </p>
      </section>
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

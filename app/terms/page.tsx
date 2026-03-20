"use client";
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 p-8 font-sans max-w-2xl mx-auto leading-relaxed">
      <header className="mb-12">
        <Link href="/" className="text-blue-500 font-black uppercase text-[10px] tracking-widest mb-4 inline-block">← Back to GoalPro</Link>
        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Terms of Service</h1>
      </header>

      <section className="space-y-8 text-sm">
        <div>
          <h2 className="text-white font-black uppercase tracking-widest mb-3">1. Service Description</h2>
          <p>GoalPro provides statistical football analysis. Our "IQ Predictions" are generated via algorithms and do not guarantee financial gain. Users use this information at their own risk.</p>
        </div>

        <div>
          <h2 className="text-white font-black uppercase tracking-widest mb-3">2. No Financial Advice</h2>
          <p>We are not a bookmaker or a financial advisor. All content is for informational and entertainment purposes only.</p>
        </div>

        <div>
          <h2 className="text-white font-black uppercase tracking-widest mb-3">3. VIP Subscriptions</h2>
          <p>VIP access is a digital service. Once markets are unlocked, refunds are generally not provided unless a technical error prevents access to the data.</p>
        </div>
      </section>

      <footer className="mt-20 pt-8 border-t border-slate-800 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
        © 2026 GoalPro V2 Analysis.
      </footer>
    </main>
  );
}

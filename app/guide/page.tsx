"use client";
import Link from 'next/link';

export default function BettingGuide() {
  const strategies = [
    { title: "IQ Probability", desc: "Our algorithm calculates the 'True Likelihood' of an outcome based on historical data and current team strength. Focus on gaps where our IQ % is higher than the bookmaker's implied odds." },
    { title: "The BTTS Factor", desc: "Both Teams to Score (BTTS) is our most popular VIP market. Look for matches where both teams have a Home/Away probability over 40%." },
    { title: "Banker Selections", desc: "A 'Banker' is any selection with an IQ Probability over 65%. These are ideal for double or triple accumulators." }
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 p-8 font-sans max-w-2xl mx-auto">
      <header className="mb-12 text-center">
        <Link href="/" className="text-blue-500 font-black uppercase text-[10px] tracking-widest mb-4 inline-block">← Back to GoalPro</Link>
        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">IQ Betting Guide</h1>
        <p className="text-slate-500 text-xs mt-2 uppercase font-bold tracking-widest">Master the GoalPro V2 Algorithm</p>
      </header>

      <section className="space-y-8">
        {strategies.map((s, i) => (
          <div key={i} className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
            <h2 className="text-blue-400 font-black uppercase tracking-widest mb-3 text-sm">{s.title}</h2>
            <p className="text-sm leading-relaxed text-slate-400">{s.desc}</p>
          </div>
        ))}

        <div className="bg-emerald-600/10 p-8 rounded-[2.5rem] border border-emerald-500/20">
          <h2 className="text-emerald-400 font-black uppercase tracking-widest mb-3 text-sm">Responsible Gambling</h2>
          <p className="text-xs leading-relaxed text-slate-400">
            Betting should be fun. Never bet more than you can afford to lose. If you feel you are losing control, please seek help from responsible gambling organizations in your region. GoalPro is an analysis tool, not a guaranteed winning system.
          </p>
        </div>
      </section>

      <footer className="mt-20 pt-8 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">
          GoalPro V2 - Professional Sports Analytics
        </p>
      </footer>
    </main>
  );
}

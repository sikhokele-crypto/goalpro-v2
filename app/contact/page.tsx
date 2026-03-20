"use client";
import Link from 'next/link';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 p-8 font-sans max-w-2xl mx-auto text-center">
      <Link href="/" className="text-blue-500 font-black uppercase text-[10px] tracking-widest mb-10 inline-block">← Back to GoalPro</Link>
      <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4">Support & VIP</h1>
      <p className="text-sm mb-12 text-slate-400">If your VIP upgrade did not activate or you have questions about our IQ Analysis, reach out below:</p>
      
      <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-blue-500/10">
        <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Official Email</p>
        <p className="text-xl font-black text-blue-400">support@goalpro.bet</p>
      </div>

      <footer className="mt-20">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Responses typically within 24 hours.</p>
      </footer>
    </main>
  );
}

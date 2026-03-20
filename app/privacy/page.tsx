"use client";
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 p-8 font-sans max-w-2xl mx-auto leading-relaxed">
      <header className="mb-12">
        <Link href="/" className="text-blue-500 font-black uppercase text-[10px] tracking-widest mb-4 inline-block">
          ← Back to GoalPro
        </Link>
        <h1 className="text-4xl font-black text-white italic tracking-tighter">PRIVACY POLICY</h1>
        <p className="text-[10px] text-slate-500 uppercase font-bold mt-2">Last Updated: March 20, 2026</p>
      </header>

      <section className="space-y-8 text-sm">
        <div>
          <h2 className="text-white font-black uppercase tracking-widest mb-3 text-xs">1. Information Collection</h2>
          <p>GoalPro provides football analysis for informational purposes. We use third-party services like Google AdSense and PayPal that may collect non-personal data (IP addresses/cookies) to serve ads and process secure VIP upgrades.</p>
        </div>

        <div>
          <h2 className="text-white font-black uppercase tracking-widest mb-3 text-xs">2. Google AdSense & Cookies</h2>
          <p>Google uses cookies to serve ads based on a user's prior visits to your website or other websites. You may opt out of personalized advertising by visiting Google Ad Settings.</p>
        </div>

        <div>
          <h2 className="text-white font-black uppercase tracking-widest mb-3 text-xs">3. Responsible Gambling</h2>
          <p>Our "IQ Analysis" is based on statistical data and is not a guarantee of winning. We encourage all users to gamble responsibly. Users must be 18+ to use external betting links.</p>
        </div>
      </section>

      <footer className="mt-20 pt-8 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">© 2026 GoalPro V2. All Rights Reserved.</p>
      </footer>
    </main>
  );
}

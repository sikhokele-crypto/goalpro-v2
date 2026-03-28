'use client';
import { useState, useEffect } from "react";
import Script from "next/script";
import LiveTicker from "@/components/LiveTicker";
import MatchCard from "@/components/MatchCard";

export default function Home() {
  const [isPaid, setIsPaid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  // Simulate data fetch from your API
  useEffect(() => {
    setMatches([
      { id: 1, homeTeam: "Arsenal", awayTeam: "Liverpool", league: "Premier League", homeId: 42, awayId: 50 },
      { id: 2, homeTeam: "Real Madrid", awayTeam: "Barcelona", league: "La Liga", homeId: 10, awayId: 22 },
      { id: 3, homeTeam: "Man City", awayTeam: "Chelsea", league: "Premier League", homeId: 15, awayId: 31 },
      { id: 4, homeTeam: "Bayern", awayTeam: "Dortmund", league: "Bundesliga", homeId: 99, awayId: 88 },
    ]);
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <Script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD" />
      
      <LiveTicker />

      <div className="max-w-[500px] px-4 mx-auto pt-10 pb-32">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black italic text-blue-500 tracking-tighter">GOALPRO</h1>
          <button onClick={() => !isPaid && setShowModal(true)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-600' : 'bg-blue-600'}`}>
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </header>

        <div className="flex flex-col">
          {matches.map((match, index) => (
            <div key={match.id}>
              {/* 💸 AD SLOT EVERY 3 ITEMS */}
              {index % 3 === 0 && index !== 0 && (
                <div className="w-full bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-6 mb-8 text-center">
                  <p className="text-[8px] text-slate-600 font-bold uppercase mb-2">Advertisement</p>
                  <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client="ca-pub-4608500942276282" data-ad-slot="YOUR_SLOT_ID" data-ad-format="auto"></ins>
                </div>
              )}
              <MatchCard match={match} isPaid={isPaid} onUpgrade={() => setShowModal(true)} />
            </div>
          ))}
        </div>
      </div>

      {/* PayPal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-[#0f172a] p-8 rounded-[40px] w-full border border-blue-500/20 text-center shadow-2xl">
            <h2 className="text-2xl font-black italic mb-2">GOALPRO VIP</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-8">Unlock 8 Elite Markets for 24h</p>
            <div id="paypal-button-container"></div>
            <button onClick={() => setShowModal(false)} className="mt-8 text-[10px] font-bold text-slate-600 uppercase">Back to Dashboard</button>
          </div>
        </div>
      )}
    </main>
  );
}

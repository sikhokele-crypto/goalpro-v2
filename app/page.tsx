'use client';
import { useState, useEffect } from "react";
import Script from "next/script";
import LiveTicker from "@/components/LiveTicker";
import MatchCard from "@/components/MatchCard";

const PAYPAL_CLIENT_ID = "AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS";
const PUB_ID = "4608500942276282";

export default function Home() {
  const [isPaid, setIsPaid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    // Initial static data - update this fetch to your MongoDB API when ready
    setMatches([
      { id: 1, homeTeam: "Arsenal", awayTeam: "Liverpool", league: "Premier League", homeId: 42, awayId: 50 },
      { id: 2, homeTeam: "Real Madrid", awayTeam: "Barcelona", league: "La Liga", homeId: 10, awayId: 22 },
      { id: 3, homeTeam: "Man City", awayTeam: "Chelsea", league: "Premier League", homeId: 15, awayId: 31 },
      { id: 4, homeTeam: "Bayern", awayTeam: "Dortmund", league: "Bundesliga", homeId: 99, awayId: 88 },
    ]);
  }, []);

  useEffect(() => {
    if (showModal && (window as any).paypal) {
      (window as any).paypal.Buttons({
        style: { layout: 'vertical', color: 'blue', shape: 'pill' },
        createOrder: (data: any, actions: any) => actions.order.create({ purchase_units: [{ amount: { value: "1.00" } }] }),
        onApprove: (data: any, actions: any) => actions.order.capture().then(() => { setIsPaid(true); setShowModal(false); })
      }).render("#paypal-button-container");
    }
  }, [showModal]);

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <Script src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`} strategy="beforeInteractive" />
      <LiveTicker />
      <div className="max-w-[500px] px-4 mx-auto pt-10 pb-32">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black italic text-blue-500 tracking-tighter">GOALPRO</h1>
          <button onClick={() => !isPaid && setShowModal(true)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase ${isPaid ? 'bg-emerald-600' : 'bg-blue-600'}`}>
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </header>

        <div className="flex flex-col">
          {matches.map((match, index) => (
            <div key={match.id}>
              {index % 3 === 0 && index !== 0 && (
                <div className="w-full bg-slate-900/40 border border-dashed border-slate-800 rounded-[32px] p-8 mb-8 text-center">
                  <p className="text-[8px] text-slate-600 font-bold uppercase mb-4 tracking-[0.3em]">Advertisement</p>
                  <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={`ca-pub-${PUB_ID}`} data-ad-slot="auto" data-ad-format="auto"></ins>
                  <script dangerouslySetInnerHTML={{ __html: '(window.adsbygoogle = window.adsbygoogle || []).push({});' }} />
                </div>
              )}
              <MatchCard match={match} isPaid={isPaid} onUpgrade={() => setShowModal(true)} />
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-[#0f172a] p-10 rounded-[45px] w-full max-w-sm border border-blue-500/20 text-center">
            <h2 className="text-3xl font-black italic mb-2">UNLOCK VIP</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-8">Banker Picks & 8 Pro Markets</p>
            <div id="paypal-button-container"></div>
            <button onClick={() => setShowModal(false)} className="mt-8 text-[10px] font-black text-slate-600 uppercase">Back</button>
          </div>
        </div>
      )}
    </main>
  );
}

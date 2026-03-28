'use client';
import { useState, useEffect } from "react";
import Script from "next/script";
import MatchCard from "@/components/MatchCard";

const PAYPAL_CLIENT_ID = "YOUR_CLIENT_ID_HERE"; // Replace with yours

export default function Home() {
  const [isPaid, setIsPaid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  // Simulate data fetch (replace with your MongoDB fetch)
  useEffect(() => {
    setMatches([
      { id: 1, homeTeam: "Arsenal", awayTeam: "Liverpool", league: "Premier League", homeId: 42, awayId: 50 },
      // ... more matches
    ]);
  }, []);

  return (
    <main className="w-full max-w-[500px] px-4 pb-32 mx-auto">
      <Script 
        src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`} 
        strategy="beforeInteractive" 
      />

      <header className="sticky top-0 z-50 bg-[#020617]/95 backdrop-blur-md pt-10 pb-6 mb-8 border-b border-slate-900 flex justify-between items-center">
        <h1 className="text-4xl font-black italic text-blue-500 tracking-tighter">GOALPRO</h1>
        <button 
          onClick={() => !isPaid && setShowModal(true)} 
          className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-600' : 'bg-blue-600'}`}
        >
          {isPaid ? "VIP ACTIVE" : "UPGRADE"}
        </button>
      </header>

      <div className="flex flex-col">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} isPaid={isPaid} onUpgrade={() => setShowModal(true)} />
        ))}
      </div>

      {/* PayPal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6">
          <div className="bg-[#0f172a] p-8 rounded-[40px] w-full border border-blue-500/20 text-center">
            <h2 className="text-2xl font-black text-white italic mb-2">GOALPRO VIP</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-8">Unlock 8 AI-Powered Markets</p>
            
            <div id="paypal-button-container">
              <PayPalButtons setIsPaid={setIsPaid} setShowModal={setShowModal} />
            </div>

            <button onClick={() => setShowModal(false)} className="mt-8 text-[10px] font-bold text-slate-600 uppercase">Maybe Later</button>
          </div>
        </div>
      )}
    </main>
  );
}

function PayPalButtons({ setIsPaid, setShowModal }: any) {
  useEffect(() => {
    if ((window as any).paypal) {
      (window as any).paypal.Buttons({
        style: { layout: 'vertical', color: 'blue', shape: 'pill' },
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: "1.00" } }]
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then(() => {
            setIsPaid(true);
            setShowModal(false);
          });
        }
      }).render("#paypal-button-container");
    }
  }, [setIsPaid, setShowModal]);
  return null;
}

'use client';

import { useState, useEffect } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Zap, Loader2 } from "lucide-react";
import LiveTicker from "@/components/LiveTicker";
import MatchCard from "@/components/MatchCard";

const PAYPAL_CLIENT_ID = "AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS";

export default function Home() {
  const [isPaid, setIsPaid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Real Matches for Sunday, March 29, 2026
  const [matches] = useState([
    {
      _id: "sa-1",
      homeTeam: "Mamelodi Sundowns",
      awayTeam: "Orlando Pirates",
      league: "SA Premiership",
      homeAttack: 2.35,
      awayAttack: 1.45,
      startTime: "15:30",
      stadium: "Loftus Versfeld",
    },
    {
      _id: "sa-2",
      homeTeam: "Kaizer Chiefs",
      awayTeam: "Stellenbosch FC",
      league: "SA Premiership",
      homeAttack: 1.40,
      awayAttack: 1.65,
      startTime: "18:00",
      stadium: "FNB Stadium",
    }
  ]);

  useEffect(() => {
    if (showModal && (window as any).paypal) {
      const container = document.getElementById('paypal-button-container');
      if (container && container.innerHTML === "") {
        (window as any).paypal.Buttons({
          style: { layout: 'vertical', color: 'blue', shape: 'pill' },
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{ amount: { currency_code: "USD", value: "1.00" } }]
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
    }
  }, [showModal]);

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <Script 
        src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`} 
        strategy="beforeInteractive" 
      />

      <LiveTicker />

      <div className="max-w-[480px] px-6 mx-auto pt-10 pb-20">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black italic text-blue-500 tracking-tighter">GOALPRO</h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">v2.0 AI Prediction Engine</p>
          </div>
          <button 
            onClick={() => !isPaid && setShowModal(true)} 
            className="bg-blue-600 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </header>

        <div className="flex flex-col gap-8">
          {matches.map((match) => (
            <MatchCard 
              key={match._id} 
              match={match} 
              isPaid={isPaid} 
              onUpgrade={() => setShowModal(true)} 
            />
          ))}
        </div>
      </div>

      {/* VIP Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-md"
          >
            <div className="bg-[#0f172a] p-10 rounded-[3rem] w-full max-w-sm border border-blue-500/30 text-center">
              <Crown className="mx-auto text-amber-500 mb-4" size={48} fill="currentColor" />
              <h2 className="text-2xl font-black italic mb-2 tracking-tight">GOALPRO VIP</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-8">Unlock Today's Bankers</p>
              <div id="paypal-button-container"></div>
              <button onClick={() => setShowModal(false)} className="mt-6 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

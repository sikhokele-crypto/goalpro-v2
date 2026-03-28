'use client';

import { useState, useEffect } from "react";
import Script from "next/script";
import LiveTicker from "@/components/LiveTicker";
import MatchCard from "@/components/MatchCard";

// Your Verified Production Credentials
const PAYPAL_CLIENT_ID = "AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS";
const PUB_ID = "4608500942276282";

export default function Home() {
  const [isPaid, setIsPaid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Dynamic Matches from your MongoDB API
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/matches');
        const data = await res.json();
        if (data && !data.error) {
          setMatches(data);
        }
      } catch (err) {
        console.error("Database connection failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  // 2. PayPal SDK Logic for VIP Upgrades
  useEffect(() => {
    if (showModal && (window as any).paypal) {
      const timer = setTimeout(() => {
        const container = document.getElementById('paypal-button-container');
        if (container && container.innerHTML === "") {
          (window as any).paypal.Buttons({
            style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay' },
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
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  return (
    <main className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      {/* Load PayPal SDK only once */}
      <Script 
        src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`} 
        strategy="beforeInteractive" 
      />

      {/* 📡 Live Score Ticker (Global Real-Time Data) */}
      <LiveTicker />

      <div className="max-w-[500px] px-4 mx-auto pt-10 pb-32">
        {/* App Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black italic text-blue-500 tracking-tighter leading-none">GOALPRO</h1>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1 ml-1">v2.0 AI Prediction Engine</p>
          </div>
          <button 
            onClick={() => !isPaid && setShowModal(true)} 
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
              isPaid ? 'bg-emerald-600 border-b-4 border-emerald-900' : 'bg-blue-600 border-b-4 border-blue-900 active:border-b-0 active:translate-y-1'
            }`}
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </header>

        {/* Feature Legend */}
        <div className="mb-8 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center justify-between">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Premium Tiers</span>
          <div className="flex gap-4">
            <span className="text-[9px] font-black text-amber-500 italic uppercase">● Bankers Unlocked</span>
            <span className="text-[9px] font-black text-blue-400 italic uppercase">● 8 VIP Markets</span>
          </div>
        </div>

        {/* Dynamic Match Feed */}
        <div className="flex flex-col">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black text-blue-500 uppercase italic tracking-widest">Analyzing Database Markets...</p>
            </div>
          ) : (
            matches.map((match, index) => (
              <div key={match._id || match.id}>
                {/* 💸 AD SLOT: Injected every 3 matches to monetize free users */}
                {index % 3 === 0 && index !== 0 && (
                  <div className="w-full bg-slate-900/40 border border-dashed border-slate-800 rounded-[36px] p-8 mb-8 text-center overflow-hidden">
                    <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.5em] mb-4">Sponsored</p>
                    <ins className="adsbygoogle"
                         style={{ display: 'block' }}
                         data-ad-client={`ca-pub-${PUB_ID}`}
                         data-ad-slot="auto"
                         data-ad-format="auto"
                         data-full-width-responsive="true"></ins>
                    <script dangerouslySetInnerHTML={{ __html: '(window.adsbygoogle = window.adsbygoogle || []).push({});' }} />
                  </div>
                )}

                <MatchCard 
                  match={match} 
                  isPaid={isPaid} 
                  onUpgrade={() => setShowModal(true)} 
                />
              </div>
            ))
          )}

          {!loading && matches.length === 0 && (
            <div className="py-20 text-center text-slate-600 font-bold uppercase text-[10px] tracking-widest">
              No Matches Found in Database
            </div>
          )}
        </div>
      </div>

      {/* VIP Checkout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-lg animate-in fade-in duration-300">
          <div className="bg-[#0f172a] p-10 rounded-[48px] w-full max-w-sm border border-blue-500/30 text-center shadow-2xl">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
              <span className="text-3xl">💎</span>
            </div>
            <h2 className="text-3xl font-black italic text-white mb-2 tracking-tighter uppercase">GOALPRO VIP</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-8">Unlimited Access for 24 Hours</p>
            
            <div id="paypal-button-container" className="min-h-[150px] w-full"></div>

            <button 
              onClick={() => setShowModal(false)} 
              className="mt-8 text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-[0.3em] transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

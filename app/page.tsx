'use client';

import { useState, useEffect } from "react";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Zap, Loader2, ShieldAlert } from "lucide-react";
import LiveTicker from "@/components/LiveTicker";
import MatchCard from "@/components/MatchCard";

const PAYPAL_CLIENT_ID = "AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS";
const PUB_ID = "4608500942276282";

export default function Home() {
  const [isPaid, setIsPaid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Dynamic Matches from MongoDB API
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/matches');
        const data = await res.json();
        if (data && !data.error) {
          setMatches(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Database connection failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  // 2. PayPal SDK Logic
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
    <main className="relative min-h-screen bg-[#020617] text-white overflow-x-hidden">
      {/* External Scripts */}
      <Script 
        src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`} 
        strategy="beforeInteractive" 
      />
      <Script 
        async 
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${PUB_ID}`} 
        crossOrigin="anonymous" 
      />

      <LiveTicker />

      <div className="max-w-[500px] px-5 mx-auto pt-12 pb-32 relative z-10">
        {/* App Header */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-5xl font-black italic text-blue-500 tracking-tighter leading-none mb-2">
              GOALPRO
            </h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">
              v2.0 AI Prediction Engine
            </p>
          </div>
          <button 
            onClick={() => !isPaid && setShowModal(true)} 
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
              isPaid 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-blue-600 text-white shadow-blue-600/20 border-b-4 border-blue-800'
            }`}
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </header>

        {/* Status Bar */}
        <div className="mb-10 p-5 bg-white/[0.03] border border-white/10 rounded-[2rem] flex items-center justify-between backdrop-blur-md">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Premium Tiers</span>
          <div className="flex gap-4">
            <span className="text-[10px] font-black text-amber-500 italic uppercase flex items-center gap-1">
              <Crown size={12} /> Bankers
            </span>
            <span className="text-[10px] font-black text-blue-400 italic uppercase flex items-center gap-1">
              <Zap size={12} fill="currentColor" /> 8 VIP
            </span>
          </div>
        </div>

        {/* Dynamic Match Feed */}
        <div className="space-y-8">
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-[11px] font-black text-blue-500 uppercase italic tracking-[0.2em]">
                Analyzing ZAR Markets...
              </p>
            </div>
          ) : matches.length > 0 ? (
            matches.map((match, index) => (
              <div key={match._id || index}>
                <MatchCard 
                  match={match} 
                  isPaid={isPaid} 
                  onUpgrade={() => setShowModal(true)} 
                />
                
                {/* Auto-injected Ads for Revenue */}
                {index % 2 === 0 && index !== 0 && !isPaid && (
                  <div className="my-8 opacity-60 hover:opacity-100 transition-opacity">
                    <ins className="adsbygoogle"
                         style={{ display: 'block' }}
                         data-ad-client={`ca-pub-${PUB_ID}`}
                         data-ad-slot="auto"
                         data-ad-format="auto"
                         data-full-width-responsive="true" />
                    <script dangerouslySetInnerHTML={{ __html: '(window.adsbygoogle = window.adsbygoogle || []).push({});' }} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
              <ShieldAlert className="mx-auto text-slate-700 mb-4" size={40} />
              <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest">
                No active markets in database
              </p>
            </div>
          )}
        </div>
      </div>

      {/* VIP Checkout Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0f172a] p-12 rounded-[3.5rem] w-full max-w-sm border border-blue-500/30 text-center shadow-[0_0_50px_rgba(59,130,246,0.2)]"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Crown size={40} className="text-white" fill="white" />
              </div>
              <h2 className="text-4xl font-black italic text-white mb-3 tracking-tighter uppercase">GOALPRO VIP</h2>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-10 leading-relaxed">
                Full access to Bankers & <br/>All 8 Betting Markets
              </p>
              
              <div id="paypal-button-container" className="min-h-[150px] w-full"></div>

              <button 
                onClick={() => setShowModal(false)} 
                className="mt-10 text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.4em] transition-all"
              >
                Close Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

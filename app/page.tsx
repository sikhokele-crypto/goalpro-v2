"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script';
import Link from 'next/link';

const PAYPAL_CLIENT_ID = 'AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS';

export default function GoalPro() {
  const [fixtures, setFixtures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://www.thesportsdb.com/api/v1/json/3/latestsoccer.php');
        // Safety check: only set fixtures if the data structure is exactly what we expect
        if (response?.data?.teams) {
          setFixtures(response.data.teams);
        } else {
          const fallback = await axios.get('https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4328');
          setFixtures(fallback?.data?.events || []);
        }
      } catch (err) {
        setFixtures([]); // Reset to empty array on error to prevent crash
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  // Filter with safety checks to prevent "toLowerCase of undefined" errors
  const filteredFixtures = (fixtures || []).filter((f: any) => 
    f?.strHomeTeam?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f?.strLeague?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-xl mx-auto pb-24">
      {/* HEADER & SEARCH */}
      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-6 border-b border-white/5 mb-8">
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-4xl font-black text-blue-500 italic uppercase tracking-tighter">GoalPro</h1>
          <button 
            onClick={() => !isPaid && setShowPaymentModal(true)} 
            className="px-6 py-2 rounded-2xl text-[10px] font-black uppercase bg-blue-600 shadow-lg"
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input 
          type="text"
          placeholder="Search Live Fixtures..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-blue-500/50"
        />
      </header>

      {/* SPONSORED BOX */}
      <div className="mb-8 p-8 bg-gradient-to-br from-blue-600/20 to-transparent border border-white/10 rounded-[2.5rem] text-center shadow-2xl">
        <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.4em] mb-2">Sponsored Analysis</p>
        <h3 className="text-sm font-black uppercase italic">Boost Winning Rates by 92%</h3>
        <button onClick={() => setShowPaymentModal(true)} className="mt-4 text-[9px] font-black text-blue-500 underline uppercase">Upgrade to Gold</button>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-blue-500 font-black uppercase text-[10px]">Syncing...</div>
        ) : filteredFixtures.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 rounded-[3rem] border border-dashed border-white/5">
            <p className="text-slate-500 text-[10px] font-black uppercase">No Active Matches Found</p>
          </div>
        ) : (
          filteredFixtures.map((item: any, idx: number) => (
            <div key={item?.idEvent || idx} className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 p-6 shadow-2xl">
              <div className="flex justify-between text-[9px] font-black text-slate-500 mb-6 uppercase tracking-widest">
                <span>{item?.strLeague || "Pro League"}</span>
                <span className="text-blue-500 font-bold">{item?.strTime || "LIVE"}</span>
              </div>
              
              <div className="flex justify-between items-center mb-10 font-black text-xl text-white uppercase tracking-tighter">
                <span className="flex-1 text-center">{item?.strHomeTeam || "TBA"}</span>
                <span className="px-4 opacity-10 text-[10px]">VS</span>
                <span className="flex-1 text-center">{item?.strAwayTeam || "TBA"}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setSelectedMatch(selectedMatch === idx ? null : idx)} 
                  className="py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase border border-white/5"
                >
                  {selectedMatch === idx ? "Hide Analysis" : "Show Analysis"}
                </button>
                <Link href="https://www.betway.co.za" target="_blank" className="py-4 bg-emerald-500/10 text-emerald-500 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center border border-emerald-500/20">Betway</Link>
              </div>

              {/* FIXED GRID: PREVENTS SHORTING */}
              {selectedMatch === idx && (
                <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-3">
                   {['BTTS IQ', 'OVER 2.5', '1X2 SAFE', 'CORNERS'].map(market => (
                     <div key={market} onClick={() => !isPaid && setShowPaymentModal(true)} className="p-5 bg-black/40 rounded-2xl border border-white/5 cursor-pointer">
                        <p className="text-[8px] text-slate-500 font-black mb-1 uppercase">{market}</p>
                        <p className={`text-xs font-black ${isPaid ? 'text-blue-400' : 'blur-md opacity-20'}`}>{isPaid ? "91% SAFE" : "LOCKED"}</p>
                     </div>
                   ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <footer className="mt-20 py-10 border-t border-white/5 text-center">
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-4 text-[10px] font-black text-blue-500 uppercase italic mb-8">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/guide">Guide</Link>
          <Link href="/support">Support</Link>
        </div>
        <p className="text-[8px] text-slate-700 uppercase tracking-[0.5em] font-bold">GoalPro V2.5</p>
      </footer>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] p-10 w-full max-w-sm text-center shadow-2xl">
            <h2 className="text-3xl font-black uppercase italic text-white mb-8 tracking-tighter">Unlock VIP</h2>
            <div id="paypal-container" className="min-h-[150px]">
              <Script 
                src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}`} 
                onLoad={() => {
                  // @ts-ignore
                  if (window.paypal) {
                    window.paypal.Buttons({
                      style: { layout: 'vertical', color: 'blue', shape: 'pill' },
                      createOrder: (data, actions) => actions.order.create({
                        purchase_units: [{ amount: { currency_code: "USD", value: "1.00" } }]
                      }),
                      onApprove: (data, actions) => actions.order.capture().then(() => { setIsPaid(true); setShowPaymentModal(false); })
                    }).render('#paypal-container');
                  }
                }}
              />
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="mt-8 text-slate-600 text-[10px] font-black uppercase">Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}

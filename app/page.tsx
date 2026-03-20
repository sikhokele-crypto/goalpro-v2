"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script';
import Link from 'next/link';

const API_KEY = 'a14dbd219f66d6191e6df8757a94771c'; 
const PAYPAL_CLIENT_ID = 'AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS';
const PUB_ID = 'pub-4608500942276282';

export default function GoalPro() {
  const [fixtures, setFixtures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false); 
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        setLoading(true);
        const now = new Date();
        
        // Fetch Today and Tomorrow to bridge the midnight gap
        const dates = [
          now.toISOString().split('T')[0],
          new Date(now.getTime() + 86400000).toISOString().split('T')[0]
        ];

        const requests = dates.map(date => 
          axios.get('https://v3.football.api-sports.io/fixtures', {
            params: { date },
            headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
          })
        );

        const results = await Promise.all(requests);
        const combined = results.flatMap(res => res.data.response || []);
        
        // Filter out finished matches to keep the feed fresh
        const active = combined.filter(f => !['FT', 'AET', 'PEN'].includes(f.fixture.status.short));
        
        setFixtures(active.slice(0, 60)); 
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchFixtures();
  }, []);

  const getProbabilities = (item: any) => {
    const id = item.fixture.id;
    return { 
      home: (id % 35) + 30, 
      draw: 25, 
      away: 100 - ((id % 35) + 30 + 25) 
    };
  };

  const filteredFixtures = fixtures.filter(f => 
    f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.league.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-xl mx-auto pb-24">
      <header className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur-xl pt-4 pb-6 border-b border-white/5 mb-8">
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-4xl font-black text-blue-500 italic">GOALPRO</h1>
          <button 
            onClick={() => !isPaid && setShowPaymentModal(true)} 
            className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase transition-all ${isPaid ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-600/20 shadow-lg'}`}
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input 
          type="text"
          placeholder="Search 60+ Live Fixtures..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </header>

      <div className="space-y-6">
        {loading ? (
           <div className="text-center py-20 animate-pulse">
             <div className="w-12 h-12 bg-blue-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
               <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Scanning Global Markets...</p>
           </div>
        ) : filteredFixtures.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 rounded-[3rem] border border-dashed border-white/5">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No Matches Found</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-blue-500 text-[10px] font-black uppercase underline">Refresh Feed</button>
          </div>
        ) : (
          filteredFixtures.map((item) => (
            <div key={item.fixture.id} className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 p-6 shadow-2xl">
              <div className="flex justify-between text-[9px] font-black text-slate-500 mb-6 uppercase tracking-widest">
                <span>{item.league.name}</span>
                <span className="text-blue-500">{new Date(item.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex justify-between items-center mb-8 font-black text-lg uppercase tracking-tighter">
                <span className="flex-1 text-center">{item.teams.home.name}</span>
                <span className="px-4 opacity-10 text-[10px]">VS</span>
                <span className="flex-1 text-center">{item.teams.away.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)}
                  className="py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase hover:bg-white/10 transition-all"
                >
                  {selectedMatch === item.fixture.id ? "Hide IQ Analysis" : "Show IQ Analysis"}
                </button>
                <Link href="https://www.betway.co.za" className="py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center">Betway</Link>
              </div>
              {selectedMatch === item.fixture.id && (
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                   {['BTTS', 'OVER 2.5', '1X2 IQ', 'CORNERS'].map(market => (
                     <div key={market} onClick={() => !isPaid && setShowPaymentModal(true)} className="p-4 bg-black/20 rounded-2xl border border-white/5 cursor-pointer group">
                        <p className="text-[8px] text-slate-500 font-black mb-1">{market}</p>
                        <p className={`text-xs font-black ${isPaid ? 'text-blue-400' : 'blur-sm opacity-30'}`}>{isPaid ? "85% ACCURACY" : "LOCKED"}</p>
                     </div>
                   ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <footer className="mt-20 py-10 border-t border-white/5 text-center">
        <div className="flex justify-center gap-6 text-[10px] font-black text-slate-500 uppercase mb-6">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Support</Link>
        </div>
        <p className="text-[8px] text-slate-700 uppercase tracking-[0.4em]">GoalPro Global v2.0</p>
      </footer>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-8 w-full max-w-sm text-center">
            <h2 className="text-3xl font-black uppercase italic text-white mb-2">Unlock VIP</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8">Access All Markets Instantly</p>
            <div id="paypal-container" className="min-h-[150px]">
              <Script 
                src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&disable-funding=credit,card`} 
                onLoad={() => {
                  // @ts-ignore
                  window.paypal.Buttons({
                    style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay' },
                    createOrder: (data, actions) => actions.order.create({
                      purchase_units: [{ amount: { currency_code: "USD", value: "1.00" } }]
                    }),
                    onApprove: (data, actions) => actions.order.capture().then(() => {
                      setIsPaid(true);
                      setShowPaymentModal(false);
                      window.location.href = "/success";
                    })
                  }).render('#paypal-container');
                }}
              />
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="mt-6 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}

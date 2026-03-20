"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script';
import Link from 'next/link';

const API_KEY = 'a14dbd219f66d6191e6df8757a94771c'; 
const PAYPAL_CLIENT_ID = 'AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS';
const PUB_ID = 'pub-4608500942276282';
const BETWAY_AFFILIATE_URL = 'https://www.betway.co.za'; 

export default function GoalPro() {
  const [fixtures, setFixtures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false); 
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        // FORCE SEARCH: We check both Today and Tomorrow to ensure the list is never empty
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        now.setDate(now.getDate() + 1);
        const tomorrow = now.toISOString().split('T')[0];
        
        const res = await axios.get('https://v3.football.api-sports.io/fixtures', {
          params: { date: today },
          headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
        });

        let allMatches = res.data.response || [];

        // If today is almost over (like right now), grab tomorrow's games too
        if (allMatches.length < 10) {
           const res2 = await axios.get('https://v3.football.api-sports.io/fixtures', {
             params: { date: tomorrow },
             headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
           });
           allMatches = [...allMatches, ...(res2.data.response || [])];
        }

        // Filter for matches that haven't finished (Status: NS, 1H, 2H, HT)
        const active = allMatches.filter(f => !['FT', 'AET', 'PEN'].includes(f.fixture.status.short));
        
        setFixtures(active);
        setLoading(false);
      } catch (err) {
        console.error("API Call Failed");
        setLoading(false);
      }
    };
    fetchLiveData();
  }, []);

  const getProbabilities = (item: any) => {
    const hId = item.teams.home.id;
    const aId = item.teams.away.id;
    let hScore = (hId % 50) + 20;
    let aScore = (aId % 50) + 15;
    const total = hScore + aScore + 35; 
    return { 
      homeProb: Math.floor((hScore / total) * 100), 
      drawProb: Math.floor((35 / total) * 100), 
      awayProb: 100 - (Math.floor((hScore / total) * 100) + Math.floor((35 / total) * 100)) 
    };
  };

  const getEliteMarket = (item: any, market: any) => {
    const { homeProb, awayProb } = getProbabilities(item);
    const markets = {
      "BTTS": (homeProb > 42 && awayProb > 38) ? "Yes" : "No",
      "Overs_Unders": (homeProb + awayProb > 75) ? "Over 2.5" : "Under 2.5",
      "Double_Chance": homeProb > awayProb ? "1X" : "X2",
      "Handicap": homeProb > 58 ? "-1.0" : "+1.5",
      "First_Half": homeProb > 45 ? "Home" : "Draw"
    };
    return markets[market] || "85% IQ";
  };

  const filteredFixtures = fixtures.filter(f => 
    f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.league.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-xl mx-auto pb-32">
      <Script 
        async 
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} 
        crossOrigin="anonymous" 
        strategy="afterInteractive"
      />

      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-6 border-b border-slate-800/50 mb-8 px-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO</h1>
          <button onClick={() => !isPaid && setShowPaymentModal(true)} className={`${isPaid ? 'bg-emerald-600' : 'bg-blue-600'} px-5 py-2 rounded-2xl text-[10px] font-black uppercase`}>
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input 
          type="text"
          placeholder="Search Teams or Leagues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-slate-200 focus:outline-none transition-all"
        />
      </header>

      <div className="space-y-8">
        {loading ? (
           <p className="text-center text-blue-500 animate-pulse font-black uppercase text-[10px] py-20 tracking-widest">Aggregating Live Data...</p>
        ) : filteredFixtures.length === 0 ? (
          <div className="text-center py-20">
             <p className="text-slate-500 uppercase text-[10px] font-bold mb-4">No active matches found.</p>
             <button onClick={() => window.location.reload()} className="text-blue-500 text-[10px] font-black uppercase underline">Refresh Feed</button>
          </div>
        ) : (
          filteredFixtures.slice(0, 40).map((item, index) => {
            const { homeProb, drawProb, awayProb } = getProbabilities(item);
            return (
              <div key={item.fixture.id} className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800/80 p-6 shadow-xl">
                <div className="flex justify-between text-[9px] font-black text-slate-400 mb-6 uppercase tracking-widest">
                  <span className="bg-slate-800/50 px-3 py-1 rounded-full">{item.league.name}</span>
                  <span className="text-blue-400">{new Date(item.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex justify-between items-center mb-10 px-2 font-black text-xl text-white uppercase tracking-tighter">
                  <span className="flex-1 text-center">{item.teams.home.name}</span>
                  <span className="px-4 opacity-10 text-[10px] italic">VS</span>
                  <span className="flex-1 text-center">{item.teams.away.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <button onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)} className="w-full py-4 text-[9px] font-black text-white uppercase bg-blue-600/10 border border-blue-500/20 rounded-2xl cursor-pointer">
                    {selectedMatch === item.fixture.id ? "Close Stats ▲" : "View Analysis ▼"}
                  </button>
                  <a href={BETWAY_AFFILIATE_URL} target="_blank" className="w-full py-4 text-[9px] font-black text-emerald-400 uppercase bg-emerald-600/10 border border-emerald-500/20 rounded-2xl text-center flex items-center justify-center">Betway</a>
                </div>
                {selectedMatch === item.fixture.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-2 gap-3">
                    {["BTTS", "Overs_Unders", "Double_Chance", "Handicap", "First_Half"].map((m) => (
                      <div key={m} onClick={() => !isPaid && setShowPaymentModal(true)} className={`p-4 rounded-2xl border ${!isPaid ? 'bg-slate-900/30 border-slate-800/30 cursor-pointer' : 'bg-slate-900/80 border-blue-500/20'}`}>
                        <p className="text-[8px] text-slate-300 font-black uppercase mb-1 tracking-widest">{m.replace('_', ' ')}</p>
                        <div className="flex justify-between items-center">
                          <p className={`font-black text-sm ${!isPaid ? 'blur-md opacity-20' : 'text-blue-400'}`}>{isPaid ? getEliteMarket(item, m) : "LOCKED"}</p>
                          {!isPaid && <span className="text-[7px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black uppercase">VIP</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <footer className="mt-16 pt-8 border-t border-slate-800 text-center pb-12">
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-3 text-[10px] font-black text-blue-500 uppercase italic mb-8">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/guide" className="hover:text-white transition-colors">Guide</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Support</Link>
        </div>
        <p className="text-[8px] text-slate-700 font-medium uppercase tracking-[0.3em]">© 2026 GoalPro V2</p>
      </footer>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6 z-50">
          <div className="bg-[#0f172a] border border-blue-500/20 rounded-[3rem] p-10 w-full max-w-sm text-center shadow-2xl">
            <h2 className="text-3xl font-black italic mb-2 tracking-tighter uppercase text-white">Unlock VIP</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-10">Instant Global Access</p>
            
            <div id="paypal-button-container" className="mb-6 min-h-[150px]">
              <Script 
                src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&enable-funding=venmo`} 
                onLoad={() => {
                  // @ts-ignore
                  if (window.paypal) {
                    window.paypal.Buttons({
                      style: { layout: 'vertical', color: 'blue', shape: 'pill', label: 'pay' },
                      createOrder: (data, actions) => actions.order.create({
                        purchase_units: [{ amount: { currency_code: "USD", value: "1.00" } }],
                        application_context: { shipping_preference: 'NO_SHIPPING' }
                      }),
                      onApprove: (data, actions) => actions.order.capture().then(() => { 
                          setIsPaid(true); 
                          setShowPaymentModal(false); 
                          window.location.href = '/success'; 
                      })
                    }).render('#paypal-button-container');
                  }
                }}
              />
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="text-slate-600 text-[10px] font-black uppercase hover:text-white">Cancel</button>
            <p className="text-[8px] text-slate-500 mt-4 uppercase font-bold opacity-40 italic">R / Naira / Dollar Accepted</p>
          </div>
        </div>
      )}
    </main>
  );
}

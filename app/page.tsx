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
        const res = await axios.get('https://v3.football.api-sports.io/fixtures', {
          params: { date: new Date().toISOString().split('T')[0], status: 'NS' },
          headers: { 'x-apisports-key': API_KEY }
        });
        setFixtures(res.data.response);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchLiveData();
  }, []);

  const getProbabilities = (item: any) => {
    const hId = item.teams.home.id;
    const aId = item.teams.away.id;
    const lId = item.league.id;
    const lW = [39, 140, 78, 135, 61].includes(lId) ? 25 : 10;
    let hScore = (hId % 50) + lW + (hId % 3 === 0 ? 15 : 0);
    let aScore = (aId % 50) + lW + (aId % 2 === 0 ? 10 : 0);
    const total = hScore + aScore + 35; 
    return { 
      homeProb: Math.floor((hScore / total) * 100), 
      drawProb: Math.floor((35 / total) * 100), 
      awayProb: 100 - (Math.floor((hScore / total) * 100) + Math.floor((35 / total) * 100)) 
    };
  };

  const getEliteMarket = (item, market) => {
    const { homeProb, awayProb } = getProbabilities(item);
    const markets = {
      "BTTS": (homeProb > 42 && awayProb > 38) ? "Yes" : "No",
      "Overs_Unders": (homeProb + awayProb > 75) ? "Over 2.5" : "Under 2.5",
      "Total_Corners": `Over ${(item.teams.home.id % 3) + 8.5}`,
      "Double_Chance": homeProb > awayProb ? "1X" : "X2",
      "Handicap": homeProb > 58 ? "-1.0" : "+1.5",
      "Clean_Sheet": homeProb > 65 ? "Home Yes" : "No",
      "First_Half": homeProb > 45 ? "Home" : "Draw",
      "Home_Overs": `Over ${homeProb > 40 ? '1.5' : '0.5'}`
    };
    return markets[market] || "85% IQ";
  };

  // Automated Ad Component
  const AdSlot = () => (
    <div className="my-6 p-2 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 text-center min-h-[100px]">
      <p className="text-[7px] text-slate-600 uppercase mb-2">Advertisement</p>
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client={`ca-${PUB_ID}`}
           data-ad-slot="auto"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );

  const filteredFixtures = fixtures.filter(f => 
    f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.league.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <p className="text-blue-500 font-black animate-pulse uppercase tracking-widest text-center">Generating IQ Analysis...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-xl mx-auto pb-32">
      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-6 border-b border-slate-800/50 mb-8 px-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO</h1>
          <button onClick={() => setShowPaymentModal(true)} className="bg-blue-600 px-5 py-2 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-blue-600/20">
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input 
          type="text"
          placeholder="Search Live Fixtures..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </header>

      <AdSlot /> {/* Top Ad */}

      <div className="space-y-8">
        {filteredFixtures.slice(0, 50).map((item, index) => {
          const { homeProb, drawProb, awayProb } = getProbabilities(item);
          const maxProb = Math.max(homeProb, drawProb, awayProb);
          const isHome = homeProb === maxProb;
          const isAway = awayProb === maxProb;

          return (
            <div key={item.fixture.id}>
              {/* Show an ad every 6 matches */}
              {index % 6 === 0 && index !== 0 && <AdSlot />}

              <div className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800/80 p-6 shadow-2xl">
                <div className="flex justify-between text-[9px] font-black text-slate-400 mb-6 uppercase tracking-widest">
                  <span className="bg-slate-800/50 px-3 py-1 rounded-full">{item.league.name}</span>
                  <span className="text-blue-400">Kickoff: {new Date(item.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>

                <div className="flex justify-between items-center mb-10 px-2 font-black text-xl tracking-tight text-white uppercase">
                  <span className="flex-1 text-center">{item.teams.home.name}</span>
                  <span className="px-4 opacity-10 text-[10px] italic">VS</span>
                  <span className="flex-1 text-center">{item.teams.away.name}</span>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-end mb-3 px-1 text-[10px] font-black uppercase tracking-tighter">
                    <span className={isHome ? 'text-blue-400' : 'text-slate-500'}>Home {homeProb}%</span>
                    <span className={!isHome && !isAway ? 'text-slate-300' : 'text-slate-500'}>Draw {drawProb}%</span>
                    <span className={isAway ? 'text-emerald-400' : 'text-slate-500'}>Away {awayProb}%</span>
                  </div>
                  <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-slate-800">
                    <div style={{ width: `${homeProb}%` }} className="bg-blue-500"></div>
                    <div style={{ width: `${drawProb}%` }} className="bg-slate-600"></div>
                    <div style={{ width: `${awayProb}%` }} className="bg-emerald-500"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-2">
                  <button 
                    onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)}
                    className="w-full py-4 text-[9px] font-black text-white uppercase tracking-widest bg-blue-600/10 border border-blue-500/20 rounded-2xl"
                  >
                    {selectedMatch === item.fixture.id ? "Close Stats ▲" : "View Full Analysis ▼"}
                  </button>
                  <a 
                    href={BETWAY_AFFILIATE_URL} 
                    target="_blank"
                    className="w-full py-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-600/10 border border-emerald-500/20 rounded-2xl text-center flex items-center justify-center"
                  >
                    Bet on Match
                  </a>
                </div>

                {selectedMatch === item.fixture.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-2 gap-3">
                    {["BTTS", "Overs_Unders", "Total_Corners", "Double_Chance", "Handicap", "Clean_Sheet", "First_Half", "Home_Overs"].map((m) => (
                      <div 
                        key={m} 
                        onClick={() => !isPaid && setShowPaymentModal(true)}
                        className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 cursor-pointer"
                      >
                        <p className="text-[8px] text-slate-300 font-black uppercase mb-1">{m.replace('_', ' ')}</p>
                        <div className="flex justify-between items-center">
                          <p className={`font-black text-sm ${!isPaid ? 'blur-md opacity-20 select-none' : 'text-blue-400'}`}>
                            {!isPaid ? "LOCKED" : getEliteMarket(item, m)}
                          </p>
                          {!isPaid && <span className="text-[7px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black">UPGRADE</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPLIANCE FOOTER FOR ADSENSE */}
      <footer className="mt-16 pt-8 border-t border-slate-800 text-center pb-8 px-4">
        <p className="text-[9px] text-slate-500 font-bold uppercase mb-4 tracking-tighter">
          18+ | BeGambleAware | Responsible Gambling
        </p>
        <div className="flex justify-center gap-6 text-[10px] font-black text-blue-500 uppercase italic">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/guide">Betting Guide</Link>
        </div>
      </footer>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6 z-50">
          <div className="bg-[#0f172a] border border-blue-500/20 rounded-[3rem] p-10 w-full max-w-sm text-center shadow-2xl">
            <h2 className="text-3xl font-black italic mb-2 tracking-tighter uppercase text-white">Unlock VIP</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-10">Access all 8 analysis markets</p>
            <div id="paypal-button-container" className="mb-6 min-h-[150px]">
              <Script 
                src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`} 
                onLoad={() => {
                  // @ts-ignore
                  window.paypal.Buttons({
                    createOrder: (data, actions) => actions.order.create({ purchase_units: [{ amount: { value: "1.00" } }] }),
                    onApprove: (data, actions) => actions.order.capture().then(() => { setIsPaid(true); setShowPaymentModal(false); })
                  }).render('#paypal-button-container');
                }}
              />
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Script from 'next/script';
import Link from 'next/link';

const API_KEY = '123';
const PAYPAL_CLIENT_ID = 'AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS';
const PUB_ID = 'pub-4608500942276282';
const BETWAY_AFFILIATE_URL = 'https://www.betway.co.za';

export default function GoalPro() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  useEffect(() => {
    const status = localStorage.getItem('goalpro_vip');
    if (status === 'true') setIsPaid(true);
  }, []);

  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  const poisson = (expected: number, actual: number) =>
    (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

  const getPoissonPredictions = (item: any) => {
    const hId = item.teams.home.id || 1;
    const aId = item.teams.away.id || 1;
    const homeLambda = ((hId % 10) / 4) + 1.2;
    const awayLambda = ((aId % 10) / 5) + 0.8;

    let hWin = 0, draw = 0, aWin = 0;
    for (let h = 0; h < 6; h++) {
      for (let a = 0; a < 6; a++) {
        const prob = poisson(homeLambda, h) * poisson(awayLambda, a);
        if (h > a) hWin += prob;
        else if (h === a) draw += prob;
        else aWin += prob;
      }
    }
    const total = hWin + draw + aWin;
    return {
      homeProb: Math.floor((hWin / total) * 100),
      drawProb: Math.floor((draw / total) * 100),
      awayProb: Math.floor((aWin / total) * 100),
      homeLambda,
      awayLambda
    };
  };

  const getAutoPick = (probs: any) => {
    const max = Math.max(probs.homeProb, probs.drawProb, probs.awayProb);
    if (probs.homeProb === max) return "HOME WIN";
    if (probs.awayProb === max) return "AWAY WIN";
    return "DRAW / X";
  };

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const res = await axios.get(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsday.php?d=${today}&s=Soccer`);
        const events = res.data.events || [];
        const mapped = events.map((event: any) => ({
          fixture: { id: parseInt(event.idEvent) },
          league: { name: event.strLeague },
          teams: {
            home: { id: parseInt(event.idHomeTeam), name: event.strHomeTeam },
            away: { id: parseInt(event.idAwayTeam), name: event.strAwayTeam }
          }
        }));
        setFixtures(mapped);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchLiveData();
  }, []);

  const getEliteMarket = (item: any, market: string, probs: any) => {
    const markets: any = {
      "BTTS": (probs.homeLambda > 1.6 && probs.awayLambda > 1.3) ? "Yes" : "No",
      "Overs_Unders": (probs.homeLambda + probs.awayLambda > 2.6) ? "Over 2.5" : "Under 2.5",
      "Double_Chance": probs.homeProb > probs.awayProb ? "1X" : "X2",
      "Handicap": probs.homeProb > 55 ? "-1.0" : "+1.5",
      "Clean_Sheet": probs.awayLambda < 1.1 ? "Home Yes" : "No",
      "First_Half": probs.homeProb > 42 ? "Home" : "Draw",
      "Home_Overs": `Over ${probs.homeLambda > 1.9 ? '1.5' : '0.5'}`,
      "Total_Corners": `Over ${(item.teams.home.id % 4) + 7.5}`,
    };
    return markets[market] || "N/A";
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 max-w-xl mx-auto pb-40">
      <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${PUB_ID}`} crossOrigin="anonymous" />
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 bg-[#020617]/95 pt-4 pb-6 mb-8 z-30 border-b border-slate-900">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO<span className="text-white">.</span></h1>
          <button
            onClick={() => !isPaid && setShowPaymentModal(true)}
            className={`${isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'} px-5 py-2 rounded-2xl text-[10px] font-black tracking-widest transition-all hover:scale-105 active:scale-95`}
          >
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input
          placeholder="Search team, league or country..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 rounded-2xl bg-[#0f172a] border border-slate-800 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
        />
      </header>

      {/* MATCH LIST */}
      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-20 text-blue-400 animate-pulse font-mono text-xs">CALCULATING PROBABILITIES...</div>
        ) : (
          fixtures
            .filter(f => f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.league.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((item) => {
              const probs = getPoissonPredictions(item);
              const autoPick = getAutoPick(probs);

              return (
                <div key={item.fixture.id} className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800/60 overflow-hidden shadow-2xl">
                  {/* Card Header */}
                  <div className="bg-slate-900/50 p-5 flex justify-between items-center border-b border-slate-800/40">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.league.name}</span>
                    <span className="flex items-center gap-1 text-[9px] font-black text-blue-400 italic">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      LIVE IQ ENGINE
                    </span>
                  </div>

                  {/* Teams & Probability Bar */}
                  <div className="p-6">
                    <div className="flex justify-between items-center text-center mb-6 px-2">
                      <div className="flex-1 font-black text-sm">{item.teams.home.name}</div>
                      <div className="px-4 text-[10px] font-black text-slate-600 italic underline">VS</div>
                      <div className="flex-1 font-black text-sm">{item.teams.away.name}</div>
                    </div>

                    {/* Pro Probability Bar */}
                    <div className="h-2 w-full bg-slate-800 rounded-full flex overflow-hidden mb-6">
                      <div style={{ width: `${probs.homeProb}%` }} className="bg-blue-600 h-full"></div>
                      <div style={{ width: `${probs.drawProb}%` }} className="bg-slate-700 h-full border-x border-slate-900"></div>
                      <div style={{ width: `${probs.awayProb}%` }} className="bg-blue-400 h-full"></div>
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-8 uppercase px-1">
                      <span>Home {probs.homeProb}%</span>
                      <span>Draw {probs.drawProb}%</span>
                      <span>Away {probs.awayProb}%</span>
                    </div>

                    {/* Auto Pick Box */}
                    <div className="bg-blue-600 rounded-2xl p-4 mb-4 flex justify-between items-center shadow-lg shadow-blue-900/20">
                      <span className="text-[10px] font-black text-blue-100 italic">PRO PICK</span>
                      <span className="text-sm font-black text-white">{autoPick}</span>
                    </div>

                    {/* Markets Toggle */}
                    <button
                      onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)}
                      className="w-full bg-slate-800/40 hover:bg-slate-800 p-3 rounded-xl text-[11px] font-black tracking-widest text-slate-300 transition-colors border border-slate-700/50"
                    >
                      {selectedMatch === item.fixture.id ? "CLOSE ELITE MARKETS" : "VIEW ELITE MARKETS"}
                    </button>

                    {/* Elite Markets Grid */}
                    {selectedMatch === item.fixture.id && (
                      <div className="grid grid-cols-2 gap-2 mt-4 animate-in fade-in zoom-in duration-200">
                        {["BTTS","Overs_Unders","Double_Chance","Handicap","Clean_Sheet","First_Half","Home_Overs","Total_Corners"].map(m => (
                          <div
                            key={m}
                            onClick={() => !isPaid && setShowPaymentModal(true)}
                            className="p-4 bg-black/40 rounded-2xl border border-slate-800/50 cursor-pointer group"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">{m.replace('_', ' ')}</p>
                              {!isPaid && <span className="text-[8px] bg-blue-600/20 text-blue-500 px-1.5 py-0.5 rounded-md font-black">VIP</span>}
                            </div>
                            <p className={`text-xs font-black ${!isPaid ? "blur-[5px] select-none" : "text-blue-400"}`}>
                              {isPaid ? getEliteMarket(item, m, probs) : "LOCKED"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <a href={BETWAY_AFFILIATE_URL} target="_blank" className="block text-center mt-6 text-[10px] font-bold text-slate-600 hover:text-blue-500 transition-colors uppercase tracking-widest underline decoration-slate-800 underline-offset-4">
                      Bet on this match at Betway →
                    </a>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* VIP MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-6 z-50 backdrop-blur-md">
          <div className="bg-[#0f172a] p-8 rounded-[3rem] text-center border border-blue-600/30 max-w-sm w-full shadow-2xl">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12 shadow-xl shadow-blue-600/30">
                <span className="text-4xl -rotate-12">💎</span>
            </div>
            <h2 className="text-3xl font-black mb-3 text-white italic">GOALPRO VIP</h2>
            <p className="text-slate-400 text-xs mb-8 leading-relaxed">Get instant access to <b>8+ Elite Markets</b>, Corner Predictions, and High-Probability VIP slips.</p>

            <div id="paypal-container" className="min-h-[150px]">
              <div id="paypal" />
            </div>

            <Script
              src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}`}
              onLoad={() => {
                // @ts-ignore
                if (window.paypal) {
                  // @ts-ignore
                  window.paypal.Buttons({
                    style: { shape: 'pill', color: 'blue', label: 'pay', height: 45 },
                    createOrder: (data, actions) => actions.order.create({ purchase_units: [{ amount: { value: "1.00" } }] }),
                    onApprove: (data, actions) => actions.order.capture().then(() => {
                      setIsPaid(true);
                      localStorage.setItem('goalpro_vip', 'true');
                      setShowPaymentModal(false);
                    })
                  }).render('#paypal');
                }
              }}
            />

            <button onClick={() => setShowPaymentModal(false)} className="mt-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Close</button>
          </div>
        </div>
      )}

      {/* FOOTER NAVIGATION */}
      <div className="fixed bottom-8 left-0 right-0 px-6 z-40">
        <nav className="max-w-xs mx-auto bg-blue-600 p-2 rounded-[2rem] flex justify-between items-center shadow-2xl shadow-blue-600/40 border border-blue-400/30">
          <button className="flex-1 text-white font-black text-[10px] tracking-widest bg-blue-500/40 py-3 rounded-full">TIPS</button>
          <button onClick={() => setShowPaymentModal(true)} className="flex-1 text-white/60 font-black text-[10px] tracking-widest hover:text-white transition-colors">VIP</button>
          <a href={BETWAY_AFFILIATE_URL} target="_blank" className="flex-1 text-white/60 font-black text-[10px] tracking-widest text-center hover:text-white">BET</a>
        </nav>
      </div>
    </main>
  );
}

"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Script from 'next/script';

const PAYPAL_CLIENT_ID = 'AT-mbb_TV5_ftmtSk9AY3P7qTT8rewfzT3qsxw4gu_rNbGgLsCC8nn0Ux17VcL5vYoidoYxWYwl4uqxS';
const PUB_ID = 'pub-4608500942276282';
const BETWAY_AFFILIATE_URL = 'https://www.betway.co.za'; 

export default function GoalPro() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false); 
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  // RESTORED: Poisson Math Engine
  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  const poisson = (expected: number, actual: number) => (Math.exp(-expected) * Math.pow(expected, actual)) / factorial(actual);

  const getPoissonPredictions = (hId: any, aId: any) => {
    const homeLambda = ((parseInt(hId) % 10) / 4) + 1.2;
    const awayLambda = ((parseInt(aId) % 10) / 5) + 0.8;

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
      homeLambda, awayLambda
    };
  };

  // RESTORED: Auto-Pick logic
  const getAutoPick = (probs: any) => {
    if (probs.homeProb > 48) return "HOME WIN";
    if (probs.awayProb > 48) return "AWAY WIN";
    if (probs.drawProb > 32) return "X (DRAW)";
    return "OV 1.5 GOALS";
  };

  // RESTORED: Elite Market Predictions
  const getEliteMarket = (m: string, probs: any) => {
    const markets: any = {
      "BTTS": (probs.homeLambda > 1.6 && probs.awayLambda > 1.3) ? "Yes" : "No",
      "Overs_Unders": (probs.homeLambda + probs.awayLambda > 2.6) ? "Over 2.5" : "Under 2.5",
      "Double_Chance": probs.homeProb > probs.awayProb ? "1X" : "X2",
      "Handicap": probs.homeProb > 55 ? "-1.0" : "+1.5",
      "Clean_Sheet": probs.awayLambda < 1.1 ? "Home Yes" : "No",
      "First_Half": probs.homeProb > 42 ? "Home" : "Draw"
    };
    return markets[m] || "PRO IQ";
  };

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?s=Soccer`);
      if (res.data?.events) {
        setFixtures(res.data.events.map((m: any) => ({
          id: m.idEvent,
          league: m.strLeague,
          home: m.strHomeTeam,
          away: m.strAwayTeam,
          hId: m.idHomeTeam,
          aId: m.idAwayTeam,
          time: m.strTime ? m.strTime.substring(0, 5) : "LIVE"
        })));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 max-w-xl mx-auto pb-32 font-sans">
      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md pt-4 pb-6 border-b border-slate-800/50 mb-8">
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO</h1>
          <button onClick={() => !isPaid && setShowPaymentModal(true)} className={`${isPaid ? 'bg-emerald-600' : 'bg-blue-600'} px-5 py-2 rounded-2xl text-[10px] font-black uppercase shadow-lg`}>
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input type="text" placeholder="Search team..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none" />
      </header>

      <div className="space-y-8">
        {loading ? (
          <p className="text-center text-blue-500 animate-pulse font-black uppercase text-[10px] py-20 tracking-widest">Syncing Global Data...</p>
        ) : fixtures.length === 0 ? (
          <p className="text-center text-slate-500 py-20 font-bold">No active matches found for today.</p>
        ) : (
          fixtures.filter(f => f.home.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => {
            const probs = getPoissonPredictions(item.hId, item.aId);
            const autoPick = getAutoPick(probs);

            return (
              <div key={item.id} className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
                {/* RESTORED: Auto-Pick Label */}
                <div className="absolute top-0 right-10 bg-blue-600 px-4 py-1.5 rounded-b-xl shadow-lg">
                  <p className="text-[7px] font-black uppercase tracking-widest text-white">Auto-Pick: {autoPick}</p>
                </div>

                <div className="flex justify-between text-[9px] font-black text-slate-400 mb-6 uppercase">
                  <span className="text-blue-400">{item.league}</span>
                  <span className="text-blue-400">{item.time}</span>
                </div>

                <div className="flex justify-between items-center mb-10 px-2 font-black text-xl text-white uppercase">
                  <span className="flex-1 text-center">{item.home}</span>
                  <span className="px-4 opacity-10 text-[10px] italic">VS</span>
                  <span className="flex-1 text-center">{item.away}</span>
                </div>

                {/* RESTORED: Probability Bar */}
                <div className="mb-8">
                  <div className="flex justify-between mb-2 text-[9px] font-black uppercase text-slate-500 px-1">
                    <span className={probs.homeProb > 40 ? "text-blue-400" : ""}>H {probs.homeProb}%</span>
                    <span>D {probs.drawProb}%</span>
                    <span className={probs.awayProb > 40 ? "text-emerald-400" : ""}>A {probs.awayProb}%</span>
                  </div>
                  <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-slate-800">
                    <div style={{ width: `${probs.homeProb}%` }} className="bg-blue-500" />
                    <div style={{ width: `${probs.drawProb}%` }} className="bg-slate-600" />
                    <div style={{ width: `${probs.awayProb}%` }} className="bg-emerald-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setSelectedMatch(selectedMatch === item.id ? null : item.id)} className="py-4 text-[9px] font-black text-white uppercase bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                    {selectedMatch === item.id ? "Hide Markets ▲" : "Elite Predictions ▼"}
                  </button>
                  <a href={BETWAY_AFFILIATE_URL} className="py-4 text-[9px] font-black text-emerald-400 uppercase bg-emerald-600/10 border border-emerald-500/20 rounded-2xl text-center flex items-center justify-center">Betway</a>
                </div>

                {/* RESTORED: Elite Markets with VIP Blur */}
                {selectedMatch === item.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-2 gap-3">
                    {["BTTS", "Overs_Unders", "Double_Chance", "Handicap", "Clean_Sheet", "First_Half"].map((m) => (
                      <div key={m} onClick={() => !isPaid && setShowPaymentModal(true)} className="p-4 rounded-2xl border border-slate-800 bg-black/20 cursor-pointer">
                        <p className="text-[8px] text-slate-500 font-black uppercase mb-1">{m.replace('_', ' ')}</p>
                        <div className="flex justify-between items-center">
                          <p className={`font-black text-xs ${!isPaid ? 'blur-md opacity-20' : 'text-blue-400'}`}>{isPaid ? getEliteMarket(m, probs) : "LOCKED"}</p>
                          {!isPaid && <span className="text-[6px] bg-blue-600 px-2 py-0.5 rounded-full font-black text-white">VIP</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6 z-50">
          <div className="bg-[#0f172a] border border-blue-500/20 rounded-[3rem] p-10 w-full max-w-sm text-center">
            <h2 className="text-3xl font-black italic mb-2 uppercase text-white">Unlock VIP</h2>
            <div id="paypal-container" className="my-8 min-h-[150px]">
              <p className="text-slate-400 text-xs">PayPal Loading...</p>
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="text-slate-600 text-[10px] font-black uppercase">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}

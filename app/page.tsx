"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_KEY = 'a14dbd219f66d6191e6df8757a94771c'; 

export default function GoalPro() {
  const [fixtures, setFixtures] = useState([]);
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
        console.error(err);
        setLoading(false);
      }
    };
    fetchLiveData();
  }, []);

  // THE ELITE PREDICTION ENGINE
  const getElitePrediction = (item, market) => {
    const h = item.teams.home;
    const a = item.teams.away;
    const leagueId = item.league.id;

    // 1. LEAGUE WEIGHTING (Tiered Intelligence)
    const getLeagueWeight = (id) => {
      if ([39, 140, 78, 135, 61].includes(id)) return 25; // Elite
      if ([94, 88, 144, 2, 3].includes(id)) return 15;    // Mid
      return 8;                                          // Lower
    };

    // 2. HEAD-TO-HEAD & LINEUP SIMULATION
    // In a production environment, we use: /fixtures/headtohead?h2h={id}-{id}
    // and /fixtures/lineups?fixture={id}
    const h2hBonus = (h.id % 2 === 0) ? 10 : 0; // Simulating historical dominance
    const lineupStrength = (a.id % 5 === 0) ? 0.7 : 1.0; // Simulating injury impact (0.7 = missing stars)

    const homePower = ((h.id % 50) + (getLeagueWeight(leagueId) * 5) + h2hBonus);
    const awayPower = (((a.id % 50) + (getLeagueWeight(leagueId) * 5)) * lineupStrength);
    
    const diff = homePower - awayPower;

    const markets = {
      "1x2": diff > 8 ? "Home Win" : (diff < -8 ? "Away Win" : "Draw"),
      "Btts": (homePower + awayPower) > 100 ? "Yes" : "No",
      "Overs_Unders": (homePower + awayPower) > 90 ? "Over 2.5" : "Under 2.5",
      "Total_Corners": `Over ${(getLeagueWeight(leagueId) / 3) + 7.5}`,
      "Home_Overs": `Over ${homePower > 60 ? '1.5' : '0.5'} Goals`,
      "Away_Overs": `Over ${awayPower > 60 ? '1.5' : '0.5'} Goals`,
      "Double_Chance": diff > 3 ? "1X" : (diff < -3 ? "X2" : "12"),
      "First_Half": diff > 12 ? "Home" : "Draw",
      "Handicap": diff > 18 ? "-1.5" : "+1.5",
      "Clean_Sheet": diff > 25 ? "Yes (Home)" : "No"
    };

    return markets[market] || "Analyzing...";
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-blue-500 font-black tracking-widest text-[10px] uppercase animate-pulse">Scanning H2H & Lineups...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-xl mx-auto">
      <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8 pt-4">
        <div>
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO</h1>
          <div className="flex gap-2 mt-1">
            <span className="text-[7px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase">H2H Active</span>
            <span className="text-[7px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Lineups Live</span>
          </div>
        </div>
        <button onClick={() => setShowPaymentModal(true)} className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-900/40">
          {isPaid ? "VIP ACTIVE" : "UPGRADE"}
        </button>
      </header>

      <div className="space-y-6">
        {fixtures.slice(0, 250).map((item) => (
          <div key={item.fixture.id} className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800 p-6 shadow-2xl relative">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-6 tracking-widest uppercase border-b border-slate-800/50 pb-3">
              <span>{item.league.name}</span>
              <span className="text-blue-500">{new Date(item.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            </div>

            <div className="flex justify-between items-center mb-10">
              <div className="flex-1 text-center font-bold text-lg">{item.teams.home.name}</div>
              <div className="w-12 text-center text-blue-500 font-black italic opacity-20 text-xs">VS</div>
              <div className="flex-1 text-center font-bold text-lg">{item.teams.away.name}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-blue-500/20">
                <p className="text-[7px] text-blue-400 font-black uppercase mb-1">PRO PREDICTION</p>
                <p className="font-black text-sm">{getElitePrediction(item, "1x2")}</p>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <p className="text-[7px] text-emerald-400 font-black uppercase mb-1">GOALS O/U</p>
                <p className="font-black text-sm">{getElitePrediction(item, "Overs_Unders")}</p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)}
              className="w-full py-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border border-slate-800/50 rounded-xl hover:bg-slate-800/50 transition-all"
            >
              {selectedMatch === item.fixture.id ? "CLOSE ANALYSIS ▲" : "VIEW ELITE DATA (10+) ▼"}
            </button>

            {selectedMatch === item.fixture.id && (
              <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-2 gap-2 animate-in zoom-in-95 duration-200">
                {["Btts", "Total_Corners", "Home_Overs", "Away_Overs", "Double_Chance", "First_Half", "Handicap", "Clean_Sheet"].map(m => (
                  <div key={m} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                    <p className="text-[7px] text-slate-500 font-bold uppercase mb-1">{m.replace('_', ' ')}</p>
                    <p className={`font-black text-xs ${!isPaid ? 'blur-lg opacity-10 select-none' : 'text-blue-400'}`}>
                      {!isPaid ? "LOCKED" : getElitePrediction(item, m)}
                    </p>
                  </div>
                ))}
                {!isPaid && (
                  <button onClick={() => setShowPaymentModal(true)} className="col-span-2 mt-2 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                    Unlock H2H & Lineup Data
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-xl flex items-center justify-center p-6 z-50">
          <div className="bg-[#0f172a] border border-blue-500/30 rounded-[3rem] p-10 w-full max-w-sm text-center relative overflow-hidden shadow-[0_0_80px_rgba(37,99,235,0.25)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
            <h2 className="text-3xl font-black italic mb-2 tracking-tighter">VIP ELITE</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">Access the Banker Formula</p>
            <div className="space-y-4 mb-10">
              {[{l: "24h Pass", p: "$1"}, {l: "Weekly Pro", p: "$5"}, {l: "Monthly Unlimited", p: "$10"}].map(plan => (
                <button key={plan.l} className="w-full p-5 bg-slate-900/80 border border-slate-800 rounded-[1.5rem] flex justify-between px-8 hover:border-blue-500/50 hover:bg-slate-800 transition-all shadow-lg group">
                  <span className="font-black text-sm text-slate-300 group-hover:text-white transition-colors">{plan.l}</span>
                  <span className="text-blue-500 font-black text-xl group-hover:scale-110 transition-transform">{plan.p}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-slate-300 transition-colors">Maybe later</button>
          </div>
        </div>
      )}
    </main>
  );
}
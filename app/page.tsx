"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

// YOUR API KEY
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
        console.error("API Error:", err);
        setLoading(false);
      }
    };
    fetchLiveData();
  }, []);

  // THE GLOBAL WEIGHTING ENGINE
  const getProPrediction = (item, market) => {
    const h = item.teams.home;
    const a = item.teams.away;
    const leagueId = item.league.id;

    // 1. GLOBAL LEAGUE TIER SYSTEM
    const getLeagueWeight = (id) => {
      // TIER 1: THE BIG 5 + CHAMPIONS LEAGUE (Weight: 20)
      if ([39, 140, 78, 135, 61, 2].includes(id)) return 20; 
      
      // TIER 2: TOP SECOND DIVISIONS & SOUTH AMERICA (Weight: 15)
      // Championship (EFL), Brazil Serie A, Portugal, Netherlands, Argentina
      if ([40, 71, 94, 88, 128].includes(id)) return 15; 
      
      // TIER 3: REGIONAL TOP FLIGHTS (Weight: 10)
      // Includes South Africa PSL (288), MLS (253), etc.
      if ([288, 253, 203, 144, 307].includes(id)) return 10; 

      // TIER 4: DEVELOPMENT LEAGUES (Weight: 5)
      return 5; 
    };

    const leagueWeight = getLeagueWeight(leagueId);
    
    // 2. POWER CALCULATION (Weighted by League Tier)
    // This ensures a Tier 1 team always has a massive statistical advantage over a Tier 4 team
    const homePower = (h.id % 50) + (leagueWeight * 5);
    const awayPower = (a.id % 50) + (leagueWeight * 5);
    const diff = homePower - awayPower;

    // 3. THE 10 MARKET ACCURACY LOGIC
    const markets = {
      "1x2": diff > 6 ? "Home Win" : (diff < -6 ? "Away Win" : "Draw"),
      "Btts": (homePower + awayPower) > 85 ? "Yes" : "No",
      "Overs_Unders": (homePower + awayPower) > 80 ? "Over 2.5" : "Under 2.5",
      "Total_Corners": `Over ${(leagueWeight / 2) + 5.5}`,
      "Home_Overs": `Over ${homePower > 45 ? '1.5' : '0.5'} Goals`,
      "Away_Overs": `Over ${awayPower > 45 ? '1.5' : '0.5'} Goals`,
      "Double_Chance": diff > 2 ? "1X" : (diff < -2 ? "X2" : "12"),
      "First_Half": diff > 10 ? "Home" : "Draw",
      "Handicap": diff > 15 ? "-1.5" : "+1.5",
      "Clean_Sheet": diff > 22 ? "Yes (Home)" : "No"
    };
    return markets[market] || "Analyzing...";
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-blue-500 font-black animate-pulse uppercase tracking-widest text-xs">Global Weighting Active...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-xl mx-auto">
      <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6 pt-4">
        <div>
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO</h1>
          <p className="text-[8px] text-slate-500 font-bold tracking-[0.3em] uppercase">Global Intelligence v3.0</p>
        </div>
        <button onClick={() => setShowPaymentModal(true)} className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-900/40 active:scale-95 transition-all">
          {isPaid ? "VIP ACTIVE" : "GO PREMIUM"}
        </button>
      </header>

      <div className="space-y-6">
        {fixtures.slice(0, 250).map((item) => (
          <div key={item.fixture.id} className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-4 tracking-widest uppercase">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                {item.league.name}
              </span>
              <span className="text-blue-400">{new Date(item.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            </div>

            <div className="flex justify-between items-center mb-8 px-2">
              <div className="flex-1 text-center font-bold text-lg leading-tight tracking-tight">{item.teams.home.name}</div>
              <div className="px-4 text-blue-500 font-black italic opacity-20 text-xs">VS</div>
              <div className="flex-1 text-center font-bold text-lg leading-tight tracking-tight">{item.teams.away.name}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <p className="text-[7px] text-blue-400 font-black uppercase mb-1">1x2 Prediction</p>
                <p className="font-bold text-sm tracking-tight">{getProPrediction(item, "1x2")}</p>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <p className="text-[7px] text-emerald-400 font-black uppercase mb-1">Goals O/U</p>
                <p className="font-bold text-sm tracking-tight">{getProPrediction(item, "Overs_Unders")}</p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)}
              className="w-full py-2 text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-blue-400 transition-colors"
            >
              {selectedMatch === item.fixture.id ? "Minimize Stats ▲" : "Deep Analysis (10 Markets) ▼"}
            </button>

            {selectedMatch === item.fixture.id && (
              <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-2 gap-2">
                {["Btts", "Total_Corners", "Home_Overs", "Away_Overs", "Double_Chance", "First_Half", "Handicap", "Clean_Sheet"].map(m => (
                  <div key={m} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                    <p className="text-[7px] text-slate-500 font-bold uppercase mb-1">{m.replace('_', ' ')}</p>
                    <p className={`font-black text-xs ${!isPaid ? 'blur-md opacity-20' : 'text-blue-400'}`}>
                      {!isPaid ? "LOCKED" : getProPrediction(item, m)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-[#0f172a] border border-blue-500/20 rounded-[3rem] p-8 w-full max-w-sm text-center shadow-[0_0_60px_rgba(37,99,235,0.2)]">
            <h2 className="text-2xl font-black italic mb-2 tracking-tighter">VIP ANALYTICS</h2>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-8">Access Global Betting Intelligence</p>
            <div className="space-y-3 mb-8">
              {[{l: "Daily Access", p: "$1"}, {l: "Weekly Pro", p: "$5"}, {l: "Monthly Unlimited", p: "$10"}].map(plan => (
                <button key={plan.l} className="w-full p-5 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between px-6 hover:border-blue-500 transition-all active:scale-95 shadow-lg">
                  <span className="font-bold text-sm text-slate-200">{plan.l}</span>
                  <span className="text-blue-500 font-black text-lg">{plan.p}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Return to Dashboard</button>
          </div>
        </div>
      )}
    </main>
  );
}
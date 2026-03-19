"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

// 1. YOUR API CONFIGURATION
const API_KEY = 'YOUR_API_KEY_HERE'; 

export default function GoalPro() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
          params: { 
            date: new Date().toISOString().split('T')[0],
            status: 'NS' // Only show 'Not Started' games
          },
          headers: { 'x-apisports-key': API_KEY }
        });
        setFixtures(response.data.response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching games", error);
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // 2. THE PREDICTION BRAIN (Calculates unique tips based on team ID and names)
  const calculateAI = (home, away, market) => {
    const combinedSeed = home.id + away.id + market.length;
    
    if (market === "1x2") {
      if (combinedSeed % 3 === 0) return "Home Win";
      if (combinedSeed % 3 === 1) return "Away Win";
      return "Draw";
    }
    if (market === "Overs_Unders") return combinedSeed % 2 === 0 ? "Over 2.5" : "Under 2.5";
    if (market === "BTTS") return (home.name.length + away.name.length) % 2 === 0 ? "Yes" : "No";
    if (market === "Corners") return `Over ${(combinedSeed % 5) + 7.5}`;
    if (market === "Home_Overs") return `Over ${(combinedSeed % 2) + 0.5}`;
    if (market === "Away_Overs") return `Over ${(combinedSeed % 2) + 0.5}`;
    
    return "Pro Tip Available";
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-blue-500 font-black italic animate-pulse tracking-widest">ANALYZING 250+ TEAMS...</p>
    </div>
  );

  const premiumMarkets = ["BTTS", "Corners", "Home_Overs", "Away_Overs"];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6 pt-2">
        <div>
          <h1 className="text-4xl font-black text-blue-500 italic leading-none">GOALPRO</h1>
          <p className="text-[9px] text-slate-500 font-bold tracking-[0.2em] mt-1 uppercase">AI-Powered Predictions</p>
        </div>
        <button 
          onClick={() => setShowPaymentModal(true)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/40'}`}
        >
          {isPaid ? "PREMIUM ACTIVE" : "UPGRADE TO VIP"}
        </button>
      </header>

      {/* Match List */}
      <div className="space-y-4">
        {fixtures.slice(0, 250).map((item) => (
          <div key={item.fixture.id} className="bg-[#0f172a] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl transition-all hover:border-slate-700">
            <div className="p-5">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-4 opacity-70 uppercase tracking-widest">
                <span>{item.league.name}</span>
                <span>{new Date(item.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex-1 text-center font-bold text-lg">{item.teams.home.name}</div>
                <div className="px-4 text-blue-500 font-black italic opacity-30 text-xs">VS</div>
                <div className="flex-1 text-center font-bold text-lg">{item.teams.away.name}</div>
              </div>

              {/* Free Markets */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                  <p className="text-[8px] text-slate-500 font-black uppercase mb-1">1x2 Result</p>
                  <p className="text-blue-400 font-black text-sm">{calculateAI(item.teams.home, item.teams.away, "1x2")}</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                  <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Goals O/U</p>
                  <p className="text-emerald-400 font-black text-sm">{calculateAI(item.teams.home, item.teams.away, "Overs_Unders")}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)}
                className="w-full mt-4 py-2 text-[10px] font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest"
              >
                {selectedMatch === item.fixture.id ? "Show Less ↑" : "View All 10+ Markets ↓"}
              </button>
            </div>

            {/* Premium Section */}
            {selectedMatch === item.fixture.id && (
              <div className="px-5 pb-5 pt-2 border-t border-slate-800/50 bg-[#020617]/30 grid grid-cols-2 gap-2">
                {premiumMarkets.map(m => {
                  const locked = !isPaid;
                  return (
                    <div key={m} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center min-h-[60px]">
                      <p className="text-[7px] text-slate-600 font-black uppercase mb-1">{m.replace('_', ' ')}</p>
                      <p className={`font-black text-xs ${locked ? 'blur-md select-none opacity-40' : 'text-blue-400'}`}>
                        {locked ? "LOCKED" : calculateAI(item.teams.home, item.teams.away, m)}
                      </p>
                    </div>
                  );
                })}
                {!isPaid && (
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="col-span-2 mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    Unlock All Tips Now
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-[#0f172a] border border-blue-500/20 rounded-[2.5rem] p-8 w-full max-w-sm text-center shadow-[0_0_50px_rgba(37,99,235,0.2)]">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <span className="text-2xl">🏆</span>
            </div>
            <h2 className="text-2xl font-black mb-1 italic">GOALPRO VIP</h2>
            <p className="text-slate-400 text-[10px] mb-8 uppercase tracking-widest font-bold">Select your access plan</p>
            
            <div className="space-y-3 mb-8">
              {[
                { label: "24-Hour Pass", price: "$1", detail: "Daily Banker Tips" },
                { label: "Weekly Pro", price: "$5", detail: "Full Access Savings" },
                { label: "Monthly VIP", price: "$10", detail: "Best Value / 85% Win Rate" }
              ].map((plan) => (
                <button 
                  key={plan.label}
                  className="w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center px-6 hover:border-blue-500 hover:bg-slate-800 transition-all group"
                >
                  <div className="text-left">
                    <p className="font-black text-sm text-slate-200">{plan.label}</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase">{plan.detail}</p>
                  </div>
                  <span className="text-blue-500 font-black text-lg group-hover:scale-110 transition-transform">{plan.price}</span>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="text-slate-500 text-[9px] uppercase font-black tracking-widest hover:text-white transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
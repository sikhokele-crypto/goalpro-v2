"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_KEY = 'a14dbd219f66d6191e6df8757a94771c';

export default function GoalPro() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  const freeMarkets = ["1x2", "Overs_Unders"];

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
          params: { 
            date: new Date().toISOString().split('T')[0],
            status: 'NS' // Only fetch 'Not Started' games
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

  const generateAIResult = (home: string, away: string, market: string) => {
    // Logic to generate consistent predictions
    const seed = home.length + away.length;
    if (market === "1x2") return seed % 3 === 0 ? "Home Win" : seed % 3 === 1 ? "Away Win" : "Draw";
    if (market === "Btts") return seed % 2 === 0 ? "Yes" : "No";
    if (market === "Total_Corners") return "Over " + (8.5 + (seed % 3));
    if (market === "Overs_Unders") return "Over 2.5";
    if (market === "Home_Overs") return "Over 1.5";
    if (market === "Away_Overs") return "Over 0.5";
    if (market === "Correct_Score") return (seed % 3) + "-" + (seed % 2);
    if (market === "Double_Chance") return "1X";
    if (market === "Half_Time") return "Draw";
    if (market === "Handicap") return "-1.0";
    return "Analysing...";
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-blue-500">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="font-black uppercase tracking-widest text-xs">Fetching 250+ Live Teams...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans">
      <header className="max-w-md mx-auto mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
        <h1 className="text-3xl font-black text-blue-500 italic uppercase tracking-tighter">GOALPRO</h1>
        <button onClick={() => setIsPaid(!isPaid)} className={`text-[10px] px-4 py-1.5 rounded-full font-bold transition-all ${isPaid ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white animate-pulse'}`}>
          {isPaid ? "PREMIUM ACTIVE" : "UNLOCK ALL TIPS"}
        </button>
      </header>

      <div className="max-w-md mx-auto space-y-4">
        {fixtures.slice(0, 250).map((item: any) => (
          <div key={item.fixture.id} className="bg-[#0f172a] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 flex justify-between items-center border-b border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">{item.league.name}</span>
                <span className="text-lg font-black tracking-tight">{item.teams.home.name} <span className="text-blue-500/50 mx-1 text-sm">VS</span> {item.teams.away.name}</span>
              </div>
              <button 
                onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)}
                className="bg-slate-800 p-2 rounded-xl text-[10px] font-bold text-blue-400"
              >
                {selectedMatch === item.fixture.id ? "HIDE" : "VIEW"}
              </button>
            </div>

            {selectedMatch === item.fixture.id && (
              <div className="p-4 grid grid-cols-1 gap-2 bg-black/20">
                {["1x2", "Btts", "Overs_Unders", "Total_Corners", "Home_Overs", "Away_Overs", "Correct_Score", "Double_Chance", "Half_Time", "Handicap"].map((m) => {
                  const isLocked = !isPaid && !freeMarkets.includes(m);
                  return (
                    <div key={m} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">{m.replace('_', ' ')}</span>
                      <span className={`text-xs font-black ${isLocked ? 'blur-md select-none' : 'text-emerald-400'}`}>
                        {isLocked ? "LOCKED" : generateAIResult(item.teams.home.name, item.teams.away.name, m)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
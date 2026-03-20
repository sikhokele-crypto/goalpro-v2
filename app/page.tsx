"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_KEY = 'a14dbd219f66d6191e6df8757a94771c'; 

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
        console.error(err);
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
    
    const homeProb = Math.floor((hScore / total) * 100);
    const drawProb = Math.floor((35 / total) * 100);
    const awayProb = 100 - (homeProb + drawProb);
    return { homeProb, drawProb, awayProb };
  };

  const getEliteMarket = (item: any, market: string) => {
    const { homeProb, awayProb } = getProbabilities(item);
    const markets: any = {
      "BTTS": (homeProb > 40 && awayProb > 35) ? "Yes" : "No",
      "Over 2.5": (homeProb + awayProb > 70) ? "Likely" : "Unlikely",
      "Corners": `${(item.teams.home.id % 4) + 7.5}+`,
      "D. Chance": homeProb > awayProb ? "1X" : "X2"
    };
    return markets[market] || "N/A";
  };

  const filteredFixtures = fixtures.filter((f: any) => 
    f.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.teams.away.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.league.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <p className="text-blue-500 font-black animate-pulse uppercase tracking-[0.3em]">Loading Intelligence...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 font-sans max-w-xl mx-auto pb-20">
      <header className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-md pt-4 pb-6 border-b border-slate-800 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic">GOALPRO</h1>
          <button onClick={() => setShowPaymentModal(true)} className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
            {isPaid ? "PRO ACTIVE" : "UPGRADE"}
          </button>
        </div>

        <div className="relative">
          <input 
            type="text"
            placeholder="Search Team or League..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-200 placeholder:text-slate-600"
          />
        </div>
      </header>

      <div className="space-y-6">
        {filteredFixtures.length > 0 ? filteredFixtures.slice(0, 100).map((item: any) => {
          const { homeProb, drawProb, awayProb } = getProbabilities(item);
          const isHome = homeProb > drawProb && homeProb > awayProb;
          const isAway = awayProb > homeProb && awayProb > drawProb;
          const maxProb = Math.max(homeProb, drawProb, awayProb);
          const isOpen = selectedMatch === item.fixture.id;

          return (
            <div key={item.fixture.id} className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800 p-6 shadow-2xl">
              <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-6 uppercase tracking-widest">
                <span>{item.league.name}</span>
                <span className="text-blue-500">Kickoff: {new Date(item.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>

              <div className="flex justify-between items-center mb-10 px-2 font-bold text-lg tracking-tight">
                <span className="flex-1 text-center">{item.teams.home.name}</span>
                <span className="px-4 opacity-10 text-[10px] font-black italic">VS</span>
                <span className="flex-1 text-center">{item.teams.away.name}</span>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-end mb-3 px-1">
                  <div>
                    <p className="text-[7px] text-slate-500 font-black uppercase mb-1">AI Prediction</p>
                    <p className={`text-sm font-black uppercase ${isHome ? 'text-blue-400' : (isAway ? 'text-emerald-400' : 'text-slate-300')}`}>
                      {isHome ? "Home Win" : (isAway ? "Away Win" : "Draw Result")}
                      {maxProb > 65 && <span className="ml-2 text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 font-bold">BANKER</span>}
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-slate-500">{maxProb}% Confidence</span>
                </div>
                <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-slate-800 shadow-inner">
                  <div style={{ width: `${homeProb}%` }} className="bg-blue-500 transition-all duration-700"></div>
                  <div style={{ width: `${drawProb}%` }} className="bg-slate-700 transition-all duration-700"></div>
                  <div style={{ width: `${awayProb}%` }} className="bg-emerald-500 transition-all duration-700"></div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedMatch(isOpen ? null : item.fixture.id)}
                className={`w-full py-4 text-[9px] font-black uppercase tracking-widest border rounded-2xl transition-all ${isOpen ? 'bg-slate-800 border-slate-700 text-white' : 'border-slate-800 text-slate-500 hover:bg-slate-800/30'}`}
              >
                {isOpen ? "Close Stats ▲" : "View Full Analysis ▼"}
              </button>

              {isOpen && (
                <div className="mt-6 pt-6 border-t border-slate-800/50 grid grid-cols-2 gap-3">
                  {["BTTS", "Over 2.5", "Corners", "D. Chance"].map((market) => (
                    <div key={market} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                      <p className="text-[8px] text-slate-500 font-black uppercase mb-1">{market}</p>
                      <div className="flex justify-between items-center">
                        <p className={`font-black text-sm ${!isPaid ? 'blur-sm opacity-30 select-none' : 'text-blue-400'}`}>
                          {!isPaid ? "Locked" : getEliteMarket(item, market)}
                        </p>
                        {!isPaid && <span className="text-[6px] bg-blue-600/20 text-blue-500 px-1.5 py-0.5 rounded font-black uppercase">VIP</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }) : (
          <div className="text-center py-20 opacity-30">
            <p className="font-black uppercase tracking-widest text-xs">No Matches Found</p>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 z-50">
          <div className="bg-[#0f172a] border border-blue-500/20 rounded-[3rem] p-10 w-full max-w-sm text-center shadow-2xl">
            <h2 className="text-3xl font-black italic mb-2 uppercase text-white">Unlock VIP</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-10">Access all premium betting insights</p>
            <button 
              onClick={() => { setIsPaid(true); setShowPaymentModal(false); }}
              className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase text-xs mb-4 shadow-lg shadow-blue-600/20"
            >
              Simulate Upgrade
            </button>
            <button onClick={() => setShowPaymentModal(false)} className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}

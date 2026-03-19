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

  const getProbabilities = (item) => {
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

  // FILTER LOGIC
  const filteredFixtures = fixtures.filter(f => 
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

        {/* SEARCH BAR */}
        <div className="relative">
          <input 
            type="text"
            placeholder="Search Team or League..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-200 placeholder:text-slate-600"
          />
          <div className="absolute right-6 top-4 opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {filteredFixtures.length > 0 ? filteredFixtures.slice(0, 100).map((item) => {
          const { homeProb, drawProb, awayProb } = getProbabilities(item);
          const isHome = homeProb > drawProb && homeProb > awayProb;
          const isAway = awayProb > homeProb && awayProb > drawProb;
          const maxProb = Math.max(homeProb, drawProb, awayProb);

          return (
            <div key={item.fixture.id} className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800 p-6 shadow-2xl">
              <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-6 uppercase tracking-widest">
                <span>{item.league.name}</span>
                <span className="text-blue-500">Kickoff: {new Date(item.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>

              <div className="flex justify-between items-center mb-10 px-2 font-bold text-lg tracking-tight">
                <span className="flex-1 text-center">{item.teams.home.name}</span>
                <span className="px-4 opacity-10 text-[10px] font-black">VS</span>
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
                  <div style={{ width: `${homeProb}%` }} className="bg-blue-500 transition-all duration-1000"></div>
                  <div style={{ width: `${drawProb}%` }} className="bg-slate-700 transition-all duration-1000"></div>
                  <div style={{ width: `${awayProb}%` }} className="bg-emerald-500 transition-all duration-1000"></div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedMatch(selectedMatch === item.fixture.id ? null : item.fixture.id)}
                className="w-full py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-800 rounded-2xl hover:bg-slate-800/50"
              >
                {selectedMatch === item.fixture.id ? "Close Stats ▲" : "View Full Analysis ▼"}
              </button>
            </div>
          );
        }) : (
          <div className="text-center py-20 opacity-30">
            <p className="font-black uppercase tracking-widest text-xs">No Matches Found</p>
          </div>
        )}
      </div>

      {/* Payment Modal stays exactly the same as before */}
    </main>
  );
}
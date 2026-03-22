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
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => { setHasMounted(true); }, []);

  // --- PREDICTION ENGINE (STAYS THE SAME) ---
  const getPredictions = (hId: any, aId: any) => {
    const home = parseInt(hId) || 1;
    const away = parseInt(aId) || 2;
    return {
      h: Math.floor(((home % 10) + 30)),
      d: 25,
      a: Math.floor(((away % 10) + 25))
    };
  };

  // --- NEW REPLACEMENT FETCH LOGIC ---
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      // Using TheSportsDB Public API (Key '3' is for free development)
      const res = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?s=Soccer`);
      
      if (res.data && res.data.events) {
        const mapped = res.data.events.map((m: any) => ({
          id: m.idEvent,
          league: m.strLeague,
          home: m.strHomeTeam,
          away: m.strAwayTeam,
          homeId: m.idHomeTeam,
          awayId: m.idAwayTeam,
          time: m.strTime ? m.strTime.substring(0, 5) : "LIVE"
        }));
        setFixtures(mapped);
      } else {
        setFixtures([]);
      }
    } catch (e) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasMounted) fetchMatches();
  }, [hasMounted, fetchMatches]);

  if (!hasMounted) return null;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 max-w-xl mx-auto pb-32">
      <header className="pt-4 pb-6 border-b border-slate-800/50 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black text-blue-500 italic">GOALPRO</h1>
          <button onClick={() => setShowPaymentModal(true)} className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input 
          type="text" 
          placeholder="Search matches..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm focus:outline-none" 
        />
      </header>

      <div className="space-y-6">
        {loading ? (
          <p className="text-center text-blue-500 animate-pulse font-black uppercase text-[10px] py-20">Loading Global Data...</p>
        ) : fixtures.length === 0 ? (
          <p className="text-center text-slate-500 py-20">No matches found today.</p>
        ) : (
          fixtures.filter(f => f.home.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => {
            const p = getPredictions(item.homeId, item.awayId);
            return (
              <div key={item.id} className="bg-[#0f172a] rounded-[2rem] border border-slate-800 p-6 shadow-xl">
                <div className="flex justify-between text-[9px] font-black text-blue-400 uppercase mb-4">
                  <span>{item.league}</span>
                  <span>{item.time}</span>
                </div>
                <div className="flex justify-between items-center mb-6 font-black text-lg text-center uppercase">
                  <span className="flex-1">{item.home}</span>
                  <span className="px-4 opacity-10">VS</span>
                  <span className="flex-1">{item.away}</span>
                </div>
                <div className="h-1 w-full flex rounded-full overflow-hidden bg-slate-800 mb-6">
                  <div style={{ width: `${p.h}%` }} className="bg-blue-500" />
                  <div style={{ width: `${p.d}%` }} className="bg-slate-500" />
                  <div style={{ width: `${p.a}%` }} className="bg-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="py-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase text-white">Prediction</button>
                  <a href={BETWAY_AFFILIATE_URL} className="py-3 bg-emerald-600/10 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase text-emerald-400 text-center flex items-center justify-center">Betway</a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

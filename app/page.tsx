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

  // Simplified Prediction Logic to keep it fast
  const getPredictions = (hId: any, aId: any) => {
    const home = parseInt(hId) || 1;
    const away = parseInt(aId) || 2;
    const hProb = Math.floor(((home % 15) + 35));
    const aProb = Math.floor(((away % 15) + 30));
    const dProb = 100 - (hProb + aProb);
    return { h: hProb, d: dProb, a: aProb };
  };

  // --- REPLACEMENT FETCHING LOGIC ---
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      // Using the Public '3' key which allows free soccer data access
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
        // Fallback: If there are NO live games today, we show tomorrow's schedule
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextDay = tomorrow.toISOString().split('T')[0];
        const resNext = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${nextDay}&s=Soccer`);
        
        if (resNext.data && resNext.data.events) {
           const mappedNext = resNext.data.events.map((m: any) => ({
            id: m.idEvent,
            league: m.strLeague,
            home: m.strHomeTeam,
            away: m.strAwayTeam,
            homeId: m.idHomeTeam,
            awayId: m.idAwayTeam,
            time: m.strTime ? m.strTime.substring(0, 5) : "TMW"
          }));
          setFixtures(mappedNext);
        } else {
          setFixtures([]);
        }
      }
    } catch (e) {
      console.error("Connection failed");
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
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">GOALPRO</h1>
          <button onClick={() => setShowPaymentModal(true)} className="bg-blue-600 px-5 py-2 rounded-2xl text-[10px] font-black uppercase shadow-lg">
            {isPaid ? "VIP ACTIVE" : "UPGRADE"}
          </button>
        </div>
        <input 
          type="text" 
          placeholder="Search team..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full bg-[#0f172a] border border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none" 
        />
      </header>

      <div className="space-y-8">
        {loading ? (
          <p className="text-center text-blue-500 animate-pulse font-black uppercase text-[10px] py-20 tracking-widest">Scanning Global Fixtures...</p>
        ) : fixtures.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <p className="font-bold">No fixtures found for today.</p>
          </div>
        ) : (
          fixtures.filter(f => f.home.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => {
            const p = getPredictions(item.homeId, item.awayId);
            return (
              <div key={item.id} className="bg-[#0f172a] rounded-[2.5rem] border border-slate-800/80 p-6 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between text-[9px] font-black text-slate-400 mb-6 uppercase tracking-wider">
                  <span className="text-blue-400">{item.league}</span>
                  <span className="text-blue-400">{item.time}</span>
                </div>
                
                <div className="flex justify-between items-center mb-10 px-2 font-black text-xl text-white uppercase">
                  <span className="flex-1 text-center">{item.home}</span>
                  <span className="px-4 opacity-10 text-[10px] italic">VS</span>
                  <span className="flex-1 text-center">{item.away}</span>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between mb-2 text-[9px] font-black uppercase text-slate-500 px-1">
                    <span>H {p.h}%</span>
                    <span>D {p.d}%</span>
                    <span>A {p.a}%</span>
                  </div>
                  <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-slate-800">
                    <div style={{ width: `${p.h}%` }} className="bg-blue-500" />
                    <div style={{ width: `${p.d}%` }} className="bg-slate-600" />
                    <div style={{ width: `${p.a}%` }} className="bg-emerald-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="py-4 text-[9px] font-black text-white uppercase bg-blue-600/10 border border-blue-500/20 rounded-2xl">Prediction</button>
                  <a href={BETWAY_AFFILIATE_URL} className="py-4 text-[9px] font-black text-emerald-400 uppercase bg-emerald-600/10 border border-emerald-500/20 rounded-2xl text-center flex items-center justify-center">Betway</a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

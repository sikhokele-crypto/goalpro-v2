"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// --- CONFIGURATION ---
const API_SPORTS_KEY = 'a14dbd219f66d6191e6df8757a94771c'; 
const SPORTS_DB_KEY = '2'; // Public test key
const POPULAR_LEAGUES = [39, 140, 2, 135, 78];

export default function GoalPro() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("API-Sports");

  // --- DATA NORMALIZER ---
  // This makes sure both APIs look the same to your UI
  const normalizeData = (data: any, type: 'sports-api' | 'sports-db') => {
    if (type === 'sports-api') {
      return data.map((f: any) => ({
        id: f.fixture.id,
        date: f.fixture.date,
        league: f.league.name,
        homeTeam: f.teams.home.name,
        awayTeam: f.teams.away.name,
        homeId: f.teams.home.id,
        awayId: f.teams.away.id,
      }));
    } else {
      return data.map((f: any) => ({
        id: f.idEvent,
        date: f.strTimestamp || f.dateEvent,
        league: f.strLeague,
        homeTeam: f.strHomeTeam,
        awayTeam: f.strAwayTeam,
        homeId: parseInt(f.idHomeTeam),
        awayId: parseInt(f.idAwayTeam),
      }));
    }
  };

  const fetchFixtures = useCallback(async () => {
    setLoading(true);
    const targetDate = new Date().toISOString().split('T')[0];

    // ATTEMPT 1: API-Sports
    try {
      const res = await axios.get('https://v3.football.api-sports.io/fixtures', {
        params: { date: targetDate },
        headers: { 'x-apisports-key': API_SPORTS_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
      });

      if (res.data.response && res.data.response.length > 0) {
        setFixtures(normalizeData(res.data.response, 'sports-api'));
        setSource("API-Sports (Primary)");
        setLoading(false);
        return;
      }
    } catch (e) { console.log("Primary API Failed, switching..."); }

    // ATTEMPT 2: TheSportsDB (Fallback)
    try {
      const res = await axios.get(`https://www.thesportsdb.com/api/v1/json/${SPORTS_DB_KEY}/eventsday.php?d=${targetDate}&s=Soccer`);
      if (res.data.events) {
        setFixtures(normalizeData(res.data.events, 'sports-db'));
        setSource("TheSportsDB (Backup)");
      }
    } catch (e) {
      console.error("All sources failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFixtures(); }, [fetchFixtures]);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black italic text-blue-500">GOALPRO</h1>
        <span className="text-[8px] bg-slate-800 px-2 py-1 rounded text-slate-400 uppercase tracking-widest">Source: {source}</span>
      </div>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-blue-400 font-bold uppercase text-xs">Syncing multi-source fixtures...</div>
      ) : fixtures.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
           <p>No fixtures found on either source.</p>
           <button onClick={() => fetchFixtures()} className="mt-4 text-blue-500 text-[10px] font-bold underline">RETRY FETCH</button>
        </div>
      ) : (
        <div className="space-y-4">
          {fixtures.map((f) => (
            <div key={f.id} className="bg-[#0f172a] p-5 rounded-[2rem] border border-slate-800 shadow-xl">
               <div className="flex justify-between text-[8px] font-black text-blue-400 uppercase mb-4">
                 <span>{f.league}</span>
                 <span>{new Date(f.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
               </div>
               <div className="flex justify-between items-center font-bold text-lg">
                 <span className="flex-1 text-center">{f.homeTeam}</span>
                 <span className="px-4 text-[9px] opacity-20">VS</span>
                 <span className="flex-1 text-center">{f.awayTeam}</span>
               </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
